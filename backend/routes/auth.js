const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { sendPasswordResetEmail } = require('../utils/email');
const crypto = require('crypto');
const validator = require('validator');

const JWT_SECRET = process.env.JWT_SECRET;
const DEFAULT_BILLING_DESCRIPTOR = process.env.BILLING_DESCRIPTOR || 'RYNEX';

function createToken(userId, rememberMe = false) {
  const expiresIn = rememberMe ? '30d' : '7d';
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn });
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

function validateUsername(username) {
  return typeof username === 'string' && username.trim().length > 0 && username.length < 50;
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 6 && password.length < 100;
}

function validateEmail(email) {
  return validator.isEmail(email);
}

router.post('/login', async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;

    if (!validateUsername(username)) {
      return res.status(400).json({ success: false, error: 'שם משתמש לא חוקי' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ success: false, error: 'סיסמה לא חוקית' });
    }

    const user = await db.one('SELECT * FROM users WHERE username = $1', [username.trim()]);

    if (!user) {
      return res.status(401).json({ success: false, error: 'שם משתמש או סיסמה לא נכונים' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: 'שם משתמש או סיסמה לא נכונים' });
    }

    const token = createToken(user.id, rememberMe);

    if (rememberMe) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await db.query(
        `INSERT INTO sessions (user_id, token, expires_at, device_name)
         VALUES ($1, $2, $3, $4)`,
        [user.id, token, expiresAt.toISOString(), 'Mobile Device']
      );
    }

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, error: 'שגיאה בהתחברות' });
  }
});

router.post('/validate-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(401).json({ success: false, error: 'טוקן לא חוקי' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.one('SELECT id, username, name, email FROM users WHERE id = $1', [decoded.userId]);

    if (!user) {
      return res.status(401).json({ success: false, error: 'משתמש לא נמצא' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('⚠️  Token validation error:', error.message);
    res.status(401).json({ success: false, error: 'טוקן לא חוקי' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ success: false, error: 'דוא״ל לא חוקי' });
    }

    const user = await db.one('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);

    if (!user) {
      return res.json({ success: true, message: 'אם הדוא״ל רשום, קישור איפוס יישלח לו' });
    }

    const resetToken = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await db.query(
      `INSERT INTO password_resets (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, resetToken, expiresAt.toISOString()]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const emailResult = await sendPasswordResetEmail(user.email, user.name, resetLink);

    if (!emailResult?.success) {
      console.error('❌ Password reset email failed:', emailResult?.error || 'unknown reason');
      return res.status(503).json({
        success: false,
        error: 'שליחת מייל לאיפוס סגורה זמנית. נסה שוב בעוד כמה דקות.'
      });
    }

    res.json({ success: true, message: 'קישור איפוס סיסמה נשלח לדוא״ל שלך' });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ success: false, error: 'שליחת מייל לאיפוס סגורה זמנית. נסה שוב בעוד כמה דקות.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ success: false, error: 'טוקן לא חוקי' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ success: false, error: 'הסיסמה חייבת להיות לפחות 6 תווים' });
    }

    const resetRecord = await db.one(
      `SELECT * FROM password_resets
       WHERE token = $1 AND used = FALSE AND expires_at > NOW()`,
      [token]
    );

    if (!resetRecord) {
      return res.status(400).json({ success: false, error: 'קישור איפוס לא חוקי או פג תוקף' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 12);

    await db.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, resetRecord.user_id]);
    await db.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [resetRecord.id]);

    res.json({ success: true, message: 'סיסמה שונתה בהצלחה' });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ success: false, error: 'שגיאה בשינוי סיסמה' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { token } = req.body;

    if (token) {
      await db.query('UPDATE sessions SET expires_at = NOW() WHERE token = $1', [token]);
    }

    res.json({ success: true, message: 'התנתקת בהצלחה' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'שגיאה בהתנתקות' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword, name } = req.body;

    if (!validateUsername(username)) {
      return res.status(400).json({ success: false, error: 'שם משתמש לא חוקי (2-50 תווים)' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, error: 'דוא"ל לא חוקי' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ success: false, error: 'סיסמה חייבת להיות בין 6-100 תווים' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'הסיסמאות אינן תואמות' });
    }

    if (!name || name.trim().length === 0 || name.length > 100) {
      return res.status(400).json({ success: false, error: 'שם מלא נדרש' });
    }

    const existingUsername = await db.one('SELECT id FROM users WHERE username = $1', [username.trim()]);
    if (existingUsername) {
      return res.status(400).json({ success: false, error: 'שם משתמש זה כבר תפוס' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingEmail = await db.one('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existingEmail) {
      return res.status(400).json({ success: false, error: 'דוא"ל זה כבר רשום במערכת' });
    }

    const hashedPassword = bcrypt.hashSync(password, 12);
    const trialStartAt = new Date().toISOString();
    const trialEndAt = new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString();

    const insert = await db.one(
      `INSERT INTO users (
        username, email, password_hash, name,
        plan, subscription_status, trial_started_at, trial_ends_at,
        trial_extension_days, billing_descriptor, language_preference
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [
        username.trim(),
        normalizedEmail,
        hashedPassword,
        name.trim(),
        'free_trial',
        'trialing',
        trialStartAt,
        trialEndAt,
        14,
        DEFAULT_BILLING_DESCRIPTOR,
        'he',
      ]
    );

    const token = createToken(insert.id, false);

    res.status(201).json({
      success: true,
      message: 'משתמש נרשם בהצלחה',
      token,
      user: {
        id: insert.id,
        username: username.trim(),
        name: name.trim(),
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ success: false, error: 'שגיאה בהרשמה' });
  }
});

module.exports = router;
