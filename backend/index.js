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

// Serve static files (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// ROOT ROUTE
// ============================================

app.get('/', (req, res) => {
  res.json({ message: 'SmartCRM Backend is running', status: 'ok' });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MyServices CRM Backend API',
    version: '1.0.0'
  });
});

// ============================================
// ROUTES
// ============================================

// Authentication routes (Login, Forgot Password, Reset Password, etc.)
app.use('/api/auth', authRoutes);

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
  // If it's an API request, return 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'הנתיב לא נמצא'
    });
  }
  // For non-API requests, serve index.html (for React Router)
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
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
