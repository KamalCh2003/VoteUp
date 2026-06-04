const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateTokens } = require("../utils/jwt");
const ApiError = require("../utils/error");

const registerUser = async ({
  name,
  email,
  password,
  role = "VOTER",
  contestantId,
  electionId,
}) => {
  // Validations
  if (!name) throw new ApiError(400, "Full name is required");
  if (!email) throw new ApiError(400, "Email is required");
  if (!password) throw new ApiError(400, "Password is required");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, "Email already registered");

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  if (role === "CANDIDATE") {
    if (!contestantId) throw new ApiError(400, "Contestant ID is required");

    if (electionId) {
      const election = await prisma.election.findUnique({
        where: { id: electionId },
      });
      if (!election) throw new ApiError(404, "Election not found");
    }

    const existingCandidate = await prisma.candidate.findUnique({
      where: { contestantId },
    });
    if (existingCandidate)
      throw new ApiError(409, "Contestant ID already taken");

    await prisma.candidate.create({
      data: {
        contestantId,
        name,
        userId: user.id,
        electionId: electionId || null,
      },
    });
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

const loginUser = async ({ email, password }) => {
  console.log("[LOGIN] Step 1: received", {
    email: email?.substring(0, 3) + "***",
  });
  try {
    console.log("[LOGIN] Step 2: querying user");
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("[LOGIN] Step 3: user found?", !!user);

    if (!user) {
      console.log("[LOGIN] Step 4: no user, throwing 401");
      throw new ApiError(401, "Invalid email or password");
    }

    // If user registered via Google (no passwordHash), they cannot log in with password
    if (!user.passwordHash) {
      console.log("[LOGIN] Step 4b: user has no passwordHash (Google login only)");
      throw new ApiError(401, "This account uses Google login. Please sign in with Google.");
    }

    console.log("[LOGIN] Step 5: comparing password");
    const valid = await comparePassword(password, user.passwordHash);
    console.log("[LOGIN] Step 6: password valid?", valid);

    if (!valid) throw new ApiError(401, "Invalid email or password");

    console.log("[LOGIN] Step 7: generating tokens");
    const tokens = generateTokens(user.id);
    console.log("[LOGIN] Step 8: tokens generated");

    console.log("[LOGIN] Step 9: saving refresh token");
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    console.log("[LOGIN] Step 10: success, returning user + tokens");

    return { user, tokens };
  } catch (error) {
    console.error("[LOGIN] ERROR at step:", error);
    throw error;
  }
};

const refreshTokens = async (oldRefreshToken) => {
  const tokenDoc = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
    include: { user: true },
  });

  if (!tokenDoc || tokenDoc.revoked || tokenDoc.expiresAt < new Date()) {
    throw new ApiError(401, "Invalid refresh token");
  }

  await prisma.refreshToken.update({
    where: { id: tokenDoc.id },
    data: { revoked: true },
  });

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

/**
 * Handle Google OAuth login: generate app tokens for the authenticated user.
 * @param {Object} googleUser 
 * @returns {Promise<{user: Object, tokens: Object}>}
 */
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

module.exports = { registerUser, loginUser, refreshTokens, googleLogin };