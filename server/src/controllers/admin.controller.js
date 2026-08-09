const prisma = require("../config/database");
const bcrypt = require("bcrypt");
const emailService = require("../services/email.service");
const { createAuditLog } = require("../utils/audit");

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
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),
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
    const { range = "THIS_YEAR" } = req.query;
    const now = new Date();
    let startDate, endDate;
    let groupBy = "day";

    switch (range) {
      case "LAST_MONTH":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 1,
          now.getDate(),
        );
        endDate = now;
        break;
      case "LAST_3_MONTHS":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate(),
        );
        endDate = now;
        break;
      case "LAST_6_MONTHS":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 6,
          now.getDate(),
        );
        endDate = now;
        break;
      case "THIS_YEAR":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
        groupBy = "month";
        break;
      case "LAST_5_YEARS":
        startDate = new Date(now.getFullYear() - 4, 0, 1);
        endDate = now;
        groupBy = "year";
        break;
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
        groupBy = "month";
    }

    const votes = await prisma.vote.findMany({
      where: {
        votedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: { votedAt: true, quantity: true },
    });

    const trendMap = new Map();

    if (groupBy === "year") {
      for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
        trendMap.set(`${y}`, 0);
      }
      votes.forEach((v) => {
        const yearStr = v.votedAt.getFullYear().toString();
        if (trendMap.has(yearStr)) {
          trendMap.set(yearStr, trendMap.get(yearStr) + (v.quantity || 1));
        }
      });
    } else if (groupBy === "month") {
      const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const end = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
      let current = new Date(start);
      while (current <= end) {
        const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
        trendMap.set(key, 0);
        current.setMonth(current.getMonth() + 1);
      }
      votes.forEach((v) => {
        const key = `${v.votedAt.getFullYear()}-${String(v.votedAt.getMonth() + 1).padStart(2, "0")}`;
        if (trendMap.has(key)) {
          trendMap.set(key, trendMap.get(key) + (v.quantity || 1));
        }
      });
    } else {
      const diffDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      for (let i = 0; i <= diffDays; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const key = d.toISOString().split("T")[0];
        trendMap.set(key, 0);
      }
      votes.forEach((v) => {
        const key = v.votedAt.toISOString().split("T")[0];
        if (trendMap.has(key)) {
          trendMap.set(key, trendMap.get(key) + (v.quantity || 1));
        }
      });
    }

    const trend = Array.from(trendMap.entries())
      .map(([date, votes]) => ({ date, votes }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({ trend });
  } catch (err) {
    console.error("Vote trend error:", err);
    res.status(500).json({ error: "Failed to fetch vote trend" });
  }
};

exports.getTopVoters = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topVoters = await prisma.vote.groupBy({
      by: ["userId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: limit,
    });
    const userIds = topVoters.map((v) => v.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const result = topVoters.map((v) => {
      const user = users.find((u) => u.id === v.userId);
      return {
        name: user ? `${user.firstName} ${user.lastName}` : "Unknown",
        votes: v._count.id,
      };
    });
    res.json({ topVoters: result });
  } catch (err) {
    console.error("Top voters error:", err);
    res.status(500).json({ error: "Failed to fetch top voters" });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
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
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.id === req.user.id) {
      return res.status(403).json({ error: 'You cannot delete your own account' });
    }

    // Delete related records...
    await prisma.user.delete({ where: { id } });

    await createAuditLog({
      userId: req.user.id,
      event: 'USER_DELETED',
      details: `Deleted user ${user.email} (${user.firstName} ${user.lastName})`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      result: 'OK',
    });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const validRoles = ['VOTER', 'CONTESTANT', 'ADMIN'];
    if (!validRoles.includes(role)) return res.status(400).json({ error: 'Invalid role' });
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.id === req.user.id) {
      return res.status(403).json({ error: 'You cannot change your own role' });
    }
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true },
    });

    await createAuditLog({
      userId: req.user.id,
      event: 'USER_ROLE_UPDATED',
      details: `Changed role of ${user.email} from ${user.role} to ${role}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      result: 'OK',
    });

    res.json({ user: updatedUser });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await prisma.candidate.findMany({
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        election: {
          select: { id: true, title: true, status: true, category: true },
        },
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
    if (!candidate)
      return res.status(404).json({ error: "Candidate not found" });
    const updated = await prisma.candidate.update({
      where: { id },
      data: {
        party: party !== undefined ? party : candidate.party,
        slogan: slogan !== undefined ? slogan : candidate.slogan,
        bio: bio !== undefined ? bio : candidate.bio,
        candidateNumber:
          candidateNumber !== undefined
            ? candidateNumber
            : candidate.candidateNumber,
        ...(avatarUrl && { avatarUrl }),
      },
      include: {
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
        election: { select: { id: true, title: true } },
      },
    });

    await createAuditLog({
      userId: req.user.id,
      event: "CANDIDATE_UPDATED",
      details: `Updated candidate ${updated.user.email} (ID: ${id})`,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "unknown",
      result: "OK",
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
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: { user: true, election: true },
    });
    if (!candidate)
      return res.status(404).json({ error: "Candidate not found" });
    await prisma.candidate.delete({ where: { id } });

    await createAuditLog({
      userId: req.user.id,
      event: "CANDIDATE_DELETED",
      details: `Deleted candidate ${candidate.user.email} from election "${candidate.election.title}"`,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "unknown",
      result: "OK",
    });

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
        title:
          status === "APPROVED" ? "Candidacy Approved 🎉" : "Candidacy Update",
        message:
          status === "APPROVED"
            ? `Your application for "${candidate.election.title}" has been approved. Good luck!`
            : `Your application for "${candidate.election.title}" has been reviewed and not approved at this time.`,
        type: "CANDIDACY_UPDATE",
        link: "/contestant/profile-campaign",
      },
    });

    await createAuditLog({
      userId: req.user.id,
      event: `CANDIDATE_${status}`,
      details: `Set candidate ${candidate.user.email} status to ${status} for election "${candidate.election.title}"`,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "unknown",
      result: "OK",
    });

    res.json({ candidate });
  } catch (err) {
    console.error("Approve candidate error:", err);
    res.status(500).json({ error: "Approval failed" });
  }
};

exports.createCandidateFromAdmin = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      party,
      electionId,
      slogan,
      bio,
      candidateNumber,
    } = req.body;
    const avatarUrl = req.file ? req.file.path : null;

    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });
    if (!election) return res.status(404).json({ error: "Election not found" });

    const candidateCount = await prisma.candidate.count({
      where: { electionId, status: "APPROVED" },
    });
    if (election.maxCandidates && candidateCount >= election.maxCandidates) {
      return res
        .status(400)
        .json({
          error: `Candidate limit reached for this election (max ${election.maxCandidates})`,
        });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    let tempPassword = null;
    let isNewUser = false;

    if (!user) {
      tempPassword = Math.random().toString(36).slice(-8);
      const passwordHash = await bcrypt.hash(tempPassword, 12);
      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash,
          role: "CONTESTANT",
          isVerified: false,
        },
      });
      isNewUser = true;
    } else {
      const existingCandidate = await prisma.candidate.findFirst({
        where: { userId: user.id, electionId },
      });
      if (existingCandidate) {
        return res
          .status(400)
          .json({
            error: "User already has a candidate profile for this election",
          });
      }
    }

    const existingCandidatesCount = await prisma.candidate.count({
      where: { electionId },
    });
    const sequence = String(existingCandidatesCount + 1).padStart(2, "0");
    const electionShortId = electionId.slice(0, 6);
    const generatedCandidateNumber = `CN-${electionShortId}-${sequence}`;

    const candidate = await prisma.candidate.create({
      data: {
        userId: user.id,
        electionId,
        candidateNumber: generatedCandidateNumber,
        party,
        slogan,
        bio,
        avatarUrl,
      },
    });

    // Send emails (non‑blocking)
    if (isNewUser && tempPassword) {
      try {
        await emailService.sendWelcomePassword(
          email,
          firstName,
          lastName,
          tempPassword,
        );
      } catch (emailErr) {
        console.error("Failed to send welcome email:", emailErr);
      }
    } else if (!isNewUser) {
      try {
        await emailService.sendEmail({
          to: email,
          subject: "You have been added as a candidate",
          html: `<p>Hello ${firstName}, you have been added as a candidate in VoteUp. Please log in to manage your campaign.</p>`,
        });
      } catch (emailErr) {
        console.error("Failed to send notification email:", emailErr);
      }
    }

    await createAuditLog({
      userId: req.user.id,
      event: "CANDIDATE_CREATED",
      details: `Created candidate ${user.email} for election "${election.title}"`,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "unknown",
      result: "OK",
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
      take: 200,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
    res.json({ logs });
  } catch (err) {
    console.error("Audit logs error:", err);
    res.status(500).json({ error: "Failed to fetch logs" });
  }
};

exports.getRevenueTrend = async (req, res) => {
  try {
    const { range = "THIS_YEAR" } = req.query;
    const now = new Date();
    let startDate, endDate;
    let groupBy = "month";

    switch (range) {
      case "LAST_MONTH":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case "LAST_3_MONTHS":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case "LAST_6_MONTHS":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        break;
      case "THIS_YEAR":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        break;
      case "LAST_5_YEARS":
        startDate = new Date(now.getFullYear() - 4, 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
        groupBy = "year";
        break;
      default:
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    }

    const revenueData = [];

    if (groupBy === "year") {
      for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
        const startOfYear = new Date(y, 0, 1);
        const endOfYear = new Date(y, 11, 31, 23, 59, 59);
        const agg = await prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: "COMPLETED",
            createdAt: { gte: startOfYear, lte: endOfYear },
          },
        });
        revenueData.push({ month: `${y}`, revenue: agg._sum.amount || 0 });
      }
    } else {
      let current = new Date(startDate);
      while (current <= endDate) {
        const monthStart = new Date(
          current.getFullYear(),
          current.getMonth(),
          1,
        );
        const monthEnd = new Date(
          current.getFullYear(),
          current.getMonth() + 1,
          0,
          23,
          59,
          59,
        );
        const agg = await prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: "COMPLETED",
            createdAt: { gte: monthStart, lte: monthEnd },
          },
        });
        const label = monthStart.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        revenueData.push({ month: label, revenue: agg._sum.amount || 0 });
        current.setMonth(current.getMonth() + 1);
      }
    }

    res.json({ revenueData });
  } catch (err) {
    console.error("Revenue trend error:", err);
    res.status(500).json({ error: "Failed to fetch revenue trend" });
  }
};

exports.getPaymentMethods = async (req, res) => {
  try {
    const count = await prisma.payment.count({
      where: { status: "COMPLETED" },
    });
    res.json({
      methods: [{ name: "Vote Purchase", value: count, color: "#7c6fff" }],
    });
  } catch (err) {
    console.error("Payment methods error:", err);
    res.status(500).json({ error: "Failed to fetch payment methods" });
  }
};

exports.getRecentPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        candidate: {
          select: {
            user: { select: { firstName: true, lastName: true } },
          },
        },
        votes: { select: { quantity: true } },
      },
    });

    const paymentsWithDetails = payments.map((p) => ({
      ...p,
      totalVotes: p.votes.reduce((sum, v) => sum + v.quantity, 0),
      voterName:
        `${p.user?.firstName || ""} ${p.user?.lastName || ""}`.trim() ||
        p.user?.email ||
        "N/A",
      contestantName: p.candidate?.user
        ? `${p.candidate.user.firstName} ${p.candidate.user.lastName}`
        : "—",
    }));

    res.json({ payments: paymentsWithDetails });
  } catch (err) {
    console.error("Recent payments error:", err);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
};

exports.getFreeVsPaidVotes = async (req, res) => {
  try {
    const [paid, free] = await Promise.all([
      prisma.vote.aggregate({
        _sum: { quantity: true },
        where: { paymentId: { not: null } },
      }),
      prisma.vote.aggregate({
        _sum: { quantity: true },
        where: { paymentId: null },
      }),
    ]);

    const paidVotes = paid._sum.quantity || 0;
    const freeVotes = free._sum.quantity || 0;

    res.json({
      free: freeVotes,
      paid: paidVotes,
      total: freeVotes + paidVotes,
    });
  } catch (err) {
    console.error('Free vs Paid votes error:', err);
    res.status(500).json({ error: 'Failed to fetch vote breakdown' });
  }
};

exports.getTopElectionsByRevenue = async (req, res) => {
  try {
    const voteGroups = await prisma.vote.groupBy({
      by: ['electionId'],
      where: {
        paymentId: { not: null },
        payment: { status: 'COMPLETED' },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    const electionIds = voteGroups.map((g) => g.electionId);

    const elections = await prisma.election.findMany({
      where: { id: { in: electionIds } },
      select: { id: true, title: true, status: true },
    });

    const revenueByElection = await Promise.all(
      electionIds.map(async (electionId) => {
        const paymentAgg = await prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: 'COMPLETED',
            votes: {
              some: { electionId },
            },
          },
        });
        return {
          electionId,
          revenue: paymentAgg._sum.amount || 0,
        };
      })
    );

    const result = voteGroups
      .map((group) => {
        const election = elections.find((e) => e.id === group.electionId);
        const rev = revenueByElection.find((r) => r.electionId === group.electionId);
        return {
          id: group.electionId,
          title: election?.title || 'Unknown',
          status: election?.status || 'UNKNOWN',
          votes: group._sum.quantity || 0,
          revenue: rev?.revenue || 0,
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({ topElections: result });
  } catch (err) {
    console.error('Top elections by revenue error:', err);
    res.status(500).json({ error: 'Failed to fetch top elections' });
  }
};

exports.getAllVotes = async (req, res) => {
  try {
    const votes = await prisma.vote.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            createdAt: true,
          },
        },
        candidate: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
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
    const vote = await prisma.vote.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        candidate: { include: { user: { select: { firstName: true, lastName: true } } } },
        election: { select: { title: true } },
      },
    });
    if (!vote) return res.status(404).json({ error: 'Vote not found' });

    await prisma.$transaction([
      prisma.candidate.update({
        where: { id: vote.candidateId },
        data: { votesReceived: { decrement: vote.quantity || 1 } },
      }),
      prisma.election.update({
        where: { id: vote.electionId },
        data: { totalVotes: { decrement: vote.quantity || 1 } },
      }),
      prisma.vote.delete({ where: { id } }),
    ]);

    await createAuditLog({
      userId: req.user.id,
      event: 'VOTE_DELETED',
      details: `Deleted vote from ${vote.user.email} for candidate ${vote.candidate.user.firstName} ${vote.candidate.user.lastName} in election "${vote.election.title}"`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      result: 'OK',
    });

    res.json({ message: 'Vote deleted successfully' });
  } catch (err) {
    console.error('Delete vote error:', err);
    res.status(500).json({ error: 'Failed to delete vote' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          title: true,
          message: true,
          type: true,
          isRead: true,
          link: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({ where: { userId: req.user.id } }),
    ]);
    res.json({
      notifications,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notification.update({
      where: { id, userId: req.user.id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Mark notification read error:", err);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Mark all notifications read error:", err);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
};

exports.getUnreadNotificationCount = async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: {
        userId: req.user.id,
        isRead: false,
      },
    });
    res.json({ count });
  } catch (err) {
    console.error("Unread notification count error:", err);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
};

exports.submitElectionRequest = async (req, res) => {
  try {
    const { name, email, phone, organization, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ error: "Email and message are required" });
    }

    const request = await prisma.electionRequest.create({
      data: {
        name: name || null,
        email,
        phone: phone || null,
        organization: organization || null,
        message,
        status: "PENDING",
      },
    });

    const userId = req.user?.id || null;
    await createAuditLog({
      userId,
      event: "ELECTION_REQUEST_SUBMITTED",
      details: `Election request submitted by ${email} (${name || "Anonymous"})${userId ? ` (User ID: ${userId})` : ""}`,
      ipAddress: req.ip || req.headers["x-forwarded-for"] || "unknown",
      result: "OK",
    });

    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    if (admins.length > 0) {
      await prisma.notification.createMany({
        data: admins.map(admin => ({
          userId: admin.id,
          title: "New Election Request",
          message: `${name || "Someone"} (${email}) requested an election.`,
          type: "SYSTEM_ALERT",
          link: "/admin/election-requests",
        })),
      });
    }

    res.status(201).json({ request });
  } catch (err) {
    console.error("Submit election request error:", err);
    res.status(500).json({ error: "Failed to submit request" });
  }
};


exports.getElectionRequests = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const where = {};

    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
      ];
    }

    const [requests, total] = await Promise.all([
      prisma.electionRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.electionRequest.count({ where }),
    ]);

    res.json({
      requests,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error("Get election requests error:", err);
    res.status(500).json({ error: "Failed to fetch election requests" });
  }
};

exports.updateElectionRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['PENDING', 'REVIEWED', 'COMPLETED', 'ARCHIVED'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const request = await prisma.electionRequest.update({
      where: { id },
      data: { status },
    });

    await createAuditLog({
      userId: req.user.id,
      event: 'REQUEST_STATUS_UPDATED',
      details: `Updated election request from ${request.email} to status ${status}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      result: 'OK',
    });

    res.json({ request });
  } catch (err) {
    console.error('Update request status error:', err);
    res.status(500).json({ error: 'Failed to update request' });
  }
};

exports.deleteElectionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await prisma.electionRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    await prisma.electionRequest.delete({ where: { id } });

    await createAuditLog({
      userId: req.user.id,
      event: 'REQUEST_DELETED',
      details: `Deleted election request from ${request.email}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      result: 'OK',
    });

    res.json({ message: 'Request deleted' });
  } catch (err) {
    console.error('Delete request error:', err);
    res.status(500).json({ error: 'Failed to delete request' });
  }
};

exports.replyToElectionRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const request = await prisma.electionRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ error: 'Request not found' });

    const sent = await emailService.sendEmail({
      to: request.email,
      subject: 'Response to your election request',
      html: `<p>${message}</p>`,
    });
    if (!sent) return res.status(500).json({ error: 'Failed to send reply email' });

    await createAuditLog({
      userId: req.user.id,
      event: 'REQUEST_REPLIED',
      details: `Sent reply to ${request.email} regarding their election request`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      result: 'OK',
    });

    res.json({ success: true, message: 'Reply sent' });
  } catch (err) {
    console.error('Reply error:', err);
    res.status(500).json({ error: 'Failed to send reply' });
  }
};