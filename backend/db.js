const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'crm.db');
const db = new Database(dbPath);

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

  // Seed default admin user if doesn't exist
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

  // Create demo employee accounts
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

  console.log('✅ Database initialized');
}

// Initialize on startup
initDatabase();

module.exports = db;
