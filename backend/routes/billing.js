const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Stripe = require('stripe');
const db = require('../db');
const { runBillingLifecycle, getLeadCountForUser } = require('../services/billingLifecycle');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const VALUE_GATE_MIN_LEADS = Number(process.env.VALUE_GATE_MIN_LEADS || 5);
const BILLING_DESCRIPTOR = process.env.BILLING_DESCRIPTOR || 'RYNEX';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const STRIPE_PRICE_BASIC = process.env.STRIPE_PRICE_BASIC;
const STRIPE_PRICE_PRO = process.env.STRIPE_PRICE_PRO;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5175';
const STRIPE_WEBHOOK_TOLERANCE_SECONDS = Number(process.env.STRIPE_WEBHOOK_TOLERANCE_SECONDS || 300);
const isProduction = process.env.NODE_ENV === 'production';
const OWNER_USERNAMES = new Set(
  (process.env.OWNER_USERNAMES || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
);

const PLAN_TO_PRICE = {
  basic: STRIPE_PRICE_BASIC,
  pro: STRIPE_PRICE_PRO,
};

const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

const usingLiveStripeKey = Boolean(STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.startsWith('sk_live_'));

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ success: false, error: 'נדרשת התחברות' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(403).json({ success: false, error: 'טוקן לא חוקי או פג תוקף' });
  }
}

async function formatSubscriptionStatus(user) {
  const effectiveEndAt = user.trial_extended_until || user.trial_ends_at;
  const now = Date.now();
  const endDate = effectiveEndAt ? Date.parse(effectiveEndAt) : NaN;
  const msLeft = Number.isNaN(endDate) ? 0 : Math.max(0, endDate - now);
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  const leadCount = await getLeadCountForUser(user.id);

  return {
    plan: user.plan,
    subscriptionStatus: user.subscription_status,
    trialStartedAt: user.trial_started_at,
    trialEndsAt: user.trial_ends_at,
    trialExtendedUntil: user.trial_extended_until,
    effectiveEndAt,
    daysLeft,
    billingDescriptor: user.billing_descriptor,
    languagePreference: user.language_preference,
    cancelReason: user.cancel_reason,
    canceledAt: user.canceled_at,
    usage: {
      leadCount,
      valueGateMinLeads: VALUE_GATE_MIN_LEADS,
      valueGateReached: leadCount >= VALUE_GATE_MIN_LEADS,
    },
  };
}

function normalizePlan(plan) {
  if (plan === 'basic' || plan === 'pro' || plan === 'free_trial') {
    return plan;
  }
  return 'free_trial';
}

function getSafeFrontendUrl() {
  try {
    const parsed = new URL(FRONTEND_URL);
    if (isProduction && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

function sanitizeIdempotencyKey(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 128) {
    return null;
  }

  return /^[A-Za-z0-9_\-.:]+$/.test(trimmed) ? trimmed : null;
}

function safeDetailsFromError(error) {
  return {
    message: error?.message || 'Unknown error',
    type: error?.type || null,
    code: error?.code || null,
  };
}

async function findUserForStripeRefs(customerId, subscriptionId, metadataUserId, txApi = db) {
  const parsedUserId = Number(metadataUserId);
  if (Number.isInteger(parsedUserId) && parsedUserId > 0) {
    const userById = await txApi.one(
      `SELECT id, plan
       FROM users
       WHERE id = $1`,
      [parsedUserId]
    );

    if (userById) {
      return userById;
    }
  }

  if (subscriptionId) {
    const userBySubscription = await txApi.one(
      `SELECT id, plan
       FROM users
       WHERE billing_subscription_id = $1`,
      [String(subscriptionId)]
    );

    if (userBySubscription) {
      return userBySubscription;
    }
  }

  if (customerId) {
    const userByCustomer = await txApi.one(
      `SELECT id, plan
       FROM users
       WHERE billing_customer_id = $1`,
      [String(customerId)]
    );

    if (userByCustomer) {
      return userByCustomer;
    }
  }

  return null;
}

async function updateWebhookStatus(eventId, status, errorMessage = null) {
  await db.query(
    `UPDATE billing_webhook_events
     SET processing_status = $1,
         processing_error = $2,
         processed_at = NOW()
     WHERE event_id = $3`,
    [status, errorMessage, eventId]
  );
}

router.get('/status', requireAuth, async (req, res) => {
  try {
    await runBillingLifecycle('status_check');

    const user = await db.one(
      `SELECT id, username, plan, subscription_status, trial_started_at, trial_ends_at,
              trial_extended_until, billing_descriptor, language_preference,
              canceled_at, cancel_reason
       FROM users
       WHERE id = $1`,
      [req.userId]
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'משתמש לא נמצא' });
    }

    if (OWNER_USERNAMES.has(String(user.username || '').toLowerCase()) && user.subscription_status !== 'active') {
      await db.query(
        `UPDATE users
         SET subscription_status = 'active',
             trial_ends_at = NULL,
             trial_extended_until = NULL,
             updated_at = NOW()
         WHERE id = $1`,
        [req.userId]
      );

      user.subscription_status = 'active';
      user.trial_ends_at = null;
      user.trial_extended_until = null;
    }

    res.json({
      success: true,
      subscription: await formatSubscriptionStatus(user),
    });
  } catch (error) {
    console.error('Billing status error:', error.message);
    res.status(500).json({ success: false, error: 'שגיאה בשליפת סטטוס חיוב' });
  }
});

router.post('/extend-trial', requireAuth, async (req, res) => {
  try {
    const user = await db.one(
      `SELECT id, subscription_status, trial_ends_at, trial_extended_until
       FROM users
       WHERE id = $1`,
      [req.userId]
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'משתמש לא נמצא' });
    }

    if (user.subscription_status !== 'trialing') {
      return res.status(400).json({ success: false, error: 'המשתמש אינו בסטטוס ניסיון' });
    }

    if (user.trial_extended_until) {
      return res.status(400).json({ success: false, error: 'הארכת ניסיון כבר ניתנה' });
    }

    const leadCount = await getLeadCountForUser(user.id);
    if (leadCount >= VALUE_GATE_MIN_LEADS) {
      return res.status(400).json({ success: false, error: 'לא ניתן להאריך ניסיון לאחר השגת ערך שימוש מינימלי' });
    }

    await db.query(
      `UPDATE users
       SET trial_extended_until = COALESCE(trial_ends_at, NOW()) + INTERVAL '14 days',
           updated_at = NOW()
       WHERE id = $1`,
      [req.userId]
    );

    await db.query(
      `INSERT INTO billing_events (user_id, event_type, event_status, details)
       VALUES ($1, 'trial_extended_manual', 'success', $2)`,
      [req.userId, JSON.stringify({ leadCount, threshold: VALUE_GATE_MIN_LEADS })]
    );

    const updatedUser = await db.one(
      `SELECT id, plan, subscription_status, trial_started_at, trial_ends_at,
              trial_extended_until, billing_descriptor, language_preference,
              canceled_at, cancel_reason
       FROM users
       WHERE id = $1`,
      [req.userId]
    );

    res.json({ success: true, subscription: await formatSubscriptionStatus(updatedUser) });
  } catch (error) {
    console.error('Extend trial error:', error.message);
    res.status(500).json({ success: false, error: 'שגיאה בהארכת ניסיון' });
  }
});

router.post('/cancel', requireAuth, async (req, res) => {
  try {
    const cancelReason = typeof req.body?.reason === 'string' ? req.body.reason.trim().slice(0, 300) : null;

    const result = await db.exec(
      `UPDATE users
       SET subscription_status = 'canceled',
           canceled_at = NOW(),
           cancel_reason = $1,
           updated_at = NOW()
       WHERE id = $2`,
      [cancelReason, req.userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'משתמש לא נמצא' });
    }

    await db.query(
      `INSERT INTO billing_events (user_id, event_type, event_status, details)
       VALUES ($1, 'subscription_canceled', 'success', $2)`,
      [req.userId, JSON.stringify({ immediate: true, reason: cancelReason })]
    );

    res.json({ success: true, message: 'המנוי בוטל מיידית' });
  } catch (error) {
    console.error('Cancel subscription error:', error.message);
    res.status(500).json({ success: false, error: 'שגיאה בביטול המנוי' });
  }
});

router.post('/start-checkout', requireAuth, async (req, res) => {
  const selectedPlan = typeof req.body?.plan === 'string' ? req.body.plan.trim().toLowerCase() : null;
  const idempotencyKey = sanitizeIdempotencyKey(req.headers['idempotency-key']);

  if (!selectedPlan || !['basic', 'pro'].includes(selectedPlan)) {
    return res.status(400).json({ success: false, error: 'תוכנית לא חוקית' });
  }

  const safeFrontendUrl = getSafeFrontendUrl();
  if (!safeFrontendUrl) {
    return res.status(503).json({
      success: false,
      error: 'הגדרת כתובת אפליקציה אינה תקינה',
      code: 'FRONTEND_URL_INVALID',
    });
  }

  if (!stripe || !STRIPE_SECRET_KEY) {
    await db.query(
      `INSERT INTO billing_events (user_id, event_type, event_status, details)
       VALUES ($1, 'checkout_started', 'blocked_missing_config', $2)`,
      [req.userId, JSON.stringify({ plan: selectedPlan, reason: 'missing_stripe_key' })]
    );

    return res.status(503).json({
      success: false,
      error: 'ספק הסליקה עדיין לא הוגדר בסביבה',
      code: 'BILLING_PROVIDER_NOT_CONFIGURED',
    });
  }

  const priceId = PLAN_TO_PRICE[selectedPlan];
  if (!priceId) {
    await db.query(
      `INSERT INTO billing_events (user_id, event_type, event_status, details)
       VALUES ($1, 'checkout_started', 'blocked_missing_price', $2)`,
      [req.userId, JSON.stringify({ plan: selectedPlan })]
    );

    return res.status(503).json({
      success: false,
      error: 'מחיר התוכנית עדיין לא הוגדר',
      code: 'BILLING_PRICE_NOT_CONFIGURED',
    });
  }

  try {
    const user = await db.one(
      `SELECT id, email, name, billing_customer_id, subscription_status, plan, billing_subscription_id
       FROM users
       WHERE id = $1`,
      [req.userId]
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'משתמש לא נמצא' });
    }

    if (user.subscription_status === 'active') {
      return res.status(409).json({
        success: false,
        error: 'יש מנוי פעיל. ניהול שינויים יתאפשר מפורטל מנויים ייעודי.',
        code: 'SUBSCRIPTION_ALREADY_ACTIVE',
      });
    }

    let customerId = user.billing_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: String(user.id),
          billingDescriptor: BILLING_DESCRIPTOR,
        },
      });

      customerId = customer.id;
      await db.query(
        `UPDATE users
         SET billing_customer_id = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [customerId, user.id]
      );
    }

    const sessionPayload = {
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${safeFrontendUrl}/settings?billing=success`,
      cancel_url: `${safeFrontendUrl}/settings?billing=cancel`,
      client_reference_id: String(user.id),
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_update: { address: 'auto', name: 'auto' },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
      metadata: {
        userId: String(user.id),
        plan: selectedPlan,
        descriptor: BILLING_DESCRIPTOR,
      },
      subscription_data: {
        metadata: {
          userId: String(user.id),
          plan: selectedPlan,
        },
      },
    };

    const session = idempotencyKey
      ? await stripe.checkout.sessions.create(sessionPayload, { idempotencyKey })
      : await stripe.checkout.sessions.create(sessionPayload);

    await db.query(
      `INSERT INTO billing_events (user_id, event_type, event_status, details)
       VALUES ($1, 'checkout_started', 'success', $2)`,
      [req.userId, JSON.stringify({ plan: selectedPlan, checkoutSessionId: session.id })]
    );

    return res.json({ success: true, checkoutUrl: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error.message);

    await db.query(
      `INSERT INTO billing_events (user_id, event_type, event_status, details)
       VALUES ($1, 'checkout_started', 'failed', $2)`,
      [req.userId, JSON.stringify({ plan: selectedPlan, ...safeDetailsFromError(error) })]
    );

    return res.status(500).json({
      success: false,
      error: 'שגיאה ביצירת עמוד התשלום',
      code: 'CHECKOUT_CREATE_FAILED',
    });
  }
});

router.post('/webhook', async (req, res) => {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ success: false, error: 'Webhook secret is not configured' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature) {
    return res.status(400).json({ success: false, error: 'Missing Stripe signature' });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      STRIPE_WEBHOOK_SECRET,
      STRIPE_WEBHOOK_TOLERANCE_SECONDS
    );
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error.message);
    return res.status(400).json({ success: false, error: 'Invalid Stripe signature' });
  }

  if (Boolean(event.livemode) !== usingLiveStripeKey) {
    console.error('Stripe webhook livemode mismatch:', { eventId: event.id, livemode: event.livemode });
    return res.status(400).json({ success: false, error: 'Stripe mode mismatch' });
  }

  const payloadHash = crypto.createHash('sha256').update(req.body).digest('hex');
  const existingEvent = await db.one(
    `SELECT id
     FROM billing_webhook_events
     WHERE event_id = $1`,
    [event.id]
  );

  if (existingEvent) {
    return res.json({ received: true, duplicate: true });
  }

  try {
    await db.query(
      `INSERT INTO billing_webhook_events (event_id, event_type, payload_hash, processing_status)
       VALUES ($1, $2, $3, 'received')`,
      [event.id, event.type, payloadHash]
    );
  } catch (error) {
    if (error && String(error.message).includes('duplicate key')) {
      return res.json({ received: true, duplicate: true });
    }
    throw error;
  }

  try {
    const result = await db.tx(async (tx) => {
      const object = event.data?.object || {};

      if (event.type === 'checkout.session.completed') {
        const userId = object.metadata?.userId || object.client_reference_id;
        const user = await findUserForStripeRefs(object.customer, object.subscription, userId, tx);
        if (!user) {
          return { status: 'ignored', reason: 'user_not_found' };
        }

        const plan = normalizePlan(object.metadata?.plan || 'basic');
        await tx.query(
          `UPDATE users
           SET plan = $1,
               subscription_status = 'active',
               billing_customer_id = $2,
               billing_subscription_id = $3,
               canceled_at = NULL,
               cancel_reason = NULL,
               last_billing_error = NULL,
               updated_at = NOW()
           WHERE id = $4`,
          [plan, String(object.customer || ''), String(object.subscription || ''), user.id]
        );

        await tx.query(
          `INSERT INTO billing_events (user_id, event_type, event_status, details)
           VALUES ($1, 'checkout_completed', 'success', $2)`,
          [user.id, JSON.stringify({ stripeEventId: event.id, plan })]
        );

        return { status: 'processed' };
      }

      if (event.type === 'invoice.payment_succeeded') {
        const user = await findUserForStripeRefs(object.customer, object.subscription, object.metadata?.userId, tx);
        if (!user) {
          return { status: 'ignored', reason: 'user_not_found' };
        }

        await tx.query(
          `UPDATE users
           SET subscription_status = 'active',
               last_billing_error = NULL,
               updated_at = NOW()
           WHERE id = $1`,
          [user.id]
        );

        await tx.query(
          `INSERT INTO billing_events (user_id, event_type, event_status, details)
           VALUES ($1, 'payment_succeeded', 'success', $2)`,
          [user.id, JSON.stringify({ stripeEventId: event.id, invoiceId: object.id })]
        );

        return { status: 'processed' };
      }

      if (event.type === 'invoice.payment_failed') {
        const user = await findUserForStripeRefs(object.customer, object.subscription, object.metadata?.userId, tx);
        if (!user) {
          return { status: 'ignored', reason: 'user_not_found' };
        }

        await tx.query(
          `UPDATE users
           SET subscription_status = 'past_due',
               last_billing_error = $1,
               updated_at = NOW()
           WHERE id = $2`,
          ['invoice_payment_failed', user.id]
        );

        await tx.query(
          `INSERT INTO billing_events (user_id, event_type, event_status, details)
           VALUES ($1, 'payment_failed', 'past_due', $2)`,
          [user.id, JSON.stringify({ stripeEventId: event.id, invoiceId: object.id })]
        );

        return { status: 'processed' };
      }

      if (event.type === 'customer.subscription.deleted') {
        const user = await findUserForStripeRefs(object.customer, object.id, object.metadata?.userId, tx);
        if (!user) {
          return { status: 'ignored', reason: 'user_not_found' };
        }

        await tx.query(
          `UPDATE users
           SET subscription_status = 'canceled',
               canceled_at = NOW(),
               cancel_reason = 'stripe_subscription_deleted',
               updated_at = NOW()
           WHERE id = $1`,
          [user.id]
        );

        await tx.query(
          `INSERT INTO billing_events (user_id, event_type, event_status, details)
           VALUES ($1, 'subscription_deleted', 'canceled', $2)`,
          [user.id, JSON.stringify({ stripeEventId: event.id, subscriptionId: object.id })]
        );

        return { status: 'processed' };
      }

      return { status: 'ignored', reason: 'unsupported_event_type' };
    });

    await updateWebhookStatus(event.id, result.status, result.reason || null);
    return res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook processing error:', error.message);
    await updateWebhookStatus(event.id, 'failed', error.message.slice(0, 500));
    return res.status(500).json({ success: false, error: 'Webhook processing failed' });
  }
});

module.exports = router;
