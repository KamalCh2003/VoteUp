const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const castVote = catchAsync(async (req, res) => {
  const { electionId, candidateId } = req.body;
  const userId = req.user.id;

  const election = await prisma.election.findUnique({ where: { id: electionId } });
  if (!election || election.status !== 'ACTIVE') {
    throw new ApiError(400, 'Election is not active');
  }

  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, electionId },
  });
  if (!candidate) throw new ApiError(404, 'Candidate not found in this election');

  const existingVote = await prisma.vote.findUnique({
    where: { userId_electionId: { userId, electionId } },
  });
  if (existingVote) throw new ApiError(409, 'You have already voted in this election');

  const vote = await prisma.vote.create({
    data: { userId, electionId, candidateId },
  });

  await prisma.auditLog.create({
    data: {
      action: 'VOTE_CAST',
      userId,
      ipAddress: req.ip,
      details: { electionId, candidateId },
    },
  });

  return res.status(201).json({ success: true, data: vote });
});

module.exports = { castVote };