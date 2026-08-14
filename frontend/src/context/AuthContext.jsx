/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { setAnalyticsUser, trackEvent } from "../lib/analytics";

const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3001" : "https://smartcrm-3cle.onrender.com");

// Normalise Supabase user to the shape the rest of the app expects
function normalizeUser(supaUser) {
  if (!supaUser) return null;
  return {
    id:       supaUser.id,
    email:    supaUser.email,
    name:     supaUser.user_metadata?.name || supaUser.email?.split("@")[0] || "",
    username: supaUser.user_metadata?.username || supaUser.email?.split("@")[0] || "",
  };
}

async function getAccessToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || null;
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [billing, setBilling]   = useState(null);
  const [billingLoading, setBillingLoading] = useState(false);
  // true until the first getSession() resolves — prevents ProtectedRoute flash-redirect
  const [initializing, setInitializing] = useState(true);

  // ============================================================
  // SESSION LISTENER â€” Supabase manages persistence automatically
  // ============================================================
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = normalizeUser(session.user);
        setUser(u);
        setIsAuthenticated(true);
        setAnalyticsUser(u.id);
      }
      setInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = normalizeUser(session.user);
        setUser(u);
        setIsAuthenticated(true);
        setAnalyticsUser(u.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setAnalyticsUser(null);
        setBilling(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshBillingStatus = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setBilling(null);
      return null;
    }

    setBillingLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/billing/status`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setBilling(null);
          return null;
        }

        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "×©×’×™××” ×‘×©×œ×™×¤×ª ×¡×˜×˜×•×¡ ×ž× ×•×™");
      }

      const data = await response.json();
      setBilling(data.subscription || null);
      return data.subscription || null;
    } catch (err) {
      console.error("Billing status error:", err.message);
      return null;
    } finally {
      setBillingLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const timeoutId = setTimeout(() => {
      refreshBillingStatus();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, refreshBillingStatus]);

  const extendTrial = async () => {
    const token = await getAccessToken();
    if (!token) return { success: false, error: "×œ× ×ž×—×•×‘×¨" };
    setBillingLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/billing/extend-trial`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: "{}" });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      setBilling(data.subscription || null);
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
    finally { setBillingLoading(false); }
  };

  const cancelSubscription = async (reason = "") => {
    const token = await getAccessToken();
    if (!token) return { success: false, error: "×œ× ×ž×—×•×‘×¨" };
    setBillingLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/billing/cancel`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ reason }) });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      await refreshBillingStatus();
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
    finally { setBillingLoading(false); }
  };

  const startCheckout = async (plan) => {
    const token = await getAccessToken();
    if (!token) return { success: false, error: "×œ× ×ž×—×•×‘×¨" };
    setBillingLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/billing/start-checkout`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ plan }) });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      return { success: true, checkoutUrl: data.checkoutUrl, sessionId: data.sessionId };
    } catch (e) { return { success: false, error: e.message }; }
    finally { setBillingLoading(false); }
  };

  // ============================================================
  // AUTH METHODS â€” all via Supabase
  // ============================================================
  const login = async (email, password) => {
    setLoading(true); setError(null);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) throw new Error(err.message);
      trackEvent("login_success", { userId: email }, { path: "/login" });
      return { success: true };
    } catch (e) {
      setError(e.message);
      trackEvent("login_failed", { reason: e.message }, { path: "/login" });
      return { success: false, error: e.message };
    } finally { setLoading(false); }
  };

  const logout = async () => {
    trackEvent("logout", { userId: user?.id });
    await supabase.auth.signOut();
  };

  const register = async (_username, email, password, _confirmPassword, name) => {
    setLoading(true); setError(null);
    try {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (err) throw new Error(err.message);
      trackEvent("register_success", { userId: email }, { path: "/register" });
      return true;
    } catch (e) {
      setError(e.message);
      trackEvent("register_failed", { reason: e.message }, { path: "/register" });
      return false;
    } finally { setLoading(false); }
  };

  const forgotPassword = async (email) => {
    setLoading(true); setError(null);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) throw new Error(err.message);
      trackEvent("forgot_password_requested", { email });
      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    } finally { setLoading(false); }
  };

  const resetPassword = async (_token, newPassword) => {
    setLoading(true); setError(null);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: newPassword });
      if (err) throw new Error(err.message);
      trackEvent("reset_password_success", {});
      return { success: true };
    } catch (e) {
      setError(e.message);
      return { success: false, error: e.message };
    } finally { setLoading(false); }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated, user, loading, error, initializing,
      billing, billingLoading,
      login, logout, register,
      forgotPassword, resetPassword,
      refreshBillingStatus, extendTrial, cancelSubscription, startCheckout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
