/**
 * requireAuth — validates a Supabase access token and resolves the local PG user.
 * On first login from a new Supabase account the user row is auto-provisioned so
 * the billing system works without a manual migration.
 */
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const db = require('../db');

// Lazy init — backend starts even if Supabase env vars are missing
let supabaseAdmin = null;
function getSupabaseAdmin() {
  if (!supabaseAdmin && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
    supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      { auth: { persistSession: false } }
    );
  }
  return supabaseAdmin;
}

const OWNER_EMAILS = new Set(
  (process.env.OWNER_EMAILS || process.env.OWNER_USERNAMES || '')
    .split(',')
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)
);

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'נדרשת התחברות' });
  }

  // Validate token via Supabase Admin API
  const admin = getSupabaseAdmin();
  if (!admin) {
    return res.status(503).json({ success: false, error: 'שירות האימות אינו מוגדר' });
  }
  const { data: { user: supaUser }, error } = await admin.auth.getUser(token);

  if (error || !supaUser) {
    return res.status(403).json({ success: false, error: 'טוקן לא חוקי או פג תוקף' });
  }

  const email = supaUser.email;

  // Find or auto-provision the local PG user record (needed for billing)
  let dbUser = await db.one('SELECT id, username FROM users WHERE email = $1', [email]);

  if (!dbUser) {
    const name = supaUser.user_metadata?.name || email.split('@')[0];
    const username = email; // use email as username for Supabase-managed users
    const passwordHash = await bcrypt.hash(supaUser.id, 10); // placeholder — auth is Supabase's job
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

    dbUser = await db.one(
      `INSERT INTO users
         (username, email, name, password_hash, subscription_status, trial_started_at, trial_ends_at)
       VALUES ($1, $2, $3, $4, 'trialing', NOW(), $5)
       ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
       RETURNING id, username`,
      [username, email, name, passwordHash, trialEndsAt]
    );
  }

  req.userId = dbUser.id;
  req.supabaseUser = supaUser;
  req.isOwner = OWNER_EMAILS.has(email.toLowerCase());
  next();
}

module.exports = { requireAuth };
