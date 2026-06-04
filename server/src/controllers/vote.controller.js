const prisma = require('../config/database');
const { generateTxHash } = require('../utils/helpers');

exports.castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const userId = req.user.id;

    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election || election.status !== 'ACTIVE' || new Date() > election.endDate) {
      return res.status(400).json({ error: 'Election is not active or has ended' });
    }

    const existing = await prisma.vote.findUnique({
      where: { userId_electionId: { userId, electionId } },
    });
    if (existing) return res.status(400).json({ error: 'Already voted' });

    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, electionId, status: 'APPROVED' },
    });
    if (!candidate) return res.status(400).json({ error: 'Invalid candidate' });

    const txHash = generateTxHash();
    const vote = await prisma.$transaction(async (tx) => {
      const v = await tx.vote.create({
        data: { userId, electionId, candidateId, txHash, isAnonymous: req.user.anonymousMode },
      });
      await tx.candidate.update({ where: { id: candidateId }, data: { votesReceived: { increment: 1 } } });
      await tx.election.update({ where: { id: electionId }, data: { totalVotes: { increment: 1 } } });
      return v;
    });

    await prisma.notification.create({
      data: { userId, title: 'Vote Confirmed', message: `Vote in "${election.title}" recorded.`, type: 'VOTE_CONFIRMED' },
    });
    await prisma.auditLog.create({
      data: { userId, event: 'VOTE_CAST', details: `${electionId}/${candidateId}`, ipAddress: req.ip, result: 'OK' },
    });

    res.status(201).json({ message: 'Vote cast', txHash });
  } catch (err) {
    res.status(500).json({ error: 'Vote failed' });
  }
};

exports.getResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: {
        candidates: {
          where: { status: 'APPROVED' },
          orderBy: { votesReceived: 'desc' },
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });
    if (!election) return res.status(404).json({ error: 'Election not found' });

    const total = election.totalVotes || 1;
    const results = election.candidates.map((c, idx) => ({
      rank: idx + 1,
      name: `${c.user.firstName} ${c.user.lastName}`,
      votes: c.votesReceived,
      percentage: ((c.votesReceived / total) * 100).toFixed(1),
    }));
    res.json({ election: { id: election.id, title: election.title, status: election.status, totalVotes: election.totalVotes }, results });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

exports.checkVoted = async (req, res) => {
  try {
    const vote = await prisma.vote.findUnique({
      where: { userId_electionId: { userId: req.user.id, electionId: req.params.electionId } },
    });
    res.json({ hasVoted: !!vote });
  } catch (err) {
    res.status(500).json({ error: 'Check failed' });
  }
};

exports.getAllResults = async (req, res) => {
  try {
    const elections = await prisma.election.findMany({
      where: { status: { in: ['ENDED', 'ACTIVE'] } },
      include: {
        candidates: {
          where: { status: 'APPROVED' },
          orderBy: { votesReceived: 'desc' },
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { endDate: 'desc' },
    });

    const results = elections.map((e) => {
      const winnerCandidate = e.candidates[0];
      const winner = winnerCandidate
        ? `${winnerCandidate.user.firstName} ${winnerCandidate.user.lastName}`
        : 'No winner';
      const totalVotes = e.totalVotes || 0;
      const maxVoters = e.maxVoters || totalVotes || 1;
      const percentage = Math.round((totalVotes / maxVoters) * 100);

      return {
        id: e.id,
        title: e.title,
        category: e.category,
        winner,
        votes: totalVotes,
        total: maxVoters,
        percentage,
        status: e.status,
      };
    });

    res.json({ results });
  } catch (err) {
    console.error('getAllResults error:', err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};