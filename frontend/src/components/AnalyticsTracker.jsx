import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { setAnalyticsUser, shouldTrackPage, trackPageView } from '../lib/analytics';

export default function AnalyticsTracker() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    setAnalyticsUser(user?.id ?? null);
  }, [user?.id]);

  useEffect(() => {
    const path = `${location.pathname}${location.search}`;

    if (!shouldTrackPage(path)) {
      return;
    }

    trackPageView({
      route: location.pathname,
      isAuthenticated,
    });
  }, [isAuthenticated, location.pathname, location.search]);

  return null;
}