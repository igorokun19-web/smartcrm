import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../hooks/useTranslation";

export default function Register() {
  const { t } = useTranslation();
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    // Validation
    if (!formData.username.trim()) {
      setLocalError("שם משתמש נדרש");
      return;
    }

    if (formData.username.length < 2 || formData.username.length > 50) {
      setLocalError("שם משתמש חייב להיות בין 2-50 תווים");
      return;
    }

    if (!formData.name.trim()) {
      setLocalError("שם מלא נדרש");
      return;
    }

    if (!formData.email.trim()) {
      setLocalError("דוא״ל נדרש");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setLocalError("דוא״ל לא תקין");
      return;
    }

    if (formData.password.length < 6) {
      setLocalError("סיסמה חייבת להיות לפחות 6 תווים");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError("הסיסמאות אינן תואמות");
      return;
    }

    const success = await register(
      formData.username,
      formData.email,
      formData.password,
      formData.confirmPassword,
      formData.name
    );

    if (success) {
      navigate("/dashboard");
    } else {
      setLocalError(error || "שגיאה בהרשמה");
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
        {/* Left side - Info */}
        <div className="hidden lg:flex flex-col justify-center items-start text-white space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold leading-tight">
              הצטרף אלינו
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-white">
                היום
              </span>
            </h2>
            <p className="text-xl text-gray-100 leading-relaxed">
              קח חלק בעולם ניהול הלידים החכם. הצטרף לאלפים של עסקים שמשתמשים ב-SmartCRM כדי להגדיל את ההכנסות שלהם.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-4">
            {[
              { icon: "🚀", title: "התחל בחינם", desc: "ללא כרטיס אשראי נדרש" },
              { icon: "⚡", title: "שימוש מיידי", desc: "בדקות ספורות בלבד" },
              { icon: "🎯", title: "תמיכה מלאה", desc: "צוות עזרה תמיד זמין" }
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

        {/* Right side - Register form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 space-y-6 transform transition-all duration-500 hover:shadow-2xl">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-4">
                ✨
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                הרשמה
              </h1>
              <p className="text-gray-600 text-sm">הצטרף כעת והתחל לנהל את הלידים שלך</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center space-x-2 space-x-reverse">
                    <span>👤</span>
                    <span>שם משתמש</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="בחר שם משתמש ייחודי"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300 bg-gray-50 hover:bg-white"
                  disabled={loading}
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center space-x-2 space-x-reverse">
                    <span>📝</span>
                    <span>שם מלא</span>
                  </span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="שם מלא"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300 bg-gray-50 hover:bg-white"
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center space-x-2 space-x-reverse">
                    <span>📧</span>
                    <span>דוא״ל</span>
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300 bg-gray-50 hover:bg-white"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center space-x-2 space-x-reverse">
                    <span>🔐</span>
                    <span>סיסמה</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="לפחות 6 תווים"
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <span className="flex items-center space-x-2 space-x-reverse">
                    <span>✔️</span>
                    <span>אימות סיסמה</span>
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('confirm')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="הזן את הסיסמה שוב"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all duration-300 bg-gray-50 hover:bg-white"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-indigo-600 transition-colors"
                    disabled={loading}
                  >
                    {showConfirm ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {localError && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm animate-pulse">
                  <p className="font-semibold">⚠️ שגיאה</p>
                  <p>{localError}</p>
                </div>
              )}

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2 space-x-reverse">
                    <span className="animate-spin">⏳</span>
                    <span>נרשם...</span>
                  </span>
                ) : (
                  "הרשמה"
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600 text-sm">
                יש לך חשבון כבר?{" "}
                <Link
                  to="/login"
                  className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-colors"
                >
                  התחבר כאן
                </Link>
              </p>
            </div>

            {/* Security Notice */}
            <div className="text-center">
              <p className="text-xs text-gray-500 flex items-center justify-center space-x-1 space-x-reverse">
                <span>🔒</span>
                <span>כל הנתונים שלך מוצפנים וגם</span>
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
