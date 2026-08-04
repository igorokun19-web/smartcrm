const express = require('express');
const db = require('../db');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : null;
  const source = typeof req.body?.source === 'string' ? req.body.source.trim().slice(0, 50) : 'landing';

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return res.status(400).json({ success: false, error: 'כתובת אימייל לא תקינה' });
  }

  try {
    db.prepare(`
      INSERT INTO email_subscribers (email, source) VALUES (?, ?)
      ON CONFLICT(email) DO NOTHING
    `).run(email, source);
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ success: false, error: 'שגיאה בשמירה' });
  }
});

module.exports = router;
