const prisma = require("../config/database");
const bcrypt = require("bcrypt");
const emailService = require('../services/email.service');

const getColorForType = (type) => {
  switch (type) {
    case "CANDIDACY_FEE": return "#7c6fff";
    case "PREMIUM_VOTER": return "#00d4aa";
    case "WALLET_TOPUP": return "#f5a623";
    case "REFUND": return "#ff6b8a";
    default: return "#60a5fa";
  }
};

exports.getStats = async (req, res) => {
  try {
    const [
      totalVoters,
      activeElections,
      candidates,
      approvedCandidates,
      totalElections,
      payments,
      totalVotesAgg,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "VOTER" } }),
      prisma.election.count({ where: { status: "ACTIVE" } }),
      prisma.candidate.count(),
      prisma.candidate.count({ where: { status: "APPROVED" } }),
      prisma.election.count(),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "COMPLETED" } }),
      prisma.vote.aggregate({ _sum: { quantity: true } }),
    ]);
    res.json({
      totalVoters,
      activeElections,
      candidates,
      approvedCandidates,
      totalElections,
      revenue: payments._sum.amount || 0,
      totalVotes: totalVotesAgg._sum.quantity || 0,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Failed to load stats" });
  }
};

exports.getVoteTrend = async (req, res) => {
  try {
    const { range = "week" } = req.query;
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    let groupBy = "day";

    if (range === "week") {
      startDate.setDate(startDate.getDate() - 6);
    } else if (range === "month") {
      startDate.setDate(startDate.getDate() - 29);
    } else if (range === "year") {
      startDate = new Date(endDate.getFullYear(), 0, 1);
      groupBy = "month";
    }

    const votes = await prisma.vote.findMany({
      where: { votedAt: { gte: startDate, lte: endDate } },
      select: { votedAt: true, quantity: true },
    });

    const trendMap = new Map();

    if (groupBy === "month") {
      for (let i = 0; i < 12; i++) {
        const monthStr = `${endDate.getFullYear()}-${String(i + 1).padStart(2, "0")}`;
        trendMap.set(monthStr, 0);
      }
      votes.forEach(v => {
        const monthStr = v.votedAt.toISOString().slice(0, 7);
        const qty = v.quantity || 1;
        trendMap.set(monthStr, (trendMap.get(monthStr) || 0) + qty);
      });
      const trend = Array.from(trendMap.entries())
        .map(([date, votes]) => ({ date, votes }))
        .sort((a, b) => a.date.localeCompare(b.date));
      return res.json({ trend });
    }

    const diffDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    for (let i = 0; i < diffDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      trendMap.set(dateStr, 0);
    }
    votes.forEach(v => {
      const dateStr = v.votedAt.toISOString().split("T")[0];
      const qty = v.quantity || 1;
      if (trendMap.has(dateStr)) trendMap.set(dateStr, trendMap.get(dateStr) + qty);
    });
    const trend = Array.from(trendMap.entries())
      .map(([date, votes]) => ({ date, votes }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json({ trend });
  } catch (err) {
    console.error("Vote trend error:", err);
    res.status(500).json({ error: "Failed to fetch vote trend" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, isActive: true, createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ users });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.id === req.user.id) {
      return res.status(403).json({ error: "You cannot delete your own account" });
    }

    const relatedModels = ["refreshToken", "verificationToken", "candidate", "vote", "auditLog"];
    for (const model of relatedModels) {
      if (prisma[model]) {
        await prisma[model].deleteMany({ where: { userId: id } });
      }
    }
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const validRoles = ["VOTER", "CONTESTANT", "ADMIN"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.id === req.user.id) {
      return res.status(403).json({ error: "You cannot change your own role" });
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
    });
    res.json({ user: updatedUser });
  } catch (err) {
    console.error("Update role error:", err);
    res.status(500).json({ error: "Failed to update user role" });
  }
};

exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        election: { select: { id: true, title: true, status: true, category: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ candidates });
  } catch (err) {
    console.error("getAllCandidates error:", err);
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { party, slogan, bio, candidateNumber } = req.body;
    const avatarUrl = req.file ? req.file.path : undefined;
    const candidate = await prisma.candidate.findUnique({ where: { id } });
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });
    const updated = await prisma.candidate.update({
      where: { id },
      data: {
        party: party !== undefined ? party : candidate.party,
        slogan: slogan !== undefined ? slogan : candidate.slogan,
        bio: bio !== undefined ? bio : candidate.bio,
        candidateNumber: candidateNumber !== undefined ? candidateNumber : candidate.candidateNumber,
        ...(avatarUrl && { avatarUrl }),
      },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        election: { select: { id: true, title: true } },
      },
    });
    res.json({ candidate: updated });
  } catch (err) {
    console.error("Update candidate error:", err);
    res.status(500).json({ error: "Failed to update candidate" });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await prisma.candidate.findUnique({ where: { id } });
    if (!candidate) return res.status(404).json({ error: "Candidate not found" });
    await prisma.candidate.delete({ where: { id } });
    res.json({ message: "Candidate deleted successfully" });
  } catch (err) {
    console.error("Delete candidate error:", err);
    res.status(500).json({ error: "Failed to delete candidate" });
  }
};

exports.approveCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const candidate = await prisma.candidate.update({
      where: { id },
      data: { status },
      include: { user: true, election: true },
    });
    await prisma.notification.create({
      data: {
        userId: candidate.user.id,
        title: status === 'APPROVED' ? 'Candidacy Approved 🎉' : 'Candidacy Update',
        message: status === 'APPROVED'
          ? `Your application for "${candidate.election.title}" has been approved. Good luck!`
          : `Your application for "${candidate.election.title}" has been reviewed and not approved at this time.`,
        type: 'CANDIDACY_UPDATE',
        link: '/contestant/profile-campaign',
      },
    });
    res.json({ candidate });
  } catch (err) {
    console.error("Approve candidate error:", err);
    res.status(500).json({ error: "Approval failed" });
  }
};

exports.createCandidateFromAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, party, electionId, slogan, bio, candidateNumber } = req.body;
    const avatarUrl = req.file ? req.file.path : null;
    const election = await prisma.election.findUnique({ where: { id: electionId } });
    if (!election) return res.status(404).json({ error: "Election not found" });
    const candidateCount = await prisma.candidate.count({ where: { electionId, status: "APPROVED" } });
    if (election.maxCandidates && candidateCount >= election.maxCandidates) {
      return res.status(400).json({ error: `Candidate limit reached for this election (max ${election.maxCandidates})` });
    }
    let user = await prisma.user.findUnique({ where: { email } });
    let tempPassword = null;
    if (!user) {
      tempPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(tempPassword, 12);
      user = await prisma.user.create({
        data: {
          email, firstName, lastName, passwordHash,
          role: "CONTESTANT", isVerified: false,
          nationalId: `ADMIN-${Date.now()}`,
        },
      });
      await emailService.sendWelcomePassword(email, firstName, lastName, tempPassword);
    } else {
      const existingCandidate = await prisma.candidate.findUnique({ where: { userId: user.id } });
      if (existingCandidate) return res.status(400).json({ error: "User already has a candidate profile" });
      await emailService.sendEmail({
        to: email,
        subject: 'You have been added as a candidate',
        html: `<p>Hello ${firstName}, you have been added as a candidate in VoteUp. Please log in to manage your campaign.</p>`,
      });
    }
    const candidate = await prisma.candidate.create({
      data: { userId: user.id, electionId, candidateNumber, party, slogan, bio, avatarUrl },
    });
    res.status(201).json({ candidate });
  } catch (err) {
    console.error("Admin add candidate error:", err);
    res.status(500).json({ error: "Failed to add candidate" });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    });
    res.json({ logs });
  } catch (err) {
    console.error("Audit logs error:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
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
        label: d.toLocaleString("default", { month: "short" }),
      });
    }
    const revenueData = await Promise.all(months.map(async (m) => {
      const agg = await prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED", createdAt: { gte: m.start, lte: m.end } },
      });
      return { month: m.label, revenue: agg._sum.amount || 0 };
    }));
    res.json({ revenueData });
  } catch (err) {
    console.error("Revenue trend error:", err);
    res.status(500).json({ error: "Failed to fetch revenue trend" });
  }
};

exports.getPaymentMethods = async (req, res) => {
  try {
    const methods = await prisma.payment.groupBy({
      by: ["type"],
      _count: true,
      where: { status: "COMPLETED" },
    });
    const nameMap = {
      CANDIDACY_FEE: "Candidacy Fee",
      PREMIUM_VOTER: "Premium",
      WALLET_TOPUP: "Wallet Top‑up",
      REFUND: "Refund",
    };
    const result = methods.map(m => ({
      name: nameMap[m.type] || m.type,
      value: m._count,
      color: getColorForType(m.type),
    }));
    res.json({ methods: result });
  } catch (err) {
    console.error("Payment methods error:", err);
    res.status(500).json({ error: "Failed to fetch payment methods" });
  }
};

exports.getRecentPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
    res.json({ payments });
  } catch (err) {
    console.error("Recent payments error:", err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

exports.getTopVoters = async (req, res) => {
  try {
    const topVoters = await prisma.vote.groupBy({
      by: ["userId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    });
    const userIds = topVoters.map(v => v.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const result = topVoters.map(v => {
      const user = users.find(u => u.id === v.userId);
      return { name: user ? `${user.firstName} ${user.lastName}` : "Unknown", votes: v._count.id, amount: 0 };
    });
    res.json({ topVoters: result });
  } catch (err) {
    console.error("Top voters error:", err);
    res.status(500).json({ error: "Failed to fetch top voters" });
  }
};

exports.getAllVotes = async (req, res) => {
  try {
    const votes = await prisma.vote.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, gender: true, createdAt: true } },
        candidate: { include: { user: { select: { firstName: true, lastName: true } } } },
        election: { select: { title: true, status: true } },
      },
      orderBy: { votedAt: "desc" },
    });
    res.json({ votes });
  } catch (err) {
    console.error("Get all votes error:", err);
    res.status(500).json({ error: "Failed to fetch votes" });
  }
};

exports.deleteVote = async (req, res) => {
  try {
    const { id } = req.params;
    const vote = await prisma.vote.findUnique({ where: { id } });
    if (!vote) return res.status(404).json({ error: "Vote not found" });
    await prisma.$transaction([
      prisma.candidate.update({ where: { id: vote.candidateId }, data: { votesReceived: { decrement: vote.quantity || 1 } } }),
      prisma.election.update({ where: { id: vote.electionId }, data: { totalVotes: { decrement: vote.quantity || 1 } } }),
      prisma.vote.delete({ where: { id } }),
    ]);
    res.json({ message: "Vote deleted successfully" });
  } catch (err) {
    console.error("Delete vote error:", err);
    res.status(500).json({ error: "Failed to delete vote" });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.notification.count({ where: { userId: req.user.id } }),
    ]);
    res.json({ notifications, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { userId: req.user.id, isRead: false },
    });
    res.json({ count });
  } catch (err) {
    console.error('Get unread count error:', err);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
};

// 🔔 NEW: Mark all notifications as read for the current admin
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};