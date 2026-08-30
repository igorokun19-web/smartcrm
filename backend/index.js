// v2.1: Igor Okun + Demo Video Launch (2026-07-18)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';
let databaseState = 'starting';
let server;
let isShuttingDown = false;

if (!process.env.JWT_SECRET) {
  if (isProduction) {
    throw new Error('JWT_SECRET is required in production');
  }

  process.env.JWT_SECRET = 'dev-only-jwt-secret-change-before-production';
  console.warn('⚠️  JWT_SECRET not set. Using development-only fallback secret.');
}

const authRoutes = require('./routes/auth');
const analyticsRoutes = require('./routes/analytics');
const crmRoutes = require('./routes/crm');
const billingRoutes = require('./routes/billing');
const subscribeRoutes = require('./routes/subscribe');
const { runBillingLifecycle } = require('./services/billingLifecycle');

app.disable('x-powered-by');

const trustProxyValue = process.env.TRUST_PROXY;
if (trustProxyValue) {
  const asNumber = Number(trustProxyValue);
  app.set('trust proxy', Number.isInteger(asNumber) ? asNumber : trustProxyValue);
} else if (isProduction) {
  app.set('trust proxy', 1);
}

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      mediaSrc: ["'self'", 'blob:', 'https:'],
      objectSrc: ["'none'"],
    }
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'יותר מדי ניסיונות התחברות. נסה שוב בעוד 15 דקות.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  skipSuccessfulRequests: true,
});

const billingMutationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: 'יותר מדי פעולות חיוב. נסה שוב בעוד מספר דקות.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip)
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 registrations per hour
  message: 'יותר מדי בקשות הרשמה. נסה שוב בעוד שעה.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip)
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 reset requests per hour
  message: 'יותר מדי בקשות איפוס סיסמה. נסה שוב בעוד שעה.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(req.ip)
});



// CORS configuration
const devOrigins = [
  'http://localhost:5175',
  'http://localhost:3000',
  'http://localhost:3001',
  'https://smartcrm-3cle.onrender.com'
];

const envOrigins = (process.env.CORS_ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set(isProduction ? envOrigins : [...devOrigins, ...envOrigins]);
if (isProduction && allowedOrigins.size === 0) {
  throw new Error('CORS_ALLOWED_ORIGINS or FRONTEND_URL must be set in production');
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests with no Origin header.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
  exposedHeaders: ['Content-Length', 'Content-Type', 'Content-Range', 'Accept-Ranges']
}));

// Stripe requires the raw request body for webhook signature verification.
app.use('/api/billing/webhook', express.raw({ type: 'application/json', limit: '1mb' }));

// Body parser with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? '⚠️ ' : '✓ ';
    console.log(`${level}${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// ============================================
// VIDEO STREAMING ROUTES
// ============================================
const fs = require('fs');

app.get(['/demo_video.mp4', '/demo_video_hebrew.mp4', '/promo_video_landing.mp4'], (req, res) => {
  const fileName = req.path.substring(1); // Remove leading /
  const filePath = path.join(__dirname, 'public', fileName);
  
  // Security check
  if (!fs.existsSync(filePath)) {
    console.log(`Video not found: ${filePath}`);
    return res.status(404).json({ error: 'Video not found' });
  }
  
  try {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const rangeHeader = req.headers.range;
    
    // Set response headers
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    if (rangeHeader) {
      // Parse range request
      const range = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(range[0], 10);
      const end = range[1] ? parseInt(range[1], 10) : fileSize - 1;
      
      if (start > fileSize - 1 || end > fileSize - 1) {
        res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
        return;
      }
      
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', end - start + 1);
      
      const stream = fs.createReadStream(filePath, { start, end });
      stream.on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });
      stream.pipe(res);
    } else {
      // Send entire file
      res.setHeader('Content-Length', fileSize);
      const stream = fs.createReadStream(filePath);
      stream.on('error', (err) => {
        console.error('Stream error:', err);
        if (!res.headersSent) {
          res.status(500).end();
        }
      });
      stream.pipe(res);
    }
  } catch (err) {
    console.error('Video error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files (frontend)
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, {
  dotfiles: 'deny',
  index: 'index.html',
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    // Add proper headers for video files
    if (filePath.endsWith('.mp4') || filePath.endsWith('.webm') || filePath.endsWith('.ogg')) {
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  }
}));

// ============================================
// API ROUTES
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: databaseState,
    message: 'MyServices CRM Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/ready', (req, res) => {
  if (databaseState !== 'ready') {
    return res.status(503).json({
      status: 'starting',
      message: 'Service is initializing'
    });
  }

  res.json({ status: 'ready' });
});

app.use('/api', (req, res, next) => {
  if (databaseState === 'ready') {
    return next();
  }

  res.status(503).json({
    success: false,
    error: 'השירות עדיין עולה. נסה שוב בעוד רגע.'
  });
});

// Auth routes with rate limiting on login/register/password-reset
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth/forgot-password', passwordResetLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/billing/start-checkout', billingMutationLimiter);
app.use('/api/billing/cancel', billingMutationLimiter);
app.use('/api/billing/extend-trial', billingMutationLimiter);
app.use('/api/billing', billingRoutes);
app.use('/api/subscribe', subscribeRoutes);

// Keep trial lifecycle up to date without manual intervention.
const BILLING_LIFECYCLE_INTERVAL_MS = Number(process.env.BILLING_LIFECYCLE_INTERVAL_MS || 6 * 60 * 60 * 1000);

// ============================================
// ERROR HANDLING
// ============================================

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const message = isDevelopment ? err.message : 'שגיאה בשרת';
  
  res.status(err.status || 500).json({
    success: false,
    error: message,
    ...(isDevelopment && { details: err.message })
  });
});

// 404 handler - serve index.html for SPA routes
app.use((req, res) => {
  console.log(`[404 Handler] ${req.method} ${req.path}`);
  // If it's an API request, return 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'הנתיב לא נמצא'
    });
  }
  // For non-API requests, serve index.html (for React Router)
  const indexPath = path.join(__dirname, 'public', 'index.html');
  console.log(`[SPA Fallback] Serving: ${indexPath}`);
  res.sendFile(indexPath);
});

// ============================================
// START SERVER
// ============================================
async function startServer() {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔════════════════════════════════════════╗
║  🚀 MyServices CRM Backend Server      ║
╠════════════════════════════════════════╣
║  ✅ Running on port ${PORT}              ║
║  📍 Local: http://localhost:${PORT}      ║
║  🌐 Frontend: ${process.env.FRONTEND_URL}  ║
║  🔐 Database: PostgreSQL                ║
╚════════════════════════════════════════╝
  `);
  });

  try {
    await db.ready;
    databaseState = 'ready';
    console.log('✓ Database is ready to accept requests');
  } catch (error) {
    databaseState = 'error';
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }

  try {
    const startupLifecycleResult = await runBillingLifecycle('startup');
    console.log(`✓ Billing lifecycle startup scan: ${startupLifecycleResult.scanned} users, updated ${startupLifecycleResult.updated}`);
  } catch (error) {
    console.error('⚠️  Billing lifecycle startup error:', error.message);
  }

  setInterval(async () => {
    try {
      const result = await runBillingLifecycle('interval');
      if (result.updated > 0) {
        console.log(`✓ Billing lifecycle interval update: ${result.updated} users changed`);
      }
    } catch (error) {
      console.error('⚠️  Billing lifecycle interval error:', error.message);
    }
  }, BILLING_LIFECYCLE_INTERVAL_MS);

}

startServer().catch((error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});

function shutdown(signal) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`\n⛔ Server shutting down after ${signal}...`);

  const closeDatabase = () => {
    db.pool.end().finally(() => process.exit(0));
  };

  if (server) {
    server.close(closeDatabase);
  } else {
    closeDatabase();
  }
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
