const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'votechain-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'votechain-refresh-secret';
const JWT_EXPIRES_IN = '7d';
const JWT_REFRESH_EXPIRES_IN = '30d';

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  generateToken,
  generateRefreshToken,
  verifyToken,
};