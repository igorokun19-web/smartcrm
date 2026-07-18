import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, loading, error } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!newPassword || !confirmPassword) {
      setLocalError("יש למלא את כל השדות");
      return;
    }

    if (newPassword.length < 6) {
      setLocalError("הסיסמה חייבת להיות לפחות 6 תווים");
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError("הסיסמאות לא תואמות");
      return;
    }

    const result = await resetPassword(token, newPassword);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } else {
      setLocalError(result.error || "שגיאה בשינוי סיסמה");
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            סיסמה שונתה בהצלחה!
          </h1>
          <p className="text-gray-600 mb-6">
            יתוכל להתחבר עם הסיסמה החדשה שלך בקרוב.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🔑</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            סיסמה חדשה
          </h1>
          <p className="text-gray-600 text-sm">הזן סיסמה חדשה לחשבונך</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              סיסמה חדשה
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="לפחות 6 תווים"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              אשר סיסמה
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="הזן את הסיסמה שוב"
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
            {loading ? "משנה..." : "שנה סיסמה"}
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
          <p>🔒 הסיסמה שלך מוצפנת ודו-חד משמית</p>
        </div>
      </div>
    </div>
  );
}
