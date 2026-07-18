const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { sendPasswordResetEmail } = require('../utils/email');
const crypto = require('crypto');
const validator = require('validator');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// Helper: Create JWT token
function createToken(userId, rememberMe = false) {
  const expiresIn = rememberMe ? '30d' : '7d';
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn });
}

// Helper: Generate random token for password reset
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Helper: Validate input
function validateUsername(username) {
  return typeof username === 'string' && username.trim().length > 0 && username.length < 50;
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6 && password.length < 100;
}

function validateEmail(email) {
  return validator.isEmail(email);
}

// ============================================
// 1. LOGIN WITH PASSWORD HASHING (bcryptjs)
// ============================================
router.post('/login', (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;

    // Validation
    if (!validateUsername(username)) {
      return res.status(400).json({
        success: false,
        error: 'שם משתמש לא חוקי'
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'סיסמה לא חוקית'
      });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'שם משתמש או סיסמה לא נכונים'
      });
    }

    // Verify password (bcrypt)
    const isValidPassword = bcrypt.compareSync(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'שם משתמש או סיסמה לא נכונים'
      });
    }

    // Generate token (with "Remember Me" support)
    const token = createToken(user.id, rememberMe);

    // Create session record
    if (rememberMe) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      const stmt = db.prepare(`
        INSERT INTO sessions (user_id, token, expires_at, device_name)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(user.id, token, expiresAt.toISOString(), 'Mobile Device');
    }

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'שגיאה בהתחברות'
    });
  }
});

// ============================================
// 2. REMEMBER ME - VALIDATE TOKEN
// ============================================
router.post('/validate-token', (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(401).json({ success: false, error: 'טוקן לא חוקי' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

    // Get user
    const user = db.prepare('SELECT id, username, name, email FROM users WHERE id = ?').get(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, error: 'משתמש לא נמצא' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('⚠️  Token validation error:', error.message);
    res.status(401).json({
      success: false,
      error: 'טוקן לא חוקי'
    });
  }
});

// ============================================
// 3. PASSWORD RECOVERY - REQUEST RESET
// ============================================
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'דוא״ל לא חוקי'
      });
    }

    // Find user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());

    if (!user) {
      // Security: Don't reveal if email exists
      return res.json({
        success: true,
        message: 'אם הדוא״ל רשום, קישור איפוס יישלח לו'
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Store in database
    const stmt = db.prepare(`
      INSERT INTO password_resets (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `);
    stmt.run(user.id, resetToken, expiresAt.toISOString());

    // Send email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, user.name, resetLink);

    res.json({
      success: true,
      message: 'קישור איפוס סיסמה נשלח לדוא״ל שלך'
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'שגיאה בשליחת דוא״ל איפוס'
    });
  }
});

// ============================================
// 4. PASSWORD RECOVERY - RESET PASSWORD
// ============================================
router.post('/reset-password', (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Validation
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'טוקן לא חוקי'
      });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        error: 'הסיסמה חייבת להיות לפחות 6 תווים'
      });
    }

    // Find valid reset token
    const resetRecord = db.prepare(`
      SELECT * FROM password_resets 
      WHERE token = ? AND used = 0 AND expires_at > datetime('now')
    `).get(token);

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        error: 'קישור איפוס לא חוקי או פג תוקף'
      });
    }

    // Hash new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update user password
    const updateStmt = db.prepare(`
      UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    updateStmt.run(hashedPassword, resetRecord.user_id);

    // Mark token as used
    const markUsedStmt = db.prepare(`
      UPDATE password_resets SET used = 1 WHERE id = ?
    `);
    markUsedStmt.run(resetRecord.id);

    res.json({
      success: true,
      message: 'סיסמה שונתה בהצלחה'
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'שגיאה בשינוי סיסמה'
    });
  }
});

// ============================================
// LOGOUT / INVALIDATE SESSION
// ============================================
router.post('/logout', (req, res) => {
  try {
    const { token } = req.body;

    if (token) {
      // Mark session as expired
      const stmt = db.prepare(`
        UPDATE sessions SET expires_at = datetime('now') WHERE token = ?
      `);
      stmt.run(token);
    }

    res.json({
      success: true,
      message: 'התנתקת בהצלחה'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'שגיאה בהתנתקות'
    });
  }
});

module.exports = router;
