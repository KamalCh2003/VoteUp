const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const catchAsync = require('../utils/catchAsync');

 
const getDashboardStats = catchAsync(async (req, res) => {
  // Run queries in parallel for efficiency
  const [totalUsers, totalCandidates, elections, totalVotes, recentActivities] = await Promise.all([
    prisma.user.count(),
    prisma.candidate.count(),
    prisma.election.findMany({ select: { status: true } }),
    prisma.vote.count(), 
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    }),
  ]);

  // Count elections by status
  const activeElections = elections.filter(e => e.status === 'ACTIVE').length;
  const upcomingElections = elections.filter(e => e.status === 'UPCOMING').length;
  const endedElections = elections.filter(e => e.status === 'ENDED').length;

  // Calculate voter turnout (percentage of users who voted at least once)
  const distinctVoters = await prisma.vote.groupBy({
    by: ['userId'],
    _count: { userId: true },
  });
  const voterTurnout = totalUsers ? ((distinctVoters.length / totalUsers) * 100).toFixed(1) : 0;

  // Format recent activities for frontend consumption
  const formattedActivities = recentActivities.map(log => ({
    id: log.id,
    action: log.action,
    time: timeAgo(log.createdAt),
    icon: getIconForAction(log.action),
    user: log.user?.name || 'System',
  }));

  res.json({
    success: true,
    data: {
      totalUsers,
      totalCandidates,
      totalElections: elections.length,
      activeElections,
      upcomingElections,
      endedElections,
      totalVotes,
      voterTurnout: parseFloat(voterTurnout),
      recentActivities: formattedActivities,
    },
  });
});

// Helper: return human-readable time difference
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

// Helper: map action to icon name (frontend will map to actual icon component)
function getIconForAction(action) {
  const lower = action.toLowerCase();
  if (lower.includes('user')) return 'Users';
  if (lower.includes('vote')) return 'Vote';
  if (lower.includes('election')) return 'Calendar';
  if (lower.includes('candidate')) return 'UserCheck';
  return 'Activity';
}

module.exports = { getDashboardStats };