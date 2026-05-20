const authService = require('../services/auth.service');
const catchAsync = require('../utils/catchAsync');

const register = catchAsync(async (req, res) => {
   console.log('Register request body:', req.body);
  const { name, email, password, role, contestantId, electionId } = req.body;
  const { user, tokens } = await authService.registerUser({
    name,
    email,
    password,
    role,
    contestantId,
    electionId,
  });
  return res.status(201).json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tokens,
    },
  });
});

const login = catchAsync(async (req, res) => {
   console.log('[CONTROLLER] login hit, body:', req.body); 
  const { email, password } = req.body;
    console.log('[CONTROLLER] email:', email, 'password present?', !!password);
  const { user, tokens } = await authService.loginUser({ email, password });
  return res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tokens,
    },
  });
});

const googleCallback = catchAsync(async (req, res) => {
  const { user, tokens } = req.user;
  return res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tokens,
    },
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const { user, tokens } = await authService.refreshTokens(refreshToken);
  return res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      tokens,
    },
  });
});

const getMe = catchAsync(async (req, res) => {
  return res.json({ success: true, data: req.user });
});

module.exports = { register, login, googleCallback, refreshToken, getMe };