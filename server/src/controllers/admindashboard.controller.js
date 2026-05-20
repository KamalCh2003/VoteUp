const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

// user management
const getAllUsers = catchAsync(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      candidateProfile: { select: { contestantId: true } },
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: users });
});

const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { candidateProfile: true, votes: true },
  });
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, data: user });
});

const updateUserRole = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['VOTER', 'CANDIDATE', 'ADMIN'].includes(role)) {
    throw new ApiError(400, 'Invalid role');
  }
  const user = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json({ success: true, data: user });
});

const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({ where: { id } });
  res.json({ success: true, message: 'User deleted successfully' });
});

// election management
const getAllElections = catchAsync(async (req, res) => {
  const elections = await prisma.election.findMany({
    include: {
      _count: { select: { candidates: true, votes: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: elections });
});

const getElectionById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const election = await prisma.election.findUnique({
    where: { id },
    include: { candidates: true, votes: true },
  });
  if (!election) throw new ApiError(404, 'Election not found');
  res.json({ success: true, data: election });
});

const createElection = catchAsync(async (req, res) => {
  const { title, description, category, startDate, endDate } = req.body;
  if (!title) throw new ApiError(400, 'Title is required');
  const election = await prisma.election.create({
    data: {
      title,
      description,
      category,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      status: 'UPCOMING',
    },
  });
  res.status(201).json({ success: true, data: election });
});

const updateElection = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, description, category, startDate, endDate, status } = req.body;
  const election = await prisma.election.update({
    where: { id },
    data: {
      title,
      description,
      category,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status,
    },
  });
  res.json({ success: true, data: election });
});

const deleteElection = catchAsync(async (req, res) => {
  const { id } = req.params;
  await prisma.election.delete({ where: { id } });
  res.json({ success: true, message: 'Election deleted' });
});

// candidate management
const getAllCandidates = catchAsync(async (req, res) => {
  const candidates = await prisma.candidate.findMany({
    include: {
      election: { select: { title: true, status: true } },
      user: { select: { name: true, email: true } },
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ success: true, data: candidates });
});

const getCandidateById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: { election: true, user: true, votes: true },
  });
  if (!candidate) throw new ApiError(404, 'Candidate not found');
  res.json({ success: true, data: candidate });
});

const createCandidate = catchAsync(async (req, res) => {
  const { contestantId, name, party, description, imageUrl, electionId, userId } = req.body;
  if (!contestantId || !name || !electionId) {
    throw new ApiError(400, 'Contestant ID, name, and electionId are required');
  }
  // Check uniqueness
  const existing = await prisma.candidate.findUnique({ where: { contestantId } });
  if (existing) throw new ApiError(409, 'Contestant ID already taken');
  const candidate = await prisma.candidate.create({
    data: { contestantId, name, party, description, imageUrl, electionId, userId },
  });
  res.status(201).json({ success: true, data: candidate });
});

const updateCandidate = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name, party, description, imageUrl, electionId } = req.body;
  const candidate = await prisma.candidate.update({
    where: { id },
    data: { name, party, description, imageUrl, electionId },
  });
  res.json({ success: true, data: candidate });
});

const deleteCandidate = catchAsync(async (req, res) => {
  const { id } = req.params;
  await prisma.candidate.delete({ where: { id } });
  res.json({ success: true, message: 'Candidate deleted' });
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getAllElections,
  getElectionById,
  createElection,
  updateElection,
  deleteElection,
  getAllCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate,
};