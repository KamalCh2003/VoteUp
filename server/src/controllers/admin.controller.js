const prisma = require('../config/database');

exports.getStats = async (req, res) => {
  try {
    const [totalVoters, activeElections, candidates, payments] = await Promise.all([
      prisma.user.count({ where: { role: 'VOTER' } }),
      prisma.election.count({ where: { status: 'ACTIVE' } }),
      prisma.candidate.count(),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'COMPLETED' } }),
    ]);
    res.json({
      totalVoters,
      activeElections,
      candidates,
      revenue: payments._sum.amount || 0,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load stats' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};


exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        election: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ candidates });
  } catch (err) {
    console.error('getAllCandidates error:', err);
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
};

exports.approveCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const candidate = await prisma.candidate.update({
      where: { id },
      data: { status },
    });
    res.json({ candidate });
  } catch (err) {
    res.status(500).json({ error: 'Approval failed' });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } },
    });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

exports.getRevenueTrend = async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        start: new Date(d.getFullYear(), d.getMonth(), 1),
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
        label: d.toLocaleString('default', { month: 'short' }),
      });
    }

    const revenueData = await Promise.all(
      months.map(async (m) => {
        const agg = await prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: 'COMPLETED',
            createdAt: { gte: m.start, lte: m.end },
          },
        });
        return {
          month: m.label,
          revenue: agg._sum.amount || 0,
        };
      })
    );

    res.json({ revenueData });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch revenue trend' });
  }
};

// Payment method breakdown – count per type
exports.getPaymentMethods = async (req, res) => {
  try {
    const methods = await prisma.payment.groupBy({
      by: ['type'],
      _count: true,
      where: { status: 'COMPLETED' },
    });

    // Map to friendly names
    const nameMap = {
      CANDIDACY_FEE: 'Candidacy Fee',
      PREMIUM_VOTER: 'Premium',
      WALLET_TOPUP: 'Wallet Top‑up',
      REFUND: 'Refund',
    };

    const result = methods.map((m) => ({
      name: nameMap[m.type] || m.type,
      value: m._count,
      color: getColorForType(m.type),
    }));

    res.json({ methods: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
};

// Helper to assign colors
function getColorForType(type) {
  switch (type) {
    case 'CANDIDACY_FEE': return '#7c6fff';
    case 'PREMIUM_VOTER': return '#00d4aa';
    case 'WALLET_TOPUP': return '#f5a623';
    case 'REFUND': return '#ff6b8a';
    default: return '#60a5fa';
  }
}

// Top voters by total votes cast (or by payment amount – choose one)
exports.getTopVoters = async (req, res) => {
  try {
    // Top voters by number of votes (most active voters)
    const topVoters = await prisma.vote.groupBy({
      by: ['userId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const userIds = topVoters.map((v) => v.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    });

    const result = topVoters.map((v) => {
      const user = users.find((u) => u.id === v.userId);
      return {
        name: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        votes: v._count.id,
        amount: 0, // not meaningful here; you could add payment data
      };
    });

    res.json({ topVoters: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch top voters' });
  }
};