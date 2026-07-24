// services/auth.service.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateTokens } = require("../utils/jwt");
const ApiError = require("../utils/error");
const { sendVerificationOtp } = require("./email.service");
const crypto = require("crypto");

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

//  REGISTER with OTP (email verification)
const registerWithOtp = async ({
  firstName,
  lastName,
  email,
  password,
  role = "VOTER",
  contestantId,
}) => {
  // Validation
  if (!firstName || !lastName) throw new ApiError(400, "First and last name are required");
  if (!email) throw new ApiError(400, "Email is required");
  if (!password) throw new ApiError(400, "Password is required");
  if (password.length < 8) throw new ApiError(400, "Password must be at least 8 characters");

  // Check existing user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, "Email already registered");

  // Hash password and create user (unverified)
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      passwordHash,
      role,
      isVerified: false,
      wallet: { create: { balance: 0 } },
    },
  });

  // If role is CONTESTANT, create candidate record
  if (role === "CONTESTANT") {
    if (!contestantId) throw new ApiError(400, "Contestant ID is required");
    const existingCandidate = await prisma.candidate.findUnique({
      where: { contestantId },
    });
    if (existingCandidate) throw new ApiError(409, "Contestant ID already taken");
    await prisma.candidate.create({
      data: {
        contestantId,
        name: `${firstName} ${lastName}`,
        userId: user.id,
      },
    });
  }

  // Generate and store OTP
  const otp = generateOtp();
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token: otp,
      type: "EMAIL_VERIFY",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), 
    },
  });

  // Send OTP email (may return devOtp in development)
  const emailResult = await sendVerificationOtp(email, otp);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    devOtp: emailResult.devOtp || null,
  };
};

//  VERIFY OTP and auto‑login (returns JWT tokens)

const verifyOtpAndLogin = async (email, otp) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(404, "User not found");

  const tokenRecord = await prisma.verificationToken.findFirst({
    where: {
      userId: user.id,
      token: otp,
      type: "EMAIL_VERIFY",
      used: false,
      expiresAt: { gte: new Date() },
    },
  });
  if (!tokenRecord) throw new ApiError(400, "Invalid or expired OTP");

  // Mark user as verified and token as used
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { isVerified: true } }),
    prisma.verificationToken.update({ where: { id: tokenRecord.id }, data: { used: true } }),
  ]);

  // Generate JWT tokens
  const tokens = generateTokens(user.id);
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user, tokens };
};

//  RESEND OTP
const resendOtp = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(404, "User not found");

  // Invalidate any existing unused OTPs
  await prisma.verificationToken.updateMany({
    where: { userId: user.id, type: "EMAIL_VERIFY", used: false },
    data: { used: true },
  });

  const otp = generateOtp();
  await prisma.verificationToken.create({
    data: {
      userId: user.id,
      token: otp,
      type: "EMAIL_VERIFY",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const emailResult = await sendVerificationOtp(email, otp);
  return { devOtp: emailResult.devOtp || null };
};

//  STANDARD LOGIN (email + password)
const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, "Invalid email or password");

  // If user has no passwordHash, they registered via Google
  if (!user.passwordHash) {
    throw new ApiError(401, "This account uses Google login. Please sign in with Google.");
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) throw new ApiError(401, "Invalid email or password");

  // Optionally block unverified users (you may want to allow login only after verification)
  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email before logging in.");
  }

  const tokens = generateTokens(user.id);
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user, tokens };
};

//  REFRESH TOKEN (rotation)
const refreshTokens = async (oldRefreshToken) => {
  const tokenDoc = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
    include: { user: true },
  });

  if (!tokenDoc || tokenDoc.revoked || tokenDoc.expiresAt < new Date()) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // Revoke the old token
  await prisma.refreshToken.update({
    where: { id: tokenDoc.id },
    data: { revoked: true },
  });

  // Generate new tokens
  const tokens = generateTokens(tokenDoc.userId);
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: tokenDoc.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user: tokenDoc.user, tokens };
};

//  GOOGLE LOGIN (called after Passport authentication)
const googleLogin = async (googleUser) => {
  const user = await prisma.user.findUnique({
    where: { id: googleUser.id },
  });
  if (!user) throw new ApiError(404, "User not found");

  const tokens = generateTokens(user.id);
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { user, tokens };
};

module.exports = {
  registerWithOtp,
  verifyOtpAndLogin,
  resendOtp,
  loginUser,
  refreshTokens,
  googleLogin,
};