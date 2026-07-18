import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
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

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Button - צג רק בטלפון */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 right-4 z-50 md:hidden bg-blue-600 text-white p-2 rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay - סגור תפריט בלחיצה בחוץ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static md:translate-x-0 top-0 right-0 w-64 min-h-screen bg-slate-900 text-white p-6 z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
        dir={language === "he" ? "rtl" : "ltr"}
      >
        {/* Close Button - טלפון בלבד */}
        <button
          onClick={closeSidebar}
          className="md:hidden absolute top-4 right-4 text-white"
        >
          <X size={24} />
        </button>

        <div className="mb-10 mt-8 md:mt-0">
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
              onClick={closeSidebar}
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
    </>
  );
}