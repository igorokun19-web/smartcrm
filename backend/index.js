require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5175',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend) - MUST BE BEFORE API ROUTES
console.log('🔍 Static files path:', path.join(__dirname, 'public'));
app.use(express.static(path.join(__dirname, 'public'), {
  dotfiles: 'allow',
  index: 'index.html'
}));

// ============================================
// API ROUTES
// ============================================

app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MyServices CRM Backend API',
    version: '1.0.0'
  });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    error: 'שגיאה בשרת'
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
