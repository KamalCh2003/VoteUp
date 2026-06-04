const prisma = require('../config/database');

const getElectionStats = async (electionId) => {
  const candidates = await prisma.candidate.findMany({
    where: { electionId },
    select: { id: true, votesReceived: true },
  });
  return candidates;
};

module.exports = { getElectionStats };