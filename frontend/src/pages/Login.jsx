import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";

export default function Login() {
  const { t } = useTranslation();
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!username || !password) {
      setLocalError(t("login.fieldsRequired"));
      return;
    }

    const success = await login(username, password, rememberMe);
    if (success) {
      navigate("/dashboard");
    } else {
      setLocalError(error || t("login.invalidCredentials"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        {/* לוגו וכותרת */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            MyServices CRM
          </h1>
          <p className="text-gray-600">{t("login.title")}</p>
        </div>

        {/* טופס */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* שם משתמש */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("login.username")}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("login.usernamePlaceholder")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          {/* סיסמה */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("login.password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("login.passwordPlaceholder")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <label
              htmlFor="rememberMe"
              className="mr-2 text-sm text-gray-700 cursor-pointer"
            >
              זכור אותי למשך 30 ימים
            </label>
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-800 transition"
            >
              שכחת סיסמה?
            </Link>
          </div>

          {/* הודעת שגיאה */}
          {localError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {localError}
            </div>
          )}

          {/* כפתור התחברות */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "טוען..." : t("login.loginButton")}
          </button>
        </form>

        {/* הערה לדמו */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-gray-600 text-center mb-2">
            {t("login.demoCredentials")}
          </p>
          <div className="space-y-1 text-xs text-center font-mono">
            <p>
              <span className="font-semibold">👤 {t("login.username")}:</span>{" "}
              admin
            </p>
            <p>
              <span className="font-semibold">🔑 {t("login.password")}:</span>{" "}
              admin123
            </p>
          </div>
        </div>

        {/* footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          {t("login.secureConnection")}
        </p>
      </div>
    </div>
  );
}
