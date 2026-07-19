const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
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
    return res.status(401).json({
      success: false,
      error: 'נדרשת התחברות'
    });
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

router.post('/events', (req, res) => {
  try {
    const eventName = normalizeString(req.body.eventName, 80);

    if (!eventName) {
      return res.status(400).json({
        success: false,
        error: 'eventName is required'
      });
    }

    const userId = getOptionalUserId(req);
    const stmt = db.prepare(`
      INSERT INTO analytics_events (
        event_name,
        path,
        title,
        client_id,
        session_id,
        user_id,
        referrer,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        ip_hash,
        user_agent,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
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
      safeMetadata(req.body.metadata)
    );

    res.status(202).json({ success: true });
  } catch (error) {
    console.error('❌ Analytics event error:', error.message);
    res.status(500).json({
      success: false,
      error: 'שגיאה בשמירת אנליטיקה'
    });
  }
});

router.get('/summary', requireAuth, (req, res) => {
  try {
    const requestedDays = Number.parseInt(req.query.days, 10);
    const days = Number.isFinite(requestedDays) && requestedDays > 0 && requestedDays <= 365
      ? requestedDays
      : 7;

    const filter = `created_at >= datetime('now', ?)`;
    const filterParam = `-${days} days`;

    const totals = db.prepare(`
      SELECT
        COUNT(*) AS total_events,
        COUNT(DISTINCT client_id) AS unique_visitors,
        COUNT(DISTINCT session_id) AS unique_sessions,
        SUM(CASE WHEN event_name = 'page_view' THEN 1 ELSE 0 END) AS page_views,
        SUM(CASE WHEN event_name != 'page_view' THEN 1 ELSE 0 END) AS usage_events,
        COUNT(DISTINCT user_id) AS authenticated_users
      FROM analytics_events
      WHERE ${filter}
    `).get(filterParam);

    const topPages = db.prepare(`
      SELECT
        COALESCE(path, '(unknown)') AS path,
        COUNT(*) AS views,
        COUNT(DISTINCT session_id) AS sessions
      FROM analytics_events
      WHERE ${filter} AND event_name = 'page_view'
      GROUP BY COALESCE(path, '(unknown)')
      ORDER BY views DESC
      LIMIT 10
    `).all(filterParam);

    const topCampaigns = db.prepare(`
      SELECT
        COALESCE(utm_campaign, '(none)') AS campaign,
        COALESCE(utm_source, '(none)') AS source,
        COALESCE(utm_medium, '(none)') AS medium,
        COUNT(*) AS events,
        COUNT(DISTINCT client_id) AS visitors
      FROM analytics_events
      WHERE ${filter}
      GROUP BY COALESCE(utm_campaign, '(none)'), COALESCE(utm_source, '(none)'), COALESCE(utm_medium, '(none)')
      ORDER BY events DESC
      LIMIT 10
    `).all(filterParam);

    const topUsageEvents = db.prepare(`
      SELECT
        event_name,
        COUNT(*) AS events,
        COUNT(DISTINCT session_id) AS sessions
      FROM analytics_events
      WHERE ${filter} AND event_name != 'page_view'
      GROUP BY event_name
      ORDER BY events DESC
      LIMIT 10
    `).all(filterParam);

    const daily = db.prepare(`
      SELECT
        date(created_at) AS date,
        COUNT(*) AS total_events,
        COUNT(DISTINCT client_id) AS visitors,
        COUNT(DISTINCT session_id) AS sessions,
        SUM(CASE WHEN event_name = 'page_view' THEN 1 ELSE 0 END) AS page_views
      FROM analytics_events
      WHERE ${filter}
      GROUP BY date(created_at)
      ORDER BY date(created_at) DESC
    `).all(filterParam);

    res.json({
      success: true,
      range: { days },
      totals,
      topPages,
      topCampaigns,
      topUsageEvents,
      daily
    });
  } catch (error) {
    console.error('❌ Analytics summary error:', error.message);
    res.status(500).json({
      success: false,
      error: 'שגיאה בשליפת אנליטיקה'
    });
  }
});

module.exports = router;