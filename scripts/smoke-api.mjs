const baseUrl = (process.env.SMARTCRM_BASE_URL || 'https://smartcrm-3cle.onrender.com').replace(/\/$/, '');
const testEmail = process.env.SMOKE_TEST_EMAIL || 'igorokun19@gmail.com';
const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 20000);

function withTimeout(promise, ms, label) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  return promise(controller.signal)
    .finally(() => clearTimeout(timer))
    .catch((error) => {
      if (error?.name === 'AbortError') {
        throw new Error(`${label} timed out after ${ms}ms`);
      }
      throw error;
    });
}

async function jsonRequest(path, options = {}) {
  const url = `${baseUrl}${path}`;
  return withTimeout(async (signal) => {
    const response = await fetch(url, {
      ...options,
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const text = await response.text();
    let body;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }

    return { response, body };
  }, timeoutMs, `Request ${path}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  const checks = [];

  checks.push(async () => {
    const { response, body } = await jsonRequest('/api/health', { method: 'GET' });
    assert(response.status === 200, `GET /api/health expected 200, got ${response.status}`);
    assert(body?.status === 'ok', `GET /api/health expected status=ok, got ${JSON.stringify(body)}`);
    return 'GET /api/health';
  });

  checks.push(async () => {
    const { response, body } = await jsonRequest('/api/unknown-route', { method: 'GET' });
    assert(response.status === 404, `GET /api/unknown-route expected 404, got ${response.status}`);
    assert(body?.success === false, `GET /api/unknown-route expected success=false, got ${JSON.stringify(body)}`);
    return 'GET /api/unknown-route';
  });

  checks.push(async () => {
    const { response, body } = await jsonRequest('/api/analytics/events', {
      method: 'POST',
      body: JSON.stringify({
        eventName: 'smoke_test_event',
        path: '/smoke',
        title: 'Smoke Test',
        clientId: `smoke-${Date.now()}`,
        sessionId: `session-${Date.now()}`,
        metadata: { source: 'smoke-api.mjs' },
      }),
    });

    assert(response.status === 202, `POST /api/analytics/events expected 202, got ${response.status}`);
    assert(body?.success === true, `POST /api/analytics/events expected success=true, got ${JSON.stringify(body)}`);
    return 'POST /api/analytics/events';
  });

  checks.push(async () => {
    const { response, body } = await jsonRequest('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email: testEmail }),
    });

    assert(response.status === 200, `POST /api/auth/forgot-password expected 200, got ${response.status}`);
    assert(body?.success === true, `POST /api/auth/forgot-password expected success=true, got ${JSON.stringify(body)}`);
    return 'POST /api/auth/forgot-password';
  });

  const failures = [];
  for (const check of checks) {
    try {
      const label = await check();
      console.log(`PASS ${label}`);
    } catch (error) {
      failures.push(error.message);
      console.error(`FAIL ${error.message}`);
    }
  }

  if (failures.length > 0) {
    console.error(`\nSmoke test completed with ${failures.length} failure(s).`);
    process.exit(1);
  }

  console.log('\nSmoke test completed successfully.');
}

run().catch((error) => {
  console.error('Smoke test runner error:', error.message);
  process.exit(1);
});
