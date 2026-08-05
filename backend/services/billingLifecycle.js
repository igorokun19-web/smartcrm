const db = require('../db');

const VALUE_GATE_MIN_LEADS = Number(process.env.VALUE_GATE_MIN_LEADS || 5);
const TRIAL_EXTENSION_DAYS = Number(process.env.TRIAL_EXTENSION_DAYS || 14);

function recordBillingEvent(userId, eventType, eventStatus, details = null) {
  db.prepare(`
    INSERT INTO billing_events (user_id, event_type, event_status, details)
    VALUES (?, ?, ?, ?)
  `).run(userId, eventType, eventStatus, details ? JSON.stringify(details) : null);
}

function getLeadCountForUser(userId) {
  const row = db.prepare('SELECT COUNT(*) AS count FROM crm_leads WHERE owner_id = ?').get(userId);
  return row?.count || 0;
}

function processUserTrial(user) {
  const now = Date.now();
  const trialEndsAt = user.trial_ends_at ? Date.parse(user.trial_ends_at) : NaN;
  const trialExtendedUntil = user.trial_extended_until ? Date.parse(user.trial_extended_until) : NaN;

  if (Number.isNaN(trialEndsAt)) {
    return { status: 'skipped', reason: 'missing_trial_end' };
  }

  // Nothing to do while trial still active and not on extension period.
  if (trialEndsAt > now) {
    return { status: 'unchanged', reason: 'trial_active' };
  }

  const leadCount = getLeadCountForUser(user.id);

  // First expiration: grant one extension if value gate was not reached.
  if (!user.trial_extended_until) {
    if (leadCount < VALUE_GATE_MIN_LEADS) {
      const extendFrom = user.trial_ends_at;
      db.prepare(`
        UPDATE users
        SET trial_extended_until = datetime(?, '+' || ? || ' days'),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(extendFrom, TRIAL_EXTENSION_DAYS, user.id);

      recordBillingEvent(user.id, 'trial_extended', 'success', {
        reason: 'value_gate_not_reached',
        leadCount,
        threshold: VALUE_GATE_MIN_LEADS,
        extensionDays: TRIAL_EXTENSION_DAYS
      });

      return { status: 'extended', reason: 'value_gate_not_reached', leadCount };
    }

    db.prepare(`
      UPDATE users
      SET subscription_status = 'past_due',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(user.id);

    recordBillingEvent(user.id, 'trial_expired', 'past_due', {
      reason: 'trial_finished',
      leadCount,
      threshold: VALUE_GATE_MIN_LEADS
    });

    return { status: 'past_due', reason: 'trial_finished', leadCount };
  }

  if (!Number.isNaN(trialExtendedUntil) && trialExtendedUntil <= now) {
    db.prepare(`
      UPDATE users
      SET subscription_status = 'past_due',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(user.id);

    recordBillingEvent(user.id, 'extension_expired', 'past_due', {
      reason: 'extension_finished',
      leadCount,
      threshold: VALUE_GATE_MIN_LEADS
    });

    return { status: 'past_due', reason: 'extension_finished', leadCount };
  }

  return { status: 'unchanged', reason: 'extension_active', leadCount };
}

function runBillingLifecycle(reason = 'scheduler') {
  const users = db.prepare(`
    SELECT id, subscription_status, trial_ends_at, trial_extended_until
    FROM users
    WHERE subscription_status = 'trialing'
  `).all();

  let updated = 0;

  for (const user of users) {
    const result = processUserTrial(user);
    if (result.status === 'extended' || result.status === 'past_due') {
      updated += 1;
    }
  }

  return {
    reason,
    scanned: users.length,
    updated
  };
}

module.exports = {
  runBillingLifecycle,
  getLeadCountForUser
};
