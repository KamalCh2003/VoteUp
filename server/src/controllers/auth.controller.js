const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const prisma = require('../config/database');
const { generateToken, generateRefreshToken } = require('../config/jwt');
const emailService = require('../services/email.service');
const passport = require('passport');

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// ─── REGISTER ──────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;   // nationalId removed

    // Check only by email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: role || 'VOTER',
      },
    });

    const otp = generateOtp();
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: otp,
        type: 'EMAIL_VERIFY',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const emailResult = await emailService.sendVerificationOtp(email, otp);

    let message = 'Registration successful. Check your email for the verification code.';
    let devOtp = null;
    if (emailResult?.devOtp) {
      devOtp = emailResult.devOtp;
      message = 'Development mode: OTP shown below (SMTP not configured).';
    }

    res.status(201).json({
      message,
      email,
      ...(devOtp && { devOtp }),
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// ─── VERIFY OTP (auto‑login after verification) ───
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const vToken = await prisma.verificationToken.findFirst({
      where: {
        userId: user.id,
        token: otp,
        type: 'EMAIL_VERIFY',
        used: false,
        expiresAt: { gte: new Date() },
      },
    });
    if (!vToken) return res.status(400).json({ error: 'Invalid or expired OTP' });

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { isVerified: true } }),
      prisma.verificationToken.update({ where: { id: vToken.id }, data: { used: true } }),
    ]);

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.json({
      message: 'Email verified successfully',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: true,
      },
    });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
};

// ─── RESEND OTP ───────────────────────────────
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'User not found' });

    await prisma.verificationToken.updateMany({
      where: { userId: user.id, type: 'EMAIL_VERIFY', used: false },
      data: { used: true },
    });

    const otp = generateOtp();
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: otp,
        type: 'EMAIL_VERIFY',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const emailResult = await emailService.sendVerificationOtp(email, otp);

    let message = 'New OTP sent to your email.';
    let devOtp = null;
    if (emailResult?.devOtp) {
      devOtp = emailResult.devOtp;
      message = 'Development mode: new OTP shown below.';
    }

    res.json({
      message,
      ...(devOtp && { devOtp }),
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

// ─── LOGIN ─────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Please verify your email before logging in.',
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const payload = { userId: user.id, email: user.email, role: user.role };
    await prisma.auditLog.create({
      data: { userId: user.id, event: 'LOGIN', ipAddress: req.ip, result: 'OK' },
    });

    res.json({
      accessToken: generateToken(payload),
      refreshToken: generateRefreshToken(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// ─── FORGOT / RESET PASSWORD ───────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ message: 'If email exists, reset link sent' });

    const token = uuidv4();
    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: 'PASSWORD_RESET',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    await emailService.sendPasswordResetEmail(email, token);
    res.json({ message: 'If email exists, reset link sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send reset email' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const vToken = await prisma.verificationToken.findUnique({ where: { token } });
    if (!vToken || vToken.used || vToken.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({ where: { id: vToken.userId }, data: { passwordHash } }),
      prisma.verificationToken.update({ where: { id: vToken.id }, data: { used: true } }),
    ]);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Password reset failed' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const jwt = require('jsonwebtoken');
    const { JWT_REFRESH_SECRET } = require('../config/jwt');
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) return res.status(401).json({ error: 'Invalid token' });

    const payload = { userId: user.id, email: user.email, role: user.role };
    res.json({
      accessToken: generateToken(payload),
      refreshToken: generateRefreshToken(payload),
    });
  } catch (err) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

// ─── GOOGLE OAUTH ───────────────────────────────
exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

exports.googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const userData = encodeURIComponent(
      JSON.stringify({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
      })
    );

    const redirectUrl = `${process.env.CLIENT_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${userData}`;
    res.redirect(redirectUrl);
  })(req, res, next);
};