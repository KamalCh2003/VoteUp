require('dotenv').config(); // ← FIRST LINE, BEFORE ANYTHING ELSE

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const electionRoutes = require('./routes/election.routes');
const voteRoutes = require('./routes/vote.routes');
const adminRoutes = require('./routes/admin.routes');
// const admindashboardRoutes = require('./routes/admindashboard.routes');


const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/admin/dashboard', admindashboardRoutes);

app.use((req, res) => {
  return res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;