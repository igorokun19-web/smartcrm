import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { forgotPassword, loading, error } = useAuth();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!email) {
      setLocalError("דוא״ל נדרש");
      return;
    }

    if (!email.includes("@")) {
      setLocalError("דוא״ל לא חוקי");
      return;
    }

    const result = await forgotPassword(email);
    if (result.success) {
      setSubmitted(true);
    } else {
      setLocalError(result.error || "שגיאה בשליחת דוא״ל");
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            בדוק את דוא״לך
          </h1>
          <p className="text-gray-600 mb-4">
            שלחנו לך קישור לאיפוס סיסמה. אנא בדוק את תיבת הדוא״ל שלך (וגם
            תיקיית ספם).
          </p>
          <p className="text-sm text-gray-500 mb-6">
            הקישור תקף ל-1 שעה בלבד.
          </p>
          <Link
            to="/login"
            className="inline-block bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition"
          >
            חזור להתחברות
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            איפוס סיסמה
          </h1>
          <p className="text-gray-600 text-sm">
            הזן את דוא״לך כדי לקבל קישור לאיפוס סיסמה
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              דוא״ל
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your-email@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          {localError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {localError}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "שולח..." : "שלח קישור אפס"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            זוכר את הסיסמה?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 font-semibold transition"
            >
              חזור להתחברות
            </Link>
          </p>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-xs text-gray-600 text-center">
          <p>🔒 הדוא״ל שלך מוגן ולא ישותף עם צד שלישי</p>
        </div>
      </div>
    </div>
  );
}
