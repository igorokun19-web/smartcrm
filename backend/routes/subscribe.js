const express = require('express');
const db = require('../db');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get('/stats', async (req, res) => {
  try {
    const row = await db.one('SELECT COUNT(*)::int AS count FROM users WHERE username != $1', ['admin']);
    res.json({ success: true, userCount: Math.max(row?.count || 0, 0) });
  } catch {
    res.json({ success: true, userCount: 0 });
  }
});

router.post('/', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : null;
  const source = typeof req.body?.source === 'string' ? req.body.source.trim().slice(0, 50) : 'landing';

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ success: false, error: 'כתובת אימייל לא תקינה' });
  }

  try {
    await db.query(
      `INSERT INTO email_subscribers (email, source)
       VALUES ($1, $2)
       ON CONFLICT(email) DO NOTHING`,
      [email, source]
    );
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ success: false, error: 'שגיאה בשמירה' });
  }
});

module.exports = router;
