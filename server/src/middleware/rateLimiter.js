const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV === 'development';

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 5000 : 200,         
  message: { error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 2000 : 30,           
  message: { error: 'Too many authentication attempts, please try again later' },
});

module.exports = { generalLimiter, authLimiter };