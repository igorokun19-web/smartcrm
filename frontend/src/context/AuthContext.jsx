import { createContext, useContext, useState, useEffect } from "react";

import { setAnalyticsUser, trackEvent } from "../lib/analytics";

const AuthContext = createContext();

// Dynamic API URL - use current origin in production, localhost in dev
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? "http://localhost:3001" : window.location.origin);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("authToken") ? true : false;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ========================================
  // VALIDATE TOKEN ON APP LOAD
  // ========================================
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem("authToken");
      if (token && !user) {
        try {
          const response = await fetch(`${API_URL}/api/auth/validate-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setIsAuthenticated(true);
            setAnalyticsUser(data.user.id);
          } else {
            // Token expired or invalid
            logout();
          }
        } catch (err) {
          console.error("Token validation error:", err);
          logout();
        }
      }
    };

    validateToken();
  }, []);

  // ========================================
  // 1. LOGIN WITH PASSWORD HASHING (Backend)
  // ========================================
  const login = async (username, password, rememberMe = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "שגיאה בהתחברות");
      }

      // Save JWT token
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Save "Remember Me" preference
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      setUser(data.user);
      setIsAuthenticated(true);
      setAnalyticsUser(data.user.id);
      trackEvent("login_success", { rememberMe, userId: data.user.id }, { path: "/login" });

      return true;
    } catch (err) {
      setError(err.message);
      trackEvent("login_failed", { reason: err.message }, { path: "/login" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOGOUT
  // ========================================
  const logout = async () => {
    const token = localStorage.getItem("authToken");
    const currentUserId = user?.id || null;

    if (currentUserId) {
      trackEvent("logout", { userId: currentUserId });
    }
    
    try {
      // Notify backend
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      setAnalyticsUser(null);
    }
  };

  // ========================================
  // 2. REGISTER NEW USER
  // ========================================
  const register = async (username, email, password, confirmPassword, name) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          confirmPassword,
          name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "שגיאה בהרשמה");
      }

      // Save JWT token
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user);
      setIsAuthenticated(true);
      setAnalyticsUser(data.user.id);
      trackEvent("register_success", { userId: data.user.id }, { path: "/register" });

      return true;
    } catch (err) {
      setError(err.message);
      trackEvent("register_failed", { reason: err.message }, { path: "/register" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // 3. FORGOT PASSWORD
  // ========================================
  const forgotPassword = async (email) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "שגיאה בשליחת דוא״ל");
      }

      trackEvent("forgot_password_requested", { email });

      return { success: true, message: data.message };
    } catch (err) {
      setError(err.message);
      trackEvent("forgot_password_failed", { reason: err.message });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // 4. RESET PASSWORD
  // ========================================
  const resetPassword = async (token, newPassword) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "שגיאה בשינוי סיסמה");
      }

      trackEvent("reset_password_success", {});

      return { success: true, message: data.message };
    } catch (err) {
      setError(err.message);
      trackEvent("reset_password_failed", { reason: err.message });
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
