const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'crm.db');
const db = new Database(dbPath);
const isProduction = process.env.NODE_ENV === 'production';
const allowDemoSeed = process.env.ALLOW_DEMO_SEED === 'true';

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration-safe billing columns for subscription lifecycle.
  const userColumns = db.prepare(`PRAGMA table_info(users)`).all();
  const userColumnNames = new Set(userColumns.map((col) => col.name));

  const billingUserColumns = [
    { name: 'plan', sql: "ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free_trial'" },
    { name: 'trial_started_at', sql: 'ALTER TABLE users ADD COLUMN trial_started_at DATETIME' },
    { name: 'trial_ends_at', sql: 'ALTER TABLE users ADD COLUMN trial_ends_at DATETIME' },
    { name: 'trial_extended_until', sql: 'ALTER TABLE users ADD COLUMN trial_extended_until DATETIME' },
    { name: 'trial_extension_days', sql: 'ALTER TABLE users ADD COLUMN trial_extension_days INTEGER NOT NULL DEFAULT 14' },
    { name: 'subscription_status', sql: "ALTER TABLE users ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'trialing'" },
    { name: 'billing_customer_id', sql: 'ALTER TABLE users ADD COLUMN billing_customer_id TEXT' },
    { name: 'billing_subscription_id', sql: 'ALTER TABLE users ADD COLUMN billing_subscription_id TEXT' },
    { name: 'billing_descriptor', sql: "ALTER TABLE users ADD COLUMN billing_descriptor TEXT NOT NULL DEFAULT 'RYNEX'" },
    { name: 'language_preference', sql: "ALTER TABLE users ADD COLUMN language_preference TEXT NOT NULL DEFAULT 'he'" },
    { name: 'canceled_at', sql: 'ALTER TABLE users ADD COLUMN canceled_at DATETIME' },
    { name: 'cancel_reason', sql: 'ALTER TABLE users ADD COLUMN cancel_reason TEXT' },
    { name: 'last_billing_error', sql: 'ALTER TABLE users ADD COLUMN last_billing_error TEXT' }
  ];

  billingUserColumns.forEach(({ name, sql }) => {
    if (!userColumnNames.has(name)) {
      db.exec(sql);
    }
  });

  db.exec(`
    CREATE TABLE IF NOT EXISTS billing_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      event_status TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS billing_webhook_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT NOT NULL UNIQUE,
      event_type TEXT NOT NULL,
      payload_hash TEXT,
      processing_status TEXT NOT NULL DEFAULT 'received',
      processing_error TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_subscription_status
    ON users(subscription_status)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_trial_ends_at
    ON users(trial_ends_at)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_billing_customer_id
    ON users(billing_customer_id)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_billing_subscription_id
    ON users(billing_subscription_id)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_billing_events_user_id
    ON billing_events(user_id)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_billing_events_created_at
    ON billing_events(created_at)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_billing_webhook_events_created_at
    ON billing_webhook_events(created_at)
  `);

  // Ensure existing users are initialized for trial lifecycle.
  db.prepare(`
    UPDATE users
    SET
      plan = COALESCE(plan, 'free_trial'),
      subscription_status = COALESCE(subscription_status, 'trialing'),
      trial_extension_days = COALESCE(trial_extension_days, 14),
      trial_started_at = COALESCE(trial_started_at, created_at),
      trial_ends_at = COALESCE(trial_ends_at, datetime(COALESCE(created_at, CURRENT_TIMESTAMP), '+30 days')),
      billing_descriptor = COALESCE(NULLIF(billing_descriptor, ''), 'RYNEX'),
      language_preference = COALESCE(NULLIF(language_preference, ''), 'he')
  `).run();

  // Password reset tokens table
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Sessions/Remember Me table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      device_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT NOT NULL,
      path TEXT,
      title TEXT,
      client_id TEXT,
      session_id TEXT,
      user_id INTEGER,
      referrer TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      utm_term TEXT,
      utm_content TEXT,
      ip_hash TEXT,
      user_agent TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at
    ON analytics_events(created_at)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name
    ON analytics_events(event_name)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id
    ON analytics_events(session_id)
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_analytics_events_client_id
    ON analytics_events(client_id)
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS crm_leads (
      id TEXT PRIMARY KEY,
      owner_id INTEGER NOT NULL,
      payload TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_crm_leads_owner_id
    ON crm_leads(owner_id)
  `);

  if (!isProduction || allowDemoSeed) {
    // Seed demo users only in non-production, or when explicitly enabled.
    const existingAdmin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');

    if (!existingAdmin) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      const stmt = db.prepare(`
        INSERT INTO users (username, email, password_hash, name)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run('admin', 'admin@myservices.local', hashedPassword, 'מנהל');
      console.log('✅ Default admin user created');
    }

    const employees = [
      { username: 'david_sales', email: 'david@myservices.local', password: 'David@123', name: 'דוד כהן - מנהל מכירות' },
      { username: 'sara_customer', email: 'sara@myservices.local', password: 'Sara@123', name: 'שרה לוי - שירות לקוח' },
      { username: 'yair_manager', email: 'yair@myservices.local', password: 'Yair@123', name: 'יאיר ברק - מנהל פרויקט' }
    ];

    employees.forEach(emp => {
      const existing = db.prepare('SELECT * FROM users WHERE username = ?').get(emp.username);
      if (!existing) {
        const hashedPassword = bcrypt.hashSync(emp.password, 10);
        const stmt = db.prepare(`
          INSERT INTO users (username, email, password_hash, name)
          VALUES (?, ?, ?, ?)
        `);
        stmt.run(emp.username, emp.email, hashedPassword, emp.name);
        console.log(`✅ Employee created: ${emp.name}`);
      }
    });
  } else {
    console.log('🔒 Production mode: demo user seeding is disabled');
  }

  console.log('✅ Database initialized')
}

// Initialize on startup
initDatabase();

// Add subscribers table after init (migration-safe)
db.exec(`
  CREATE TABLE IF NOT EXISTS email_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    source TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
