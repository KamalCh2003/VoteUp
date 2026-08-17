const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const { createAuditLog } = require('../utils/audit');

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        googleId: true,
        role: true,
        isVerified: true,
        anonymousMode: true,
        twoFactorEnabled: true,
        candidates: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });
    res.json({ user });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, anonymousMode } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(anonymousMode !== undefined && { anonymousMode }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isVerified: true,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      event: 'PROFILE_UPDATED',
      details: `Updated profile fields: ${Object.keys(req.body).join(', ')}`,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      result: 'OK',
    });

    res.json({ user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(400).json({ error: 'Current password is incorrect' });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    await createAuditLog({
      userId: req.user.id,
      event: 'PASSWORD_CHANGED',
      details: 'User changed their password',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      result: 'OK',
    });

    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Password change failed' });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: req.file.path },
    });

    await createAuditLog({
      userId: req.user.id,
      event: 'AVATAR_UPLOADED',
      details: 'User uploaded a new avatar',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      result: 'OK',
    });

    res.json({ avatarUrl: user.avatarUrl });
  } catch (err) {
    console.error('Upload avatar error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};

exports.getVoteHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const votes = await prisma.vote.findMany({
      where: { userId },
      include: {
        election: {
          select: { title: true, status: true, votePrice: true },
        },
        candidate: {
          select: {
            id: true,
            avatarUrl: true,
            user: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { votedAt: 'desc' },
    });
    res.json({ votes });
  } catch (err) {
    console.error('Get vote history error:', err);
    res.status(500).json({ error: 'Failed to fetch vote history' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const { unreadOnly, limit = 20, offset = 0 } = req.query;
    const where = { userId: req.user.id };
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.notification.count({ where });

    res.json({
      notifications,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

exports.getUnreadNotificationCount = async (req, res) => {
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

exports.markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.updateMany({
      where: {
        id: parseInt(id),
        userId: req.user.id,
      },
      data: { isRead: true },
    });
    if (notification.count === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Marked as read' });
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

exports.clearAllNotifications = async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.id },
    });
    res.json({ message: 'All notifications cleared' });
  } catch (err) {
    console.error('Clear all error:', err);
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ payments });
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
};

// ─── Bookmark endpoints ──────────────────────────────────────────────

exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: {
        election: {
          select: {
            id: true,
            title: true,
            category: true,
            status: true,
            endDate: true,
            startDate: true,
            votePrice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const elections = bookmarks.map(b => b.election);
    res.json({ bookmarks: elections });
  } catch (err) {
    console.error('Get bookmarks error:', err);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

exports.addBookmark = async (req, res) => {
  try {
    const { electionId } = req.params;
    try {
      await prisma.bookmark.create({
        data: {
          userId: req.user.id,
          electionId,
        },
      });
      return res.status(201).json({ message: 'Bookmark added' });
    } catch (err) {
      if (err.code === 'P2002') {
        return res.status(200).json({ message: 'Bookmark already exists' });
      }
      throw err;
    }
  } catch (err) {
    console.error('Add bookmark error:', err);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    const { electionId } = req.params;
    await prisma.bookmark.deleteMany({
      where: {
        userId: req.user.id,
        electionId,
      },
    });
    res.json({ message: 'Bookmark removed' });
  } catch (err) {
    console.error('Remove bookmark error:', err);
    res.status(500).json({ error: 'Failed to remove bookmark' });
  }
};