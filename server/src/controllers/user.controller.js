const bcrypt = require('bcrypt');
const prisma = require('../config/database');

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        nationalId: true, phone: true, avatarUrl: true, role: true,
        isVerified: true, anonymousMode: true, twoFactorEnabled: true,
        wallet: { select: { balance: true } },
        candidate: { select: { id: true, status: true } },
      },
    });
    res.json({ user });
  } catch (err) {
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
        ...(phone && { phone }),
        ...(anonymousMode !== undefined && { anonymousMode }),
      },
    });
    res.json({ user: { id: user.id, firstName: user.firstName, lastName: user.lastName } });
  } catch (err) {
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
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
    res.json({ message: 'Password updated' });
  } catch (err) {
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
    res.json({ avatarUrl: user.avatarUrl });
  } catch (err) {
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