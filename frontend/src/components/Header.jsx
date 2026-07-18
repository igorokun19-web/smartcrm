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
    <header 
      className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 md:py-4 shadow-sm" 
      dir={language === "he" ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Title Section - responsive */}
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 truncate">
            {t("header.welcome")} MyServices CRM
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-1 truncate">
            {today}
          </p>
        </div>

        {/* Profile Section - responsive */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Profile Info - hidden בטלפון */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-700">
              {user?.name || t("header.profile")}
            </p>
            <p className="text-xs text-slate-400">
              {user?.username || t("header.appName")}
            </p>
          </div>

          {/* Profile Avatar */}
          <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">
            {user?.name?.charAt(0) || "M"}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="ml-2 md:ml-4 md:pl-4 md:border-l border-slate-200 text-red-600 hover:text-red-700 transition flex items-center gap-1 md:gap-2 flex-shrink-0"
            title={t("login.logout")}
          >
            <LogOut size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="text-xs md:text-sm hidden md:inline">{t("login.logout")}</span>
          </button>
        </div>
      </div>
    </header>
  );
}