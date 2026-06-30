const prisma = require('../config/database');
const { generateTxHash } = require('../utils/helpers');

exports.castVote = async (req, res) => {
  try {
    const { electionId, candidateId, quantity = 1, paymentId } = req.body;
    const userId = req.user.id;

    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election || election.status !== 'ACTIVE' || new Date() > election.endDate) {
      return res.status(400).json({ error: 'Election is not active or has ended' });
    }

    if (election.maxVoters && election.maxVoters > 0) {
      const totalVotesAfter = election.totalVotes + quantity;
      if (totalVotesAfter > election.maxVoters) {
        return res.status(400).json({ error: `Voter limit exceeded. Only ${election.maxVoters - election.totalVotes} votes remaining.` });
      }
    }

    // ────────────── FREE ELECTION ──────────────
    if (election.votePrice === 0) {
      const existing = await prisma.vote.findFirst({
        where: { userId, electionId },
      });
      if (existing) {
        return res.status(400).json({ error: 'You have already voted in this free election' });
      }
      const finalQuantity = 1;
      const candidate = await prisma.candidate.findFirst({
        where: { id: candidateId, electionId, status: 'APPROVED' },
        include: { user: true },
      });
      if (!candidate) return res.status(400).json({ error: 'Invalid candidate' });

      const txHash = generateTxHash();
      await prisma.$transaction(async (tx) => {
        await tx.vote.create({
          data: {
            userId,
            electionId,
            candidateId,
            quantity: finalQuantity,
            txHash,
            isAnonymous: req.user.anonymousMode,
          },
        });
        await tx.candidate.update({
          where: { id: candidateId },
          data: { votesReceived: { increment: finalQuantity } },
        });
        await tx.election.update({
          where: { id: electionId },
          data: { totalVotes: { increment: finalQuantity } },
        });
      });

      // Notify the voter
      await prisma.notification.create({
        data: {
          userId,
          title: 'Vote Confirmed',
          message: `Your vote for "${candidate.user.firstName} ${candidate.user.lastName}" in "${election.title}" has been recorded.`,
          type: 'VOTE_CONFIRMED',
        },
      });

      // 🔔 Notify all admins (candidate is defined here)
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      if (admins.length > 0) {
        const candidateName = `${candidate.user.firstName} ${candidate.user.lastName}`;
        await prisma.notification.createMany({
          data: admins.map(admin => ({
            userId: admin.id,
            title: 'New Vote Cast',
            message: `A vote was cast for "${candidateName}" in election "${election.title}".`,
            type: 'VOTE_CONFIRMED',
            link: '/admin/votes',
          })),
        });
      }

      await prisma.auditLog.create({
        data: {
          userId,
          event: 'VOTE_CAST',
          details: `${electionId}/${candidateId}`,
          ipAddress: req.ip,
          result: 'OK',
        },
      });

      return res.status(201).json({ message: 'Vote cast successfully', txHash });
    }

    // ────────────── PAID ELECTION ──────────────
    if (!paymentId) {
      return res.status(400).json({ error: 'Payment required for paid election' });
    }
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId, userId, status: 'COMPLETED' },
    });
    if (!payment) {
      return res.status(400).json({ error: 'Invalid or unpaid payment' });
    }
    const existingVoteForPayment = await prisma.vote.findFirst({
      where: { paymentId },
    });
    if (existingVoteForPayment) {
      return res.status(400).json({ error: 'This payment has already been used to cast votes.' });
    }

    const expectedAmount = election.votePrice * quantity;
    if (payment.amount !== expectedAmount) {
      return res.status(400).json({ error: 'Payment amount does not match vote quantity' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }
    const candidate = await prisma.candidate.findFirst({
      where: { id: candidateId, electionId, status: 'APPROVED' },
      include: { user: true },
    });
    if (!candidate) return res.status(400).json({ error: 'Invalid candidate' });

    const txHash = generateTxHash();
    await prisma.$transaction(async (tx) => {
      await tx.vote.create({
        data: {
          userId,
          electionId,
          candidateId,
          quantity,
          txHash,
          isAnonymous: req.user.anonymousMode,
          paymentId,
        },
      });
      await tx.candidate.update({
        where: { id: candidateId },
        data: { votesReceived: { increment: quantity } },
      });
      await tx.election.update({
        where: { id: electionId },
        data: { totalVotes: { increment: quantity } },
      });
    });

    // Notify the voter
    await prisma.notification.create({
      data: {
        userId,
        title: 'Vote(s) Confirmed',
        message: `${quantity} vote(s) for "${candidate.user.firstName} ${candidate.user.lastName}" in "${election.title}" have been recorded.`,
        type: 'VOTE_CONFIRMED',
      },
    });

    // 🔔 Notify all admins (candidate is defined here)
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      const candidateName = `${candidate.user.firstName} ${candidate.user.lastName}`;
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          title: 'New Vote Cast',
          message: `${quantity} vote(s) were cast for "${candidateName}" in election "${election.title}".`,
          type: 'VOTE_CONFIRMED',
          link: '/admin/votes',
        })),
      });
    }

    await prisma.auditLog.create({
      data: {
        userId,
        event: 'VOTE_CAST',
        details: `${electionId}/${candidateId} x${quantity}`,
        ipAddress: req.ip,
        result: 'OK',
      },
    });

    res.status(201).json({ message: `${quantity} vote(s) cast successfully`, txHash });
  } catch (err) {
    console.error('Cast vote error:', err);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
};

// ─── GET RESULTS ────────────────────────────────────────────────
exports.getResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await prisma.election.findUnique({
      where: { id: electionId },
      include: {
        candidates: {
          where: { status: 'APPROVED' },
          orderBy: { votesReceived: 'desc' },
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
    });
    if (!election) return res.status(404).json({ error: 'Election not found' });

    const total = election.totalVotes || 1;
    const results = election.candidates.map((c, idx) => ({
      rank: idx + 1,
      id: c.id,
      name: `${c.user.firstName} ${c.user.lastName}`,
      avatarUrl: c.user.avatarUrl,
      party: c.party,
      votes: c.votesReceived,
      percentage: ((c.votesReceived / total) * 100).toFixed(1),
    }));
    res.json({
      election: {
        id: election.id,
        title: election.title,
        status: election.status,
        totalVotes: election.totalVotes,
      },
      results,
    });
  } catch (err) {
    console.error('Get results error:', err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};

// ─── CHECK IF USER VOTED ──────────────────────────────────────
exports.checkVoted = async (req, res) => {
  try {
    const { electionId } = req.params;
    const vote = await prisma.vote.findFirst({
      where: { userId: req.user.id, electionId },
    });
    res.json({ hasVoted: !!vote });
  } catch (err) {
    console.error('Check voted error:', err);
    res.status(500).json({ error: 'Check failed' });
  }
};

// ─── GET ALL RESULTS (for results page) ──────────────────────
exports.getAllResults = async (req, res) => {
  try {
    const elections = await prisma.election.findMany({
      where: { status: { in: ['ENDED', 'ACTIVE'] } },
      include: {
        candidates: {
          where: { status: 'APPROVED' },
          orderBy: { votesReceived: 'desc' },
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
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
        candidates: e.candidates.map(c => ({
          id: c.id,
          name: `${c.user.firstName} ${c.user.lastName}`,
          party: c.party,
          votesReceived: c.votesReceived,
          avatarUrl: c.user.avatarUrl,
        })),
      };
    });

    res.json({ results });
  } catch (err) {
    console.error('Get all results error:', err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};