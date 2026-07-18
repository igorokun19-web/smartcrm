// v2.1: Igor Okun + Demo Video Launch (2026-07-18)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// Verify critical environment variables
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  JWT_SECRET not set! Using temporary secret.');
}

// ============================================
// SECURITY MIDDLEWARE
// ============================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      mediaSrc: ["'self'", 'https:'],
      videoSrc: ["'self'", 'blob:', 'https:'],
      objectSrc: ["'self'"],
    }
  },
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
  keyGenerator: (req) => req.ip
});

// CORS configuration
const allowedOrigins = [
  'http://localhost:5175',
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL,
  'https://smartcrm-3cle.onrender.com'
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

// Body parser with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve static files (frontend) - MUST BE BEFORE API ROUTES
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, {
  dotfiles: 'deny', // Security: don't serve dotfiles
  index: 'index.html',
  maxAge: '1h'
}));

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'טוקן נדרש'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'dev-secret', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'טוקן לא חוקי או פג תוקף'
      });
    }
    req.user = user;
    next();
  });
}

// ============================================
// API ROUTES
// ============================================

// Auth routes with rate limiting on login
app.use('/api/auth/login', authLimiter);
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MyServices CRM Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ERROR HANDLING
// ============================================

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
      error: 'הנתיה לא נמצא'
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════╗
║  🚀 MyServices CRM Backend Server      ║
╠════════════════════════════════════════╣
║  ✅ Running on port ${PORT}              ║
║  📍 Local: http://localhost:${PORT}      ║
║  🌐 Frontend: ${process.env.FRONTEND_URL}  ║
║  🔐 Database: SQLite (crm.db)          ║
║  ✨ Features:                          ║
║    • Password Hashing (bcryptjs)       ║
║    • JWT Authentication                ║
║    • Remember Me (7/30 days)           ║
║    • Password Recovery Email           ║
╚════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⛔ Server shutting down...');
  db.close();
  process.exit(0);
});
