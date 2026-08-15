const prisma = require('../config/database');
const { createAuditLog } = require('../utils/audit');

exports.getAll = async (req, res) => {
  try {
    await prisma.election.updateMany({
      where: { status: 'ACTIVE', endDate: { lte: new Date() } },
      data: { status: 'ENDED' },
    });

    const { status, category, limit } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const elections = await prisma.election.findMany({
      where,
      take: limit ? parseInt(limit) : 20,
      orderBy: { startDate: 'desc' },
      include: {
        _count: { select: { candidates: true, votes: true } },
        candidates: {
          where: { status: 'APPROVED' },
          select: { id: true },
        },
      },
    });

    const formatted = elections.map(election => ({
      ...election,
      approvedCandidates: election.candidates.length,
      candidates: undefined,
    }));

    res.json({ elections: formatted });
  } catch (err) {
    console.error('Fetch elections error:', err);
    res.status(500).json({ error: 'Failed to fetch elections' });
  }
};

exports.getById = async (req, res) => {
  try {
    const election = await prisma.election.findUnique({
      where: { id: req.params.id },
      include: {
        candidates: {
          where: { status: 'APPROVED' },
          include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        },
      },
    });
    if (!election) return res.status(404).json({ error: 'Election not found' });
    res.json({ election });
  } catch (err) {
    console.error('Fetch election error:', err);
    res.status(500).json({ error: 'Failed to fetch election' });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      startDate,
      endDate,
      maxCandidates,
      maxVoters,
      votePrice,
      rules,
      organizerName,
      organizerEmail,
      organizerPhone,
      maxVotesPerUser,
    } = req.body;

    const parsedMaxCandidates = parseInt(maxCandidates, 10) || 10;

    let parsedMaxVoters = null;
    if (maxVoters !== undefined && maxVoters !== null && maxVoters !== '') {
      parsedMaxVoters = parseInt(maxVoters, 10);
      if (isNaN(parsedMaxVoters) || parsedMaxVoters < 0) {
        return res.status(400).json({ error: 'Max voters must be a non-negative integer' });
      }
    }

    let parsedVotePrice = 100;
    if (votePrice !== undefined && votePrice !== null && votePrice !== '') {
      parsedVotePrice = parseInt(votePrice, 10);
      if (isNaN(parsedVotePrice) || parsedVotePrice < 0) {
        return res.status(400).json({ error: 'Vote price must be a non-negative integer' });
      }
    }

    // Parse and validate max votes per user (single/multiple choice)
    let parsedMaxVotesPerUser = 1;
    if (maxVotesPerUser !== undefined && maxVotesPerUser !== null && maxVotesPerUser !== '') {
      parsedMaxVotesPerUser = parseInt(maxVotesPerUser, 10);
      if (isNaN(parsedMaxVotesPerUser) || parsedMaxVotesPerUser < 1) {
        return res.status(400).json({ error: 'Max votes per user must be at least 1' });
      }
    }

    if (parsedMaxCandidates < 1) {
      return res.status(400).json({ error: 'Max candidates must be at least 1' });
    }
    if (parsedMaxVotesPerUser > parsedMaxCandidates) {
      return res.status(400).json({ error: 'Max votes per user cannot exceed max candidates' });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ error: 'Invalid start or end date' });
    }

    let bannerUrl = null;
    if (req.file) {
      bannerUrl = req.file.path;
    }

    const election = await prisma.election.create({
      data: {
        title,
        description,
        category,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        maxCandidates: parsedMaxCandidates,
        maxVoters: parsedMaxVoters,
        votePrice: parsedVotePrice,
        rules,
        organizerName,
        organizerEmail,
        organizerPhone,
        bannerUrl,
        maxVotesPerUser: parsedMaxVotesPerUser,
        createdBy: req.user.id,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      event: 'ELECTION_CREATED',
      details: `Created election "${election.title}" (ID: ${election.id})`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      result: 'OK',
    });

    res.status(201).json({ election });
  } catch (err) {
    console.error('Election creation error:', err);
    res.status(500).json({ error: 'Failed to create election' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      startDate,
      endDate,
      maxCandidates,
      maxVoters,
      votePrice,
      rules,
      organizerName,
      organizerEmail,
      organizerPhone,
      status,
      maxVotesPerUser,
    } = req.body;

    const current = await prisma.election.findUnique({ where: { id } });
    if (!current) return res.status(404).json({ error: 'Election not found' });

    if (status === 'ENDED' && current.status !== 'ENDED') {
      const now = new Date();
      if (now < new Date(current.endDate)) {
        return res.status(400).json({
          error: `Cannot end election before its scheduled end date (${new Date(current.endDate).toLocaleString()}).`,
        });
      }
    }

    if (status === 'ACTIVE' && current.status !== 'ACTIVE') {
      const approvedCandidateCount = await prisma.candidate.count({
        where: { electionId: id, status: 'APPROVED' },
      });
      if (current.maxCandidates && approvedCandidateCount < current.maxCandidates) {
        return res.status(400).json({
          error: `Cannot activate election. Only ${approvedCandidateCount} out of ${current.maxCandidates} candidates are approved. Please approve more candidates or reduce the candidate limit.`,
        });
      }
    }

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);

    if (maxCandidates !== undefined) {
      const newMax = parseInt(maxCandidates, 10);
      if (newMax < 1) return res.status(400).json({ error: 'Max candidates must be at least 1' });
      const currentCandidateCount = await prisma.candidate.count({ where: { electionId: id } });
      if (newMax < currentCandidateCount) {
        return res.status(400).json({ error: `Cannot reduce max candidates below current candidate count (${currentCandidateCount})` });
      }
      updateData.maxCandidates = newMax;
    }

    if (maxVoters !== undefined) {
      let newMax = null;
      if (maxVoters !== null && maxVoters !== '') {
        newMax = parseInt(maxVoters, 10);
        if (isNaN(newMax) || newMax < 0) {
          return res.status(400).json({ error: 'Max voters must be a non-negative integer' });
        }
        if (newMax < current.totalVotes) {
          return res.status(400).json({ error: `Cannot reduce max voters below current total votes (${current.totalVotes})` });
        }
      }
      updateData.maxVoters = newMax;
    }

    if (votePrice !== undefined) {
      if (votePrice === null || votePrice === '') {
        return res.status(400).json({ error: 'Vote price cannot be empty' });
      }
      const newPrice = parseInt(votePrice, 10);
      if (isNaN(newPrice) || newPrice < 0) {
        return res.status(400).json({ error: 'Vote price must be a non-negative integer' });
      }
      updateData.votePrice = newPrice;
    }

    // Update max votes per user with validation against current or new maxCandidates
    if (maxVotesPerUser !== undefined) {
      if (maxVotesPerUser === null || maxVotesPerUser === '') {
        return res.status(400).json({ error: 'Max votes per user cannot be empty' });
      }
      const newMaxVotes = parseInt(maxVotesPerUser, 10);
      if (isNaN(newMaxVotes) || newMaxVotes < 1) {
        return res.status(400).json({ error: 'Max votes per user must be at least 1' });
      }
      // Use the new maxCandidates if provided, otherwise current
      const maxCand = maxCandidates !== undefined ? parseInt(maxCandidates, 10) : current.maxCandidates;
      if (newMaxVotes > maxCand) {
        return res.status(400).json({ error: 'Max votes per user cannot exceed max candidates' });
      }
      updateData.maxVotesPerUser = newMaxVotes;
    }

    if (rules !== undefined) updateData.rules = rules;
    if (organizerName !== undefined) updateData.organizerName = organizerName;
    if (organizerEmail !== undefined) updateData.organizerEmail = organizerEmail;
    if (organizerPhone !== undefined) updateData.organizerPhone = organizerPhone;
    if (status !== undefined) updateData.status = status;
    if (req.file) updateData.bannerUrl = req.file.path;

    const election = await prisma.election.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      userId: req.user.id,
      event: 'ELECTION_UPDATED',
      details: `Updated election "${election.title}" (ID: ${election.id})`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      result: 'OK',
    });

    res.json({ election });
  } catch (err) {
    console.error('Election update error:', err);
    res.status(500).json({ error: 'Failed to update election' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await prisma.election.findUnique({ where: { id } });
    if (!election) return res.status(404).json({ error: 'Election not found' });

    await prisma.election.delete({ where: { id } });

    await createAuditLog({
      userId: req.user.id,
      event: 'ELECTION_DELETED',
      details: `Deleted election "${election.title}" (ID: ${election.id})`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      result: 'OK',
    });

    res.json({ message: 'Election deleted' });
  } catch (err) {
    console.error('Delete election error:', err);
    res.status(500).json({ error: 'Failed to delete election' });
  }
};