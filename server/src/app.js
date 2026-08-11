const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const passport = require('passport');

const { generalLimiter } = require('./middleware/rateLimiter');
require('./config/passport');

// Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const electionRoutes = require('./routes/election.routes');
const candidateRoutes = require('./routes/candidate.routes');
const voteRoutes = require('./routes/vote.routes');
const paymentRoutes = require('./routes/payment.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');
const publicRoutes = require('./routes/public.routes');

const app = express();


// Security middleware
app.use(helmet());


// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));


// Body parser
app.use(express.json({ limit: '10mb' }));

app.set("trust proxy", 1);
// Rate limiter
app.use(generalLimiter);


// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'voteup-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));


// Passport OAuth
app.use(passport.initialize());
app.use(passport.session());


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/public', publicRoutes);


// Root route
app.get('/', (req, res) => {
  res.json({
    name: "VoteUp API",
    message: "Server is running successfully ",
    status: "OK"
  });
});


// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date()
  });
});


// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl
  });
});


// Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  const status = err.statusCode || 500;

  res.status(status).json({
    error: err.message || "Internal server error"
  });
});


module.exports = app;