const express = require('express');
const db = require('../db');
const { runBillingLifecycle } = require('../services/billingLifecycle');

const router = express.Router();
const { requireAuth } = require('../middleware/requireAuth');

const MAX_LEADS_PER_ACCOUNT = 5000;

function isValidLead(lead) {
  return lead && typeof lead === 'object' && lead.id != null && typeof lead.name === 'string';
}

async function requireBillingAccess(req, res, next) {
  try {
    const user = await db.one(
      `SELECT username, subscription_status
       FROM users
       WHERE id = $1`,
      [req.userId]
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'משתמש לא נמצא' });
    }

    if (OWNER_USERNAMES.has(String(user.username || '').toLowerCase())) {
      return next();
    }

    await runBillingLifecycle('crm_access');

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

router.get('/leads', requireAuth, requireBillingAccess, async (req, res) => {
  try {
    const rows = await db.many(
      `SELECT payload
       FROM crm_leads
       WHERE owner_id = $1
       ORDER BY updated_at DESC`,
      [req.userId]
    );

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

router.put('/leads', requireAuth, requireBillingAccess, async (req, res) => {
  const leads = req.body?.leads;

  if (!Array.isArray(leads) || leads.length > MAX_LEADS_PER_ACCOUNT || !leads.every(isValidLead)) {
    return res.status(400).json({ success: false, error: 'נתוני לידים לא תקינים' });
  }

  const uniqueIds = new Set(leads.map((lead) => String(lead.id)));
  if (uniqueIds.size !== leads.length) {
    return res.status(400).json({ success: false, error: 'מזהי לידים חייבים להיות ייחודיים' });
  }

  try {
    await db.tx(async (tx) => {
      await tx.query('DELETE FROM crm_leads WHERE owner_id = $1', [req.userId]);

      const updatedAt = new Date().toISOString();
      for (const lead of leads) {
        await tx.query(
          `INSERT INTO crm_leads (id, owner_id, payload, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5)`,
          [String(lead.id), req.userId, JSON.stringify(lead), lead.createdAt || updatedAt, updatedAt]
        );
      }
    });

    res.json({ success: true, count: leads.length });
  } catch (error) {
    console.error('CRM lead synchronization error:', error.message);
    res.status(500).json({ success: false, error: 'שגיאה בשמירת לידים' });
  }
});

module.exports = router;
