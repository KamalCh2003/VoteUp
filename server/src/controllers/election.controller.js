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
      include: {
        _count: {
          select: { candidates: true, votes: true },
        },
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
    } = req.body;

    const parsedMaxCandidates = parseInt(maxCandidates, 10) || 10;
    const parsedMaxVoters = maxVoters ? parseInt(maxVoters, 10) : null;
    const parsedVotePrice = parseInt(votePrice, 10) || 100;

    if (parsedMaxCandidates < 1) {
      return res.status(400).json({ error: 'Max candidates must be at least 1' });
    }
    if (parsedMaxVoters !== null && parsedMaxVoters < 0) {
      return res.status(400).json({ error: 'Max voters cannot be negative' });
    }
    if (parsedVotePrice < 0) {
      return res.status(400).json({ error: 'Vote price cannot be negative' });
    }

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
        rules,
        organizerName,
        organizerEmail,
        organizerPhone,
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

    if (maxCandidates !== undefined) {
      const newMax = parseInt(maxCandidates, 10);
      if (newMax < 1) return res.status(400).json({ error: 'Max candidates must be at least 1' });
      const currentCandidateCount = await prisma.candidate.count({ where: { electionId: id } });
      if (newMax < currentCandidateCount) {
        return res.status(400).json({ error: `Cannot reduce max candidates below current candidate count (${currentCandidateCount})` });
      }
    }
    if (maxVoters !== undefined) {
      const newMax = maxVoters ? parseInt(maxVoters, 10) : null;
      if (newMax !== null && newMax < 0) return res.status(400).json({ error: 'Max voters cannot be negative' });
      if (newMax !== null && newMax < current.totalVotes) {
        return res.status(400).json({ error: `Cannot reduce max voters below current total votes (${current.totalVotes})` });
      }
    }
    if (votePrice !== undefined) {
      const newPrice = parseInt(votePrice, 10);
      if (newPrice < 0) return res.status(400).json({ error: 'Vote price cannot be negative' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (maxCandidates !== undefined) updateData.maxCandidates = parseInt(maxCandidates, 10);
    if (maxVoters !== undefined) updateData.maxVoters = maxVoters ? parseInt(maxVoters, 10) : null;
    if (votePrice !== undefined) updateData.votePrice = parseInt(votePrice, 10);
    if (rules !== undefined) updateData.rules = rules;
    if (organizerName !== undefined) updateData.organizerName = organizerName;
    if (organizerEmail !== undefined) updateData.organizerEmail = organizerEmail;
    if (organizerPhone !== undefined) updateData.organizerPhone = organizerPhone;
    if (status !== undefined) updateData.status = status;

    const election = await prisma.election.update({
      where: { id },
      data: updateData,
    });
    res.json({ election });
  } catch (err) {
    console.error('Election update error:', err);
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

exports.requestElection = async (req, res) => {
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
    } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ error: 'Title, start date, and end date are required.' });
    }

    const parsedStart = new Date(startDate);
    const parsedEnd = new Date(endDate);
    if (isNaN(parsedStart.getTime()) || isNaN(parsedEnd.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }
    if (parsedEnd <= parsedStart) {
      return res.status(400).json({ error: 'End date must be after start date.' });
    }

    const election = await prisma.election.create({
      data: {
        title,
        description,
        category: category || 'General',
        startDate: parsedStart,
        endDate: parsedEnd,
        maxCandidates: parseInt(maxCandidates) || 10,
        maxVoters: maxVoters ? parseInt(maxVoters) : null,
        votePrice: parseInt(votePrice) || 0,
        rules: rules || null,
        organizerName: organizerName || null,
        organizerEmail: organizerEmail || null,
        organizerPhone: organizerPhone || null,
        createdBy: req.user.id,
        status: 'PENDING',  // <-- changed from PENDING_ADMIN
      },
    });

    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          title: 'New Election Request',
          message: `"${title}" has been requested by ${req.user.firstName} ${req.user.lastName}. Please review.`,
          type: 'SYSTEM_ALERT',
          link: `/admin/elections?status=PENDING`,
        })),
      });
    }

    res.status(201).json({ election });
  } catch (err) {
    console.error('Election request error:', err);
    res.status(500).json({ error: 'Failed to submit election request' });
  }
};

// ─── Admin functions for PENDING status ──────────────────────────────────

exports.getElectionsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    if (!status) return res.status(400).json({ error: 'Status query parameter is required' });
    const elections = await prisma.election.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { candidates: true, votes: true } },
        candidates: {
          where: { status: 'APPROVED' },
          select: { id: true },
        },
      },
    });
    const formatted = elections.map(e => ({
      ...e,
      approvedCandidates: e.candidates.length,
    }));
    res.json({ elections: formatted });
  } catch (err) {
    console.error('Get elections by status error:', err);
    res.status(500).json({ error: 'Failed to fetch elections' });
  }
};

exports.approveElection = async (req, res) => {
  try {
    const { id } = req.params;
    const election = await prisma.election.findUnique({ where: { id } });
    if (!election) return res.status(404).json({ error: 'Election not found' });
    if (election.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only pending requests can be approved' });
    }

    const updated = await prisma.election.update({
      where: { id },
      data: { status: 'UPCOMING' },
    });

    await prisma.notification.create({
      data: {
        userId: election.createdBy,
        title: 'Election Request Approved 🎉',
        message: `Your election "${election.title}" has been approved and is now upcoming.`,
        type: 'SYSTEM_ALERT',
        link: `/elections/${election.id}`,
      },
    });

    res.json({ election: updated });
  } catch (err) {
    console.error('Approve election error:', err);
    res.status(500).json({ error: 'Failed to approve election' });
  }
};

exports.rejectElection = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;
    const election = await prisma.election.findUnique({ where: { id } });
    if (!election) return res.status(404).json({ error: 'Election not found' });
    if (election.status !== 'PENDING') {
      return res.status(400).json({ error: 'Only pending requests can be rejected' });
    }

    const updated = await prisma.election.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await prisma.notification.create({
      data: {
        userId: election.createdBy,
        title: 'Election Request Declined',
        message: rejectionReason
          ? `Your election "${election.title}" was not approved. Reason: ${rejectionReason}`
          : `Your election "${election.title}" was not approved.`,
        type: 'SYSTEM_ALERT',
      },
    });

    res.json({ election: updated });
  } catch (err) {
    console.error('Reject election error:', err);
    res.status(500).json({ error: 'Failed to reject election' });
  }
};