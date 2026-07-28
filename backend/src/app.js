const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const errorHandler = require('./middleware/errorMiddleware');
const AppError = require('./utils/appError');

// Load env variables
dotenv.config();

const app = express();

// Enable CORS with support for credentials (cookies)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check API
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CampusRank API health check passed',
    timestamp: new Date().toISOString()
  });
});

// Register routers
const authRouter = require('./routes/auth.routes');
const transcriptRouter = require('./routes/transcript.routes');
const leaderboardRouter = require('./routes/leaderboard.routes');
const analyticsRouter = require('./routes/analytics.routes');
const notificationRouter = require('./routes/notification.routes');
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/transcripts', transcriptRouter);
app.use('/api/v1/leaderboard', leaderboardRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/notifications', notificationRouter);

// Undefined routes catch-all
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
