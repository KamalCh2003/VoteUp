const prisma = require('../config/database');

exports.getAll = async (req, res) => {
  try {
    const { status, category, limit } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const elections = await prisma.election.findMany({
      where,
      take: limit ? parseInt(limit) : 20,
      orderBy: { startDate: 'desc' },
      include: { _count: { select: { candidates: true, votes: true } } },
    });
    res.json({ elections });
  } catch (err) {
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
    } = req.body;

    // Parse integers with defaults
    const parsedMaxCandidates = parseInt(maxCandidates, 10) || 10;
    const parsedMaxVoters = maxVoters ? parseInt(maxVoters, 10) : null;  // null = unlimited
    const parsedVotePrice = parseInt(votePrice, 10) || 100;

    // Parse dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ error: 'Invalid start or end date' });
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
        createdBy: req.user.id,
      },
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
    const data = req.body;
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const election = await prisma.election.update({ where: { id }, data });
    res.json({ election });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update election' });
  }
};

exports.delete = async (req, res) => {
  try {
    await prisma.election.delete({ where: { id: req.params.id } });
    res.json({ message: 'Election deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete election' });
  }
};