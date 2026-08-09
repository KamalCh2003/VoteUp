// controllers/user.controller.js
const bcrypt = require('bcrypt');
const prisma = require('../config/database');
const { createAuditLog } = require('../utils/audit'); // 👈 added

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

    // 🔐 Audit log
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

    // 🔐 Audit log
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

    // 🔐 Audit log
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