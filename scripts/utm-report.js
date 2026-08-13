require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  // UTM visits from Facebook last 7 days
  const utm = await pool.query(`
    SELECT 
      utm_campaign,
      COUNT(*) as visits,
      COUNT(DISTINCT ip_hash) as unique_visitors
    FROM page_views
    WHERE utm_source = 'facebook'
      AND created_at >= NOW() - INTERVAL '7 days'
    GROUP BY utm_campaign
    ORDER BY visits DESC
    LIMIT 30
  `);

  // Registrations via Facebook UTM
  const regs = await pool.query(`
    SELECT COUNT(*) as total_registrations
    FROM users
    WHERE created_at >= NOW() - INTERVAL '7 days'
  `);

  // Total page views from Facebook
  const total = await pool.query(`
    SELECT COUNT(*) as total_fb_visits, COUNT(DISTINCT ip_hash) as unique_fb_visitors
    FROM page_views
    WHERE utm_source = 'facebook'
      AND created_at >= NOW() - INTERVAL '7 days'
  `);

  // Page views by day
  const byDay = await pool.query(`
    SELECT 
      DATE(created_at) as day,
      COUNT(*) as visits
    FROM page_views
    WHERE utm_source = 'facebook'
      AND created_at >= NOW() - INTERVAL '7 days'
    GROUP BY DATE(created_at)
    ORDER BY day DESC
  `);

  console.log('\n=== FACEBOOK UTM ANALYTICS (last 7 days) ===\n');
  console.log('TOTAL:', JSON.stringify(total.rows[0]));
  console.log('\nBY DAY:');
  byDay.rows.forEach(r => console.log(` ${r.day}: ${r.visits} visits`));
  console.log('\nBY CAMPAIGN:');
  utm.rows.forEach(r => console.log(` ${r.utm_campaign}: ${r.visits} visits, ${r.unique_visitors} unique`));
  console.log('\nREGISTRATIONS (all sources, last 7d):', regs.rows[0].total_registrations);

  await pool.end();
}

run().catch(e => { console.error(e.message); pool.end(); });
