const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const catchAsync = require('../utils/catchAsync');

const getDashboardStats = catchAsync(async (req, res) => {
  const [totalUsers, activeElections, totalVotes, totalCandidates] = await Promise.all([
    prisma.user.count(),
    prisma.election.count({ where: { status: 'ACTIVE' } }),
    prisma.vote.count(),
    prisma.candidate.count(),
  ]);

  return res.json({
    success: true,
    data: { totalUsers, activeElections, totalVotes, totalCandidates },
  });
});

const getAuditLogs = catchAsync(async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { user: { select: { name: true, email: true } } },
  });
  return res.json({ success: true, data: logs });
});

const createCandidate = catchAsync(async (req, res) => {
  const { name, party, description, electionId } = req.body;
  const imageUrl = req.file ? req.file.path : undefined;

  const candidate = await prisma.candidate.create({
    data: { name, party, description, imageUrl, electionId },
  });

  return res.status(201).json({ success: true, data: candidate });
});

module.exports = { getDashboardStats, getAuditLogs, createCandidate };