const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const MAX_METADATA_LENGTH = 4000;

function getOptionalUserId(req) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.userId || null;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const userId = getOptionalUserId(req);

  if (!userId) {
    return res.status(401).json({ success: false, error: 'נדרשת התחברות' });
  }

  req.userId = userId;
  next();
}

function normalizeString(value, maxLength = 255) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxLength);
}

function safeMetadata(value) {
  if (value == null) {
    return null;
  }

  try {
    const serialized = JSON.stringify(value);
    return serialized.length > MAX_METADATA_LENGTH
      ? serialized.slice(0, MAX_METADATA_LENGTH)
      : serialized;
  } catch {
    return null;
  }
}

function hashRequestFingerprint(req) {
  const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  return crypto
    .createHash('sha256')
    .update(`${ip}|${userAgent}`)
    .digest('hex');
}

router.post('/events', async (req, res) => {
  try {
    const eventName = normalizeString(req.body.eventName, 80);

    if (!eventName) {
      return res.status(400).json({ success: false, error: 'eventName is required' });
    }

    const userId = getOptionalUserId(req);
    await db.query(
      `INSERT INTO analytics_events (
        event_name, path, title, client_id, session_id, user_id,
        referrer, utm_source, utm_medium, utm_campaign, utm_term,
        utm_content, ip_hash, user_agent, metadata
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11,
        $12, $13, $14, $15
      )`,
      [
        eventName,
        normalizeString(req.body.path, 512),
        normalizeString(req.body.title, 255),
        normalizeString(req.body.clientId, 128),
        normalizeString(req.body.sessionId, 128),
        userId,
        normalizeString(req.body.referrer, 512),
        normalizeString(req.body.utmSource, 128),
        normalizeString(req.body.utmMedium, 128),
        normalizeString(req.body.utmCampaign, 128),
        normalizeString(req.body.utmTerm, 128),
        normalizeString(req.body.utmContent, 128),
        hashRequestFingerprint(req),
        normalizeString(req.headers['user-agent'], 512),
        safeMetadata(req.body.metadata),
      ]
    );

    res.status(202).json({ success: true });
  } catch (error) {
    console.error('❌ Analytics event error:', error.message);
    res.status(500).json({ success: false, error: 'שגיאה בשמירת אנליטיקה' });
  }
});

router.get('/summary', requireAuth, async (req, res) => {
  try {
    const requestedDays = Number.parseInt(req.query.days, 10);
    const days = Number.isFinite(requestedDays) && requestedDays > 0 && requestedDays <= 365
      ? requestedDays
      : 7;

    const totals = await db.one(
      `SELECT
        COUNT(*)::int AS total_events,
        COUNT(DISTINCT client_id)::int AS unique_visitors,
        COUNT(DISTINCT session_id)::int AS unique_sessions,
        COALESCE(SUM(CASE WHEN event_name = 'page_view' THEN 1 ELSE 0 END), 0)::int AS page_views,
        COALESCE(SUM(CASE WHEN event_name != 'page_view' THEN 1 ELSE 0 END), 0)::int AS usage_events,
        COUNT(DISTINCT user_id)::int AS authenticated_users
      FROM analytics_events
      WHERE created_at >= NOW() - ($1::text || ' days')::interval`,
      [String(days)]
    );

    const topPages = await db.many(
      `SELECT
        COALESCE(path, '(unknown)') AS path,
        COUNT(*)::int AS views,
        COUNT(DISTINCT session_id)::int AS sessions
      FROM analytics_events
      WHERE created_at >= NOW() - ($1::text || ' days')::interval
        AND event_name = 'page_view'
      GROUP BY COALESCE(path, '(unknown)')
      ORDER BY views DESC
      LIMIT 10`,
      [String(days)]
    );

    const topCampaigns = await db.many(
      `SELECT
        COALESCE(utm_campaign, '(none)') AS campaign,
        COALESCE(utm_source, '(none)') AS source,
        COALESCE(utm_medium, '(none)') AS medium,
        COUNT(*)::int AS events,
        COUNT(DISTINCT client_id)::int AS visitors
      FROM analytics_events
      WHERE created_at >= NOW() - ($1::text || ' days')::interval
      GROUP BY COALESCE(utm_campaign, '(none)'), COALESCE(utm_source, '(none)'), COALESCE(utm_medium, '(none)')
      ORDER BY events DESC
      LIMIT 10`,
      [String(days)]
    );

    const topUsageEvents = await db.many(
      `SELECT
        event_name,
        COUNT(*)::int AS events,
        COUNT(DISTINCT session_id)::int AS sessions
      FROM analytics_events
      WHERE created_at >= NOW() - ($1::text || ' days')::interval
        AND event_name != 'page_view'
      GROUP BY event_name
      ORDER BY events DESC
      LIMIT 10`,
      [String(days)]
    );

    const daily = await db.many(
      `SELECT
        DATE(created_at) AS date,
        COUNT(*)::int AS total_events,
        COUNT(DISTINCT client_id)::int AS visitors,
        COUNT(DISTINCT session_id)::int AS sessions,
        COALESCE(SUM(CASE WHEN event_name = 'page_view' THEN 1 ELSE 0 END), 0)::int AS page_views
      FROM analytics_events
      WHERE created_at >= NOW() - ($1::text || ' days')::interval
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC`,
      [String(days)]
    );

    res.json({
      success: true,
      range: { days },
      totals,
      topPages,
      topCampaigns,
      topUsageEvents,
      daily,
    });
  } catch (error) {
    console.error('❌ Analytics summary error:', error.message);
    res.status(500).json({ success: false, error: 'שגיאה בשליפת אנליטיקה' });
  }
});

module.exports = router;
