const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { runBillingLifecycle } = require('../services/billingLifecycle');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const MAX_LEADS_PER_ACCOUNT = 5000;
const OWNER_USERNAMES = new Set(
  (process.env.OWNER_USERNAMES || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
);

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'נדרשת התחברות' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(403).json({ success: false, error: 'טוקן לא חוקי או פג תוקף' });
  }
}

function isValidLead(lead) {
  return lead && typeof lead === 'object' && lead.id != null && typeof lead.name === 'string';
}

function requireBillingAccess(req, res, next) {
  try {
    const user = db.prepare(`
      SELECT username, subscription_status
      FROM users
      WHERE id = ?
    `).get(req.userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'משתמש לא נמצא' });
    }

    if (OWNER_USERNAMES.has(user.username.toLowerCase())) {
      return next();
    }

    runBillingLifecycle('crm_access');

    const allowedStatuses = new Set(['trialing', 'active']);
    if (!allowedStatuses.has(user.subscription_status)) {
      return res.status(402).json({
        success: false,
        error: 'נדרש מנוי פעיל כדי להשתמש במערכת CRM',
        code: 'SUBSCRIPTION_REQUIRED',
      });
    }

    next();
  } catch (error) {
    console.error('Billing access guard error:', error.message);
    return res.status(500).json({ success: false, error: 'שגיאה באימות סטטוס מנוי' });
  }
}

router.get('/leads', requireAuth, requireBillingAccess, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT payload
      FROM crm_leads
      WHERE owner_id = ?
      ORDER BY updated_at DESC
    `).all(req.userId);

    const leads = rows.flatMap((row) => {
      try {
        return [JSON.parse(row.payload)];
      } catch {
        return [];
      }
    });

    res.json({ success: true, leads });
  } catch (error) {
    console.error('CRM lead retrieval error:', error.message);
    res.status(500).json({ success: false, error: 'שגיאה בשליפת לידים' });
  }
});

router.put('/leads', requireAuth, requireBillingAccess, (req, res) => {
  const leads = req.body?.leads;

  if (!Array.isArray(leads) || leads.length > MAX_LEADS_PER_ACCOUNT || !leads.every(isValidLead)) {
    return res.status(400).json({ success: false, error: 'נתוני לידים לא תקינים' });
  }

  const uniqueIds = new Set(leads.map((lead) => String(lead.id)));
  if (uniqueIds.size !== leads.length) {
    return res.status(400).json({ success: false, error: 'מזהי לידים חייבים להיות ייחודיים' });
  }

  const replaceLeads = db.transaction((ownerId, rows) => {
    db.prepare('DELETE FROM crm_leads WHERE owner_id = ?').run(ownerId);
    const insert = db.prepare(`
      INSERT INTO crm_leads (id, owner_id, payload, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const updatedAt = new Date().toISOString();

    rows.forEach((lead) => {
      insert.run(String(lead.id), ownerId, JSON.stringify(lead), lead.createdAt || updatedAt, updatedAt);
    });
  });

  try {
    replaceLeads(req.userId, leads);
    res.json({ success: true, count: leads.length });
  } catch (error) {
    console.error('CRM lead synchronization error:', error.message);
    res.status(500).json({ success: false, error: 'שגיאה בשמירת לידים' });
  }
});

module.exports = router;