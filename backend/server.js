const path = require('path');
const fs = require('fs');

// Robustly load environment variables from backend/.env, root .env, or working directory
[
  path.join(__dirname, '.env'),
  path.join(__dirname, '../.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(process.cwd(), '.env'),
].forEach((envFile) => {
  if (fs.existsSync(envFile)) {
    require('dotenv').config({ path: envFile });
  }
});

const express = require('express');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

// Security & Authentication Middlewares
const {
  nosqlSanitizer,
  authRateLimiter,
  orderRateLimiter,
  feedbackRateLimiter,
  generalRateLimiter
} = require('./middleware/securityMiddleware');

// Route Handlers
const menuRoutes = require('./routes/menuRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const tableRoutes = require('./routes/tableRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { router: loyaltyRoutes } = require('./routes/loyaltyRoutes');


// Connect to MongoDB (non-blocking initialization)
connectDB().catch((err) => {
  console.warn('Initial MongoDB Connection Warning:', err.message);
});

const app = express();

// High-Performance HTTP Response Compression (Gzip / Deflate)
app.use(compression());

// 1. Helmet HTTP Security Headers (prevents clickjacking, MIME sniffing, XSS)
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for external QR code CDNs and fonts
    crossOriginEmbedderPolicy: false
  })
);

// 2. CORS Configuration — Allowlist-based; credentials only for known origins
const DEV_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

const isDevMode = (process.env.NODE_ENV || 'development') !== 'production';

// In production set ALLOWED_ORIGINS as comma-separated list in .env
const productionOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()).filter(Boolean)
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin header)
      if (!origin) return callback(null, true);

      // In dev mode allow any localhost or 127.0.0.1 port (5173, 5174, 3000, etc.)
      if (isDevMode && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // In dev mode also allow any LAN IP (192.168.x.x / 10.x.x.x)
      if (isDevMode && /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01]))/.test(origin)) {
        return callback(null, true);
      }

      // Automatically allow all Vercel deployment domains (*.vercel.app)
      try {
        const url = new URL(origin);
        if (url.hostname.endsWith('.vercel.app')) {
          return callback(null, true);
        }
      } catch (e) {}

      // Allow origins explicitly listed in ALLOWED_ORIGINS
      if (productionOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow VERCEL_URL if set in environment
      if (process.env.VERCEL_URL && origin.includes(process.env.VERCEL_URL)) {
        return callback(null, true);
      }

      // Reject cleanly without crashing Express with an unhandled 500 error
      callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-dev-secret'],
    credentials: true,
    maxAge: 86400 // 24 hours pre-flight caching
  })
);

// 3. Body Parser with Payload Size Limit (prevents large JSON memory exhaustion attacks)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. NoSQL Injection Sanitizer across all incoming requests
app.use(nosqlSanitizer);

// 5. Database Connection Assurance Middleware (crucial for Serverless cold-starts & resilience)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection middleware error:', err.message);
    if (req.path === '/' || req.path === '/api/health') {
      return res.status(200).json({
        status: 'degraded',
        system: 'AURA Gastronomy Commercial Operating System',
        database: 'disconnected',
        message: 'Server is running, but database connection is pending or unavailable.',
        timestamp: new Date().toISOString()
      });
    }
    return res.status(503).json({
      success: false,
      message: 'Database temporarily unavailable. Please verify database connection configuration.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// 5. Rate Limiting Protection on Sensitive Endpoints
app.use('/api/auth/register', authRateLimiter);
app.use('/api/auth/login', authRateLimiter);
app.use('/api/orders', orderRateLimiter);
app.use('/api/loyalty/feedback-reward', feedbackRateLimiter);
app.use('/api', generalRateLimiter);

// 6. API Routes
app.use('/api', menuRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/loyalty', loyaltyRoutes);

// Health check endpoint
app.get(['/', '/api/health'], (req, res) => {
  res.json({
    status: 'online',
    system: 'AURA Gastronomy Commercial Operating System',
    timestamp: new Date().toISOString()
  });
});

// Centralized Secure Error Handler (prevents stack trace leaks in production)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const isDev = process.env.NODE_ENV === 'development';
  res.status(err.status || 500).json({
    success: false,
    message: isDev ? err.message : 'An unexpected error occurred. Please contact restaurant administration.',
    ...(isDev && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

let server;
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (accessible on LAN) with Enterprise Security`);
  });
}

// Graceful Process Lifecycle Management
const gracefulShutdown = (signal) => {
  console.log(`[${signal}] Initiating graceful shutdown...`);
  if (server) {
    server.close(() => {
      console.log('HTTP server closed cleanly.');
      mongoose.connection.close(false).then(() => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      }).catch(() => process.exit(0));
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception caught:', error);
});

module.exports = app;
