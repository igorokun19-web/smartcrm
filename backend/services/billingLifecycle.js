const db = require('../db');

const VALUE_GATE_MIN_LEADS = Number(process.env.VALUE_GATE_MIN_LEADS || 5);
const TRIAL_EXTENSION_DAYS = Number(process.env.TRIAL_EXTENSION_DAYS || 14);

async function recordBillingEvent(userId, eventType, eventStatus, details = null) {
  await db.query(
    `INSERT INTO billing_events (user_id, event_type, event_status, details)
     VALUES ($1, $2, $3, $4)`,
    [userId, eventType, eventStatus, details ? JSON.stringify(details) : null]
  );
}

async function getLeadCountForUser(userId) {
  const row = await db.one('SELECT COUNT(*)::int AS count FROM crm_leads WHERE owner_id = $1', [userId]);
  return row?.count || 0;
}

async function processUserTrial(user) {
  const now = Date.now();
  const trialEndsAt = user.trial_ends_at ? Date.parse(user.trial_ends_at) : NaN;
  const trialExtendedUntil = user.trial_extended_until ? Date.parse(user.trial_extended_until) : NaN;

  if (Number.isNaN(trialEndsAt)) {
    return { status: 'skipped', reason: 'missing_trial_end' };
  }

  if (trialEndsAt > now) {
    return { status: 'unchanged', reason: 'trial_active' };
  }

  const leadCount = await getLeadCountForUser(user.id);

  if (!user.trial_extended_until) {
    if (leadCount < VALUE_GATE_MIN_LEADS) {
      await db.query(
        `UPDATE users
         SET trial_extended_until = COALESCE(trial_ends_at, NOW()) + ($1::int || ' days')::interval,
             updated_at = NOW()
         WHERE id = $2`,
        [TRIAL_EXTENSION_DAYS, user.id]
      );

      await recordBillingEvent(user.id, 'trial_extended', 'success', {
        reason: 'value_gate_not_reached',
        leadCount,
        threshold: VALUE_GATE_MIN_LEADS,
        extensionDays: TRIAL_EXTENSION_DAYS,
      });

      return { status: 'extended', reason: 'value_gate_not_reached', leadCount };
    }

    await db.query(
      `UPDATE users
       SET subscription_status = 'past_due',
           updated_at = NOW()
       WHERE id = $1`,
      [user.id]
    );

    await recordBillingEvent(user.id, 'trial_expired', 'past_due', {
      reason: 'trial_finished',
      leadCount,
      threshold: VALUE_GATE_MIN_LEADS,
    });

    return { status: 'past_due', reason: 'trial_finished', leadCount };
  }

  if (!Number.isNaN(trialExtendedUntil) && trialExtendedUntil <= now) {
    await db.query(
      `UPDATE users
       SET subscription_status = 'past_due',
           updated_at = NOW()
       WHERE id = $1`,
      [user.id]
    );

    await recordBillingEvent(user.id, 'extension_expired', 'past_due', {
      reason: 'extension_finished',
      leadCount,
      threshold: VALUE_GATE_MIN_LEADS,
    });

    return { status: 'past_due', reason: 'extension_finished', leadCount };
  }

  return { status: 'unchanged', reason: 'extension_active', leadCount };
}

async function runBillingLifecycle(reason = 'scheduler') {
  const users = await db.many(
    `SELECT id, subscription_status, trial_ends_at, trial_extended_until
     FROM users
     WHERE subscription_status = 'trialing'`
  );

  let updated = 0;

  for (const user of users) {
    const result = await processUserTrial(user);
    if (result.status === 'extended' || result.status === 'past_due') {
      updated += 1;
    }
  }

  return { reason, scanned: users.length, updated };
}

module.exports = {
  runBillingLifecycle,
  getLeadCountForUser,
};
