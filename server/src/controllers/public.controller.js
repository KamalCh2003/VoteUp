const prisma = require('../config/database');

exports.getLandingStats = async (req, res) => {
  try {
    const [totalVoters, totalVotes, activeElections] = await Promise.all([
      prisma.user.count({ where: { role: 'VOTER' } }),
      prisma.vote.count(),
      prisma.election.count({ where: { status: 'ACTIVE' } }),
    ]);

    res.json({
      totalVoters,
      totalVotes,
      activeElections,
      securityLevel: '100%',
      uptime: '99.9%',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
};