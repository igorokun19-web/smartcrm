const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001' : window.location.origin);

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
const ENABLE_INTERNAL_ANALYTICS = import.meta.env.VITE_ENABLE_INTERNAL_ANALYTICS === 'true';
const CLIENT_ID_KEY = 'analyticsClientId';
const SESSION_ID_KEY = 'analyticsSessionId';
const LAST_PAGE_KEY = 'analyticsLastPage';
const LAST_PAGE_AT_KEY = 'analyticsLastPageAt';

let gaInitialized = false;

function createId(prefix) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}${crypto.randomUUID()}`;
  }

  return `${prefix}${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function getStorageValue(storage, key, prefix) {
  if (typeof window === 'undefined') {
    return null;
  }

  const existing = storage.getItem(key);
  if (existing) {
    return existing;
  }

  const nextValue = createId(prefix);
  storage.setItem(key, nextValue);
  return nextValue;
}

function getClientId() {
  return getStorageValue(window.localStorage, CLIENT_ID_KEY, 'client_');
}

function getSessionId() {
  return getStorageValue(window.sessionStorage, SESSION_ID_KEY, 'session_');
}

function getAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem('authToken');
}

function getCurrentPath() {
  if (typeof window === 'undefined') {
    return null;
  }

  return `${window.location.pathname}${window.location.search}`;
}

function getCampaignParams() {
  if (typeof window === 'undefined') {
    return {};
  }

  const params = new URLSearchParams(window.location.search);

  return {
    utmSource: params.get('utm_source'),
    utmMedium: params.get('utm_medium'),
    utmCampaign: params.get('utm_campaign'),
    utmTerm: params.get('utm_term'),
    utmContent: params.get('utm_content'),
  };
}

function ensureGa() {
  if (!GA_MEASUREMENT_ID || gaInitialized || typeof window === 'undefined') {
    return;
  }

  gaInitialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });
}

export function setAnalyticsUser(userId) {
  ensureGa();

  if (GA_MEASUREMENT_ID && typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', GA_MEASUREMENT_ID, {
      user_id: userId || undefined,
      send_page_view: false,
      anonymize_ip: true,
    });
  }
}

export function trackEvent(eventName, metadata = {}, options = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  ensureGa();

  const payload = {
    eventName,
    path: options.path || getCurrentPath(),
    title: options.title || document.title,
    clientId: getClientId(),
    sessionId: getSessionId(),
    referrer: document.referrer || null,
    ...getCampaignParams(),
    metadata,
  };

  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (ENABLE_INTERNAL_ANALYTICS) {
    fetch(`${API_URL}/api/analytics/events`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch((error) => {
      console.error('Analytics event failed:', error);
    });
  }

  if (GA_MEASUREMENT_ID && typeof window.gtag === 'function') {
    window.gtag('event', eventName, {
      page_path: payload.path,
      page_title: payload.title,
      session_id: payload.sessionId,
      ...metadata,
    });
  }
}

export function trackPageView(metadata = {}) {
  trackEvent('page_view', metadata);
}

export function shouldTrackPage(path) {
  if (typeof window === 'undefined') {
    return false;
  }

  const now = Date.now();
  const previousPath = window.sessionStorage.getItem(LAST_PAGE_KEY);
  const previousAt = Number.parseInt(window.sessionStorage.getItem(LAST_PAGE_AT_KEY) || '0', 10);

  if (previousPath === path && now - previousAt < 1500) {
    return false;
  }

  window.sessionStorage.setItem(LAST_PAGE_KEY, path);
  window.sessionStorage.setItem(LAST_PAGE_AT_KEY, String(now));
  return true;
}