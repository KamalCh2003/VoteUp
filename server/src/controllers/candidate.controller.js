// controllers/candidate.controller.js
const prisma = require('../config/database');
const { createAuditLog } = require('../utils/audit');

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds} sec ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour ago`;
  const days = Math.floor(hours / 24);
  return `${days} day ago`;
}

exports.apply = async (req, res) => {
  try {
    const { electionId, party, slogan, bio } = req.body;
    const userId = req.user.id;

    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election || election.status !== 'UPCOMING')
      return res.status(400).json({ error: 'Election not open for applications' });

    const existingInSameElection = await prisma.candidate.findFirst({
      where: { userId, electionId, status: { in: ['PENDING', 'APPROVED'] } },
    });
    if (existingInSameElection) {
      return res.status(400).json({ error: 'You already have an active or pending application for this election' });
    }

    const approvedCount = await prisma.candidate.count({
      where: { electionId, status: 'APPROVED' },
    });
    if (election.maxCandidates && approvedCount >= election.maxCandidates) {
      return res.status(400).json({ error: `Candidate limit reached for this election (max ${election.maxCandidates})` });
    }

    const existingCandidatesCount = await prisma.candidate.count({
      where: { electionId },
    });
    const sequence = String(existingCandidatesCount + 1).padStart(2, '0');
    const electionShortId = electionId.slice(0, 6);
    const generatedCandidateNumber = `CN-${electionShortId}-${sequence}`;

    const avatarUrl = req.file ? req.file.path : null;
    const candidate = await prisma.candidate.create({
      data: {
        userId,
        electionId,
        candidateNumber: generatedCandidateNumber,
        party,
        slogan,
        bio,
        avatarUrl,
        status: 'PENDING',
      },
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const candidateName = `${req.user.firstName} ${req.user.lastName}`;
      const candidateEmail = req.user.email;
      const electionTitle = election.title;
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          title: 'New Candidate Application',
          message: `${candidateName} (${candidateEmail}) has applied for "${electionTitle}". Please review.`,
          type: 'CANDIDACY_UPDATE',
          link: '/admin/candidates',
        })),
      });
    }

    // Audit log
    await createAuditLog({
      userId: req.user.id,
      event: 'CANDIDACY_APPLIED',
      details: `Applied as candidate for election ${electionId} with party "${party || 'Independent'}"`,
      ipAddress: getClientIp(req),
      result: 'OK',
    });

    res.status(201).json({ candidate });
  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ error: 'Application failed' });
  }
};

exports.getMyCandidacy = async (req, res) => {
  try {
    const candidate = await prisma.candidate.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { election: true },
    });
    res.json({ candidate });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch candidacy' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { slogan, bio, manifesto, websiteUrl, twitterHandle, instagramHandle } = req.body;

    const existing = await prisma.candidate.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (!existing) {
      return res.status(404).json({ error: 'Candidate profile not found. You must apply first.' });
    }

    let avatarUrl = existing.avatarUrl;
    if (req.file) {
      avatarUrl = req.file.path;
    }

    const candidate = await prisma.candidate.update({
      where: { id: existing.id },
      data: {
        ...(slogan !== undefined && { slogan }),
        ...(bio !== undefined && { bio }),
        ...(manifesto !== undefined && { manifesto }),
        ...(websiteUrl !== undefined && { websiteUrl }),
        ...(twitterHandle !== undefined && { twitterHandle }),
        ...(instagramHandle !== undefined && { instagramHandle }),
        ...(req.file && { avatarUrl }),
      },
    });

    // 🔐 Audit log
    await createAuditLog({
      userId: req.user.id,
      event: 'CANDIDATE_PROFILE_UPDATED',
      details: `Updated candidate profile for election ${candidate.electionId}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      result: 'OK',
    });

    res.json({ candidate });
  } catch (err) {
    console.error('Update candidate profile error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const candidate = await prisma.candidate.findFirst({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { election: true },
    });
    if (!candidate) return res.status(404).json({ error: 'Not a candidate' });

    const totalVotes = candidate.election.totalVotes;
    const share = totalVotes > 0 ? ((candidate.votesReceived / totalVotes) * 100).toFixed(1) : 0;
    res.json({ votesReceived: candidate.votesReceived, totalVotes, share });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load analytics' });
  }
};

exports.getDetailedAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const candidate = await prisma.candidate.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { election: true },
    });
    if (!candidate) return res.status(404).json({ error: 'Not a candidate' });

    const totalVotes = candidate.election.totalVotes || 0;
    const share = totalVotes > 0 ? ((candidate.votesReceived / totalVotes) * 100).toFixed(1) : 0;

    let startDate = new Date(candidate.election.startDate);
    let endDate = new Date(candidate.election.endDate);
    const now = new Date();
    if (endDate > now) endDate = now;

    const dateMap = new Map();
    const current = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));
    const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59, 999));

    while (current <= end) {
      const year = current.getUTCFullYear();
      const month = String(current.getUTCMonth() + 1).padStart(2, '0');
      const day = String(current.getUTCDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      dateMap.set(key, 0);
      current.setUTCDate(current.getUTCDate() + 1);
    }

    const votes = await prisma.vote.findMany({
      where: {
        candidateId: candidate.id,
        votedAt: { gte: startDate, lte: endDate },
      },
      select: { votedAt: true, quantity: true },
    });

    votes.forEach(v => {
      const d = new Date(v.votedAt);
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      if (dateMap.has(key)) {
        dateMap.set(key, dateMap.get(key) + (v.quantity || 1));
      }
    });

    const voteTrend = Array.from(dateMap.entries())
      .map(([date, votes]) => ({ date, votes }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const supporterVotes = await prisma.vote.findMany({
      where: { candidateId: candidate.id },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    const supporterMap = new Map();
    supporterVotes.forEach(v => {
      const fullName = `${v.user.firstName} ${v.user.lastName}`;
      const qty = v.quantity || 1;
      supporterMap.set(fullName, (supporterMap.get(fullName) || 0) + qty);
    });
    const topSupporters = Array.from(supporterMap.entries())
      .map(([name, votes]) => ({ name, votes }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 10);

    const recentVotes = await prisma.vote.findMany({
      where: { candidateId: candidate.id },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { votedAt: 'desc' },
      take: 5,
    });
    const recentActivity = recentVotes.map(v => ({
      action: 'Vote received',
      from: `${v.user.firstName} ${v.user.lastName}`,
      time: timeAgo(v.votedAt),
    }));

    res.json({
      votesReceived: candidate.votesReceived,
      totalVotes,
      share,
      voteTrend,
      topSupporters,
      recentActivity,
      electionStatus: candidate.election.status,
    });
  } catch (err) {
    console.error('Detailed analytics error:', err);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const candidates = await prisma.candidate.findMany({
      where: { userId },
      include: { election: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ history: candidates });
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};