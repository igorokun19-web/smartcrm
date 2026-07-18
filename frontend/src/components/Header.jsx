import { useNavigate } from "react-router-dom";
import { useTranslation } from "../hooks/useTranslation";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

export default function Header() {
  const { language, t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString(language === "he" ? "he-IL" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm" dir={language === "he" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {t("header.welcome")} MyServices CRM
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {today}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Profile */}
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700">
              {user?.name || t("header.profile")}
            </p>
            <p className="text-xs text-slate-400">
              {user?.username || t("header.appName")}
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            {user?.name?.charAt(0) || "M"}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="ml-4 pl-4 border-l border-slate-200 text-red-600 hover:text-red-700 transition flex items-center gap-2"
            title={t("login.logout")}
          >
            <LogOut size={18} />
            <span className="text-sm hidden sm:inline">{t("login.logout")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}