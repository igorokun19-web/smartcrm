import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

export default function Sidebar() {
  const { language, t } = useLanguage();
  const menuItems = [
    { name: t("sidebar.dashboard"), path: "/dashboard", icon: "📊" },
    { name: t("sidebar.leads"), path: "/leads", icon: "👥" },
    { name: t("sidebar.pipeline"), path: "/pipeline", icon: "🏗️" },
    { name: t("sidebar.customers"), path: "/customers", icon: "🤝" },
    { name: t("sidebar.tasks"), path: "/tasks", icon: "✅" },
    { name: t("sidebar.services"), path: "/services", icon: "📦" },
    { name: t("sidebar.invoices"), path: "/invoices", icon: "💵" },
    { name: t("sidebar.reports"), path: "/reports", icon: "📈" },
    { name: t("sidebar.guide"), path: "/guide", icon: "📖" },
    { name: t("sidebar.about"), path: "/about", icon: "ℹ️" },
    { name: t("sidebar.settings"), path: "/settings", icon: "⚙️" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6" dir={language === "he" ? "rtl" : "ltr"}>
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-white">
          {t("sidebar.appName")}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {t("sidebar.appDesc")}
        </p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                isActive
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}