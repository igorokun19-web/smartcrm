const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const isProduction = process.env.NODE_ENV === 'production';
const allowDemoSeed = process.env.ALLOW_DEMO_SEED === 'true';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

async function query(text, params = []) {
  return pool.query(text, params);
}

async function one(text, params = []) {
  const { rows } = await query(text, params);
  return rows[0] || null;
}

async function many(text, params = []) {
  const { rows } = await query(text, params);
  return rows;
}

async function exec(text, params = []) {
  const result = await query(text, params);
  return { changes: result.rowCount || 0 };
}

async function tx(work) {
  const client = await pool.connect();
  const txApi = {
    query: (text, params = []) => client.query(text, params),
    one: async (text, params = []) => {
      const { rows } = await client.query(text, params);
      return rows[0] || null;
    },
    many: async (text, params = []) => {
      const { rows } = await client.query(text, params);
      return rows;
    },
    exec: async (text, params = []) => {
      const result = await client.query(text, params);
      return { changes: result.rowCount || 0 };
    },
  };

  try {
    await client.query('BEGIN');
    const value = await work(txApi);
    await client.query('COMMIT');
    return value;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function initDatabase() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      plan TEXT NOT NULL DEFAULT 'free_trial',
      trial_started_at TIMESTAMPTZ,
      trial_ends_at TIMESTAMPTZ,
      trial_extended_until TIMESTAMPTZ,
      trial_extension_days INTEGER NOT NULL DEFAULT 14,
      subscription_status TEXT NOT NULL DEFAULT 'trialing',
      billing_customer_id TEXT,
      billing_subscription_id TEXT,
      billing_descriptor TEXT NOT NULL DEFAULT 'RYNEX',
      language_preference TEXT NOT NULL DEFAULT 'he',
      canceled_at TIMESTAMPTZ,
      cancel_reason TEXT,
      last_billing_error TEXT
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS billing_events (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      event_status TEXT NOT NULL,
      details TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS billing_webhook_events (
      id SERIAL PRIMARY KEY,
      event_id TEXT NOT NULL UNIQUE,
      event_type TEXT NOT NULL,
      payload_hash TEXT,
      processing_status TEXT NOT NULL DEFAULT 'received',
      processing_error TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      processed_at TIMESTAMPTZ
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      device_name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id SERIAL PRIMARY KEY,
      event_name TEXT NOT NULL,
      path TEXT,
      title TEXT,
      client_id TEXT,
      session_id TEXT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      referrer TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_term TEXT,
      utm_content TEXT,
      ip_hash TEXT,
      user_agent TEXT,
      metadata TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS crm_leads (
      id TEXT PRIMARY KEY,
      owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      payload TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS email_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      source TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_users_subscription_status
    ON users(subscription_status)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_users_trial_ends_at
    ON users(trial_ends_at)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_users_billing_customer_id
    ON users(billing_customer_id)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_users_billing_subscription_id
    ON users(billing_subscription_id)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_billing_events_user_id
    ON billing_events(user_id)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_billing_events_created_at
    ON billing_events(created_at)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_billing_webhook_events_created_at
    ON billing_webhook_events(created_at)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at
    ON analytics_events(created_at)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name
    ON analytics_events(event_name)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id
    ON analytics_events(session_id)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_analytics_events_client_id
    ON analytics_events(client_id)
  `);
  await query(`
    CREATE INDEX IF NOT EXISTS idx_crm_leads_owner_id
    ON crm_leads(owner_id)
  `);

  await query(`
    UPDATE users
    SET
      plan = COALESCE(plan, 'free_trial'),
      subscription_status = COALESCE(subscription_status, 'trialing'),
      trial_extension_days = COALESCE(trial_extension_days, 14),
      trial_started_at = COALESCE(trial_started_at, created_at),
      trial_ends_at = COALESCE(trial_ends_at, created_at + INTERVAL '30 days'),
      billing_descriptor = COALESCE(NULLIF(billing_descriptor, ''), 'RYNEX'),
      language_preference = COALESCE(NULLIF(language_preference, ''), 'he')
  `);

  if (!isProduction || allowDemoSeed) {
    const existingAdmin = await one('SELECT id FROM users WHERE username = $1', ['admin']);

    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync('admin123', 12);
      await query(
        `INSERT INTO users (username, email, password_hash, name)
         VALUES ($1, $2, $3, $4)`,
        ['admin', 'admin@myservices.local', hashedPassword, 'מנהל']
      );
      console.log('✅ Default admin user created');
    }

    const employees = [
      { username: 'david_sales', email: 'david@myservices.local', password: 'David@123', name: 'דוד כהן - מנהל מכירות' },
      { username: 'sara_customer', email: 'sara@myservices.local', password: 'Sara@123', name: 'שרה לוי - שירות לקוח' },
      { username: 'yair_manager', email: 'yair@myservices.local', password: 'Yair@123', name: 'יאיר ברק - מנהל פרויקט' },
    ];

    for (const emp of employees) {
      const existing = await one('SELECT id FROM users WHERE username = $1', [emp.username]);
      if (!existing) {
        const hashedPassword = bcrypt.hashSync(emp.password, 12);
        await query(
          `INSERT INTO users (username, email, password_hash, name)
           VALUES ($1, $2, $3, $4)`,
          [emp.username, emp.email, hashedPassword, emp.name]
        );
        console.log(`✅ Employee created: ${emp.name}`);
      }
    }
  } else {
    console.log('🔒 Production mode: demo user seeding is disabled');
  }

  console.log('✅ Database initialized');
}

const ready = initDatabase();

module.exports = {
  pool,
  query,
  one,
  many,
  exec,
  tx,
  ready,
};
