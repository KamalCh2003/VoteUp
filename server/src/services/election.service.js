const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ApiError = require('../utils/error');

const getElections = async (status) => {
  const where = status ? { status } : {};
  return prisma.election.findMany({
    where,
    include: {
      candidates: {
        select: { id: true, name: true, party: true, imageUrl: true, _count: { select: { votes: true } } },
      },
      _count: { select: { votes: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getElectionById = async (id) => {
  const election = await prisma.election.findUnique({
    where: { id },
    include: {
      candidates: {
        select: { id: true, name: true, party: true, description: true, imageUrl: true, _count: { select: { votes: true } } },
      },
      _count: { select: { votes: true } },
    },
  });
  if (!election) throw new ApiError(404, 'Election not found');
  return election;
};

const createElection = async (data) => prisma.election.create({ data });
const updateElection = async (id, data) => prisma.election.update({ where: { id }, data });
const deleteElection = async (id) => prisma.election.delete({ where: { id } });

const getResults = async (electionId) => {
  const election = await prisma.election.findUnique({
    where: { id: electionId },
    select: {
      id: true, title: true, status: true,
      candidates: {
        select: { id: true, name: true, party: true, imageUrl: true, _count: { select: { votes: true } } },
      },
      _count: { select: { votes: true } },
    },
  });
  if (!election) throw new ApiError(404, 'Election not found');
  const totalVotes = election._count.votes;
  const candidates = election.candidates.map(c => ({
    ...c,
    voteCount: c._count.votes,
    percentage: totalVotes > 0 ? ((c._count.votes / totalVotes) * 100).toFixed(1) : 0,
  }));
  return { ...election, totalVotes, candidates };
};

module.exports = { getElections, getElectionById, createElection, updateElection, deleteElection, getResults };