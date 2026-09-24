const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { generalLimiter } = require('./middleware/rateLimitMiddleware');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const unitRoutes = require('./routes/unitRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const bookmarkRoutes = require('./routes/bookmarkRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Trust reverse proxies (essential for Vercel and secure cookies/rate limiting)
app.set('trust proxy', 1);

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false, // Allows flexible PDF embeds and client assets
  })
);

// CORS configuration supporting production FRONTEND_URL and Vercel preview deployments
const configuredFrontend = (process.env.FRONTEND_URL || '').trim().replace(/\/+$/, '');
const allowedOrigins = [
  configuredFrontend,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, server-to-server, curl, Postman)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.trim().replace(/\/+$/, '');

      if (
        process.env.NODE_ENV !== 'production' ||
        allowedOrigins.includes(normalizedOrigin) ||
        (configuredFrontend && normalizedOrigin === configuredFrontend) ||
        normalizedOrigin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Respond to preflight requests
app.options('*', cors());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global Rate Limiting
app.use(generalLimiter);

// Root informative endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StudyHub API is running',
    health: '/api/health',
  });
});

// Health check endpoint (Strictly matching requirement)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StudyHub API is running',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all 404 & Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
