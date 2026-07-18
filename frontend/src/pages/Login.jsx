import { useState, useEffect } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Main container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl relative z-10">
        {/* Left side - Marketing */}
        <div className="hidden lg:flex flex-col justify-center items-start text-white space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold leading-tight">
              ברוכים הבאים ל
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-white">
                MyServices CRM
              </span>
            </h2>
            <p className="text-xl text-gray-100 leading-relaxed">
              ניהול לידים חכם ופשוט. שיפור הפרודוקטיביות של הצוות שלך בעזרת כלים מתקדמים.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: "✨", title: "ניהול מקצועי", desc: "ארגון מלא של כל הלידים" },
              { icon: "📊", title: "ניתוח כלים", desc: "דוחות ונתונים בזמן אמת" },
              { icon: "🔒", title: "מאובטח לחלוטין", desc: "הצפנה מלאה של כל הנתונים" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start space-x-4 group">
                <div className="text-3xl mt-1 group-hover:scale-125 transition-transform duration-300">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-gray-100 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6 transform transition-all duration-500 hover:shadow-2xl">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4">
                💼
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                התחברות
              </h1>
              <p className="text-gray-600 text-sm">{t("login.title")}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center space-x-2 space-x-reverse">
                    <span>👤</span>
                    <span>{t("login.username")}</span>
                  </span>
                </label>
                <div className={`relative transition-all duration-300 ${focusedField === 'username' ? 'scale-105' : ''}`}>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={t("login.usernamePlaceholder")}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300 bg-gray-50 hover:bg-white"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center space-x-2 space-x-reverse">
                    <span>🔐</span>
                    <span>{t("login.password")}</span>
                  </span>
                </label>
                <div className={`relative transition-all duration-300 ${focusedField === 'password' ? 'scale-105' : ''}`}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={t("login.passwordPlaceholder")}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300 bg-gray-50 hover:bg-white"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 space-x-reverse cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded accent-indigo-600"
                    disabled={loading}
                  />
                  <span className="text-gray-700 group-hover:text-indigo-600 transition-colors">זכור אותי</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors"
                >
                  שכחת סיסמה?
                </Link>
              </div>

              {/* Error Message */}
              {localError && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm animate-pulse">
                  <p className="font-semibold">⚠️ שגיאה</p>
                  <p>{localError}</p>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2 space-x-reverse">
                    <span className="animate-spin">⏳</span>
                    <span>טוען...</span>
                  </span>
                ) : (
                  "התחברות"
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-700 text-center">
                🎯 פרטי ההתחברות לדמו:
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white rounded-lg p-2 border border-indigo-100">
                  <p className="text-gray-600 font-semibold">👤 שם משתמש</p>
                  <p className="text-indigo-600 font-mono font-bold">admin</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-indigo-100">
                  <p className="text-gray-600 font-semibold">🔑 סיסמה</p>
                  <p className="text-indigo-600 font-mono font-bold">admin123</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center space-x-1 space-x-reverse">
                <span>🔒</span>
                <span>{t("login.secureConnection")}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Styles for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
