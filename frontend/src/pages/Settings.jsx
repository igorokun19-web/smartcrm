import { useEffect, useState } from "react";
import { Save, Building2 } from "lucide-react";
import { useCrm } from "../context/CrmContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const i18n = {
  he: {
    title: "⚙️ הגדרות", subtitle: "ניהול הגדרות והנתונים של החברה",
    savedMsg: "✅ ההגדרות נשמרו בהצלחה!",
    billingTitle: "💳 מנוי וחיוב", refreshBtn: "רענן סטאטוס",
    billingLoading: "טוען נתוני מנוי...", noBilling: "לא נמצאו נתוני מנוי כרגע.",
    statusLabel: "סטאטוס מנוי", planLabel: "תוכנית",
    daysLeftLabel: "ימים שנותרו", billingNameLabel: "שם חיוב",
    trialEndLabel: "סיום ניסיון", effectiveEndLabel: "סיום אפקטיבי",
    upgradeBasic: "שדרוג ל-Basic ($12.90)", upgradePro: "שדרוג ל-Pro ($20.90)",
    extendTrial: "הארכת ניסיון 14 ימים", cancelSub: "ביטול מיידי",
    companyTitle: "📋 נתוני החברה",
    companyName: "שם החברה", emailLabel: "דוא״ל", phoneLabel: "טלפון", whatsappLabel: "טלפון WhatsApp", addressLabel: "כתובת",
    saveBtn: "שמור הגדרות",
    statsTitle: "📊 סטאטיסטיקות מהירות",
    backupTitle: "💾 גיבוי וייצוא", backupBtn: "גיבוי מלא של הנתונים",
    backupDesc: "✅ גיבוי מלא כולל לידים, שירותים וחשבוניות בקובץ JSON",
    integrationsTitle: "🔌 אינטגרציות",
    webhookLabel: "📧 Webhook URL", webhookDesc: "השתמש בקישור זה כדי לשלוח נתונים מחוץ למערכת",
  },
  en: {
    title: "⚙️ Settings", subtitle: "Manage your company settings and data",
    savedMsg: "✅ Settings saved successfully!",
    billingTitle: "💳 Subscription & Billing", refreshBtn: "Refresh Status",
    billingLoading: "Loading subscription data...", noBilling: "No subscription data found.",
    statusLabel: "Subscription Status", planLabel: "Plan",
    daysLeftLabel: "Days Remaining", billingNameLabel: "Billing Name",
    trialEndLabel: "Trial Ends", effectiveEndLabel: "Effective End",
    upgradeBasic: "Upgrade to Basic ($12.90)", upgradePro: "Upgrade to Pro ($20.90)",
    extendTrial: "Extend Trial 14 Days", cancelSub: "Cancel Immediately",
    companyTitle: "📋 Company Information",
    companyName: "Company Name", emailLabel: "Email", phoneLabel: "Phone", whatsappLabel: "WhatsApp Phone", addressLabel: "Address",
    saveBtn: "Save Settings",
    statsTitle: "📊 Quick Stats",
    backupTitle: "💾 Backup & Export", backupBtn: "Full Data Backup",
    backupDesc: "✅ Full backup including leads, services and invoices as JSON",
    integrationsTitle: "🔌 Integrations",
    webhookLabel: "📧 Webhook URL", webhookDesc: "Use this URL to send data from outside the system",
  },
  ru: {
    title: "⚙️ Настройки", subtitle: "Управление настройками и данными компании",
    savedMsg: "✅ Настройки успешно сохранены!",
    billingTitle: "💳 Подписка и оплата", refreshBtn: "Обновить",
    billingLoading: "Загрузка данных...", noBilling: "Данных подписке не найдено.",
    statusLabel: "Статус", planLabel: "Тариф",
    daysLeftLabel: "Осталось дней", billingNameLabel: "Название в чеке",
    trialEndLabel: "Окончание пробного", effectiveEndLabel: "Фактическое окончание",
    upgradeBasic: "Обновить до Basic ($12.90)", upgradePro: "Обновить до Pro ($20.90)",
    extendTrial: "Продлить пробный период на 14 дней", cancelSub: "Отменить немедленно",
    companyTitle: "📋 Информация о компании",
    companyName: "Название компании", emailLabel: "Эл. почта", phoneLabel: "Телефон", whatsappLabel: "Тел. WhatsApp", addressLabel: "Адрес",
    saveBtn: "Сохранить",
    statsTitle: "📊 Быстрая статистика",
    backupTitle: "💾 Резервное копирование", backupBtn: "Полное резервное копирование",
    backupDesc: "✅ Полное копирование: лиды, услуги, счета — файл JSON",
    integrationsTitle: "🔌 Интеграции",
    webhookLabel: "📧 Webhook URL", webhookDesc: "Используйте этот URL для отправки данных извне",
  },
};

const inputClass = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function Settings() {
  const { leads } = useCrm();
  const { language } = useLanguage();
  const { billing, billingLoading, extendTrial, cancelSubscription, refreshBillingStatus, startCheckout } = useAuth();
  const s = i18n[language] || i18n.he;
  const isRtl = language === "he";
  const [companyInfo, setCompanyInfo] = useState(
    JSON.parse(localStorage.getItem("companyInfo") || '{"name":"MyServices CRM","email":"info@myservices.com","phone":"1-800-MYSERVICES","address":"תל אביב, ישראל","logo":""}')
  );
  const [saved, setSaved] = useState(false);
  const [billingNotice, setBillingNotice] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const billingResult = params.get("billing");

    if (billingResult === "success") return "✅ התשלום הושלם בהצלחה. המנוי עודכן.";
    if (billingResult === "cancel") return "ℹ️ התשלום בוטל. לא בוצע חיוב.";
    return "";
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billingResult = params.get("billing");

    if (billingResult === "success") {
      refreshBillingStatus();
    }

    if (billingResult) {
      params.delete("billing");
      const nextQuery = params.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }
  }, [refreshBillingStatus]);

  const handleSave = () => {
    localStorage.setItem("companyInfo", JSON.stringify(companyInfo));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const statsData = [
    { label: language === "he" ? "סה״כ לידים" : language === "ru" ? "Всего лидов" : "Total Leads", value: leads.length, icon: "👥" },
    { label: language === "he" ? "לידים פעילים" : language === "ru" ? "Активные лиды" : "Active Leads", value: leads.filter(l => ["New", "Contacted"].includes(l.status)).length, icon: "⚡" },
    { label: language === "he" ? "עסקאות סגורות" : language === "ru" ? "Закрытые сделки" : "Closed Deals", value: leads.filter(l => l.status === "Won").length, icon: "🏆" },
  ];

  const formatDateTime = (rawValue) => {
    if (!rawValue) return "-";
    const date = new Date(rawValue);
    if (Number.isNaN(date.getTime())) return rawValue;
    return date.toLocaleString("he-IL");
  };

  const canExtendTrial =
    billing?.subscriptionStatus === "trialing" &&
    !billing?.trialExtendedUntil &&
    !billing?.usage?.valueGateReached;

  const handleExtendTrial = async () => {
    const result = await extendTrial();
    if (result.success) {
      setBillingNotice("✅ תקופת הניסיון הוארכה ב-14 ימים");
      return;
    }

    setBillingNotice(`❌ ${result.error || "הארכת ניסיון נכשלה"}`);
  };

  const handleCancelSubscription = async () => {
    const approved = window.confirm("לבטל את המנוי מיידית?");
    if (!approved) return;

    const result = await cancelSubscription("user_requested_immediate_cancel");
    if (result.success) {
      setBillingNotice("✅ המנוי בוטל מיידית");
      return;
    }

    setBillingNotice(`❌ ${result.error || "ביטול המנוי נכשל"}`);
  };

  const handleUpgradePlan = async (plan) => {
    const result = await startCheckout(plan);
    if (!result.success) {
      setBillingNotice(`❌ ${result.error || "פתיחת תשלום נכשלה"}`);
      return;
    }

    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl;
      return;
    }

    setBillingNotice("❌ עמוד התשלום לא זמין כרגע");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{s.title}</h1>
        <p className="text-gray-600 mt-1">{s.subtitle}</p>
      </div>

      {/* Save Notification */}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <span>✅</span>
          <span>{s.savedMsg}</span>
        </div>
      )}

      {/* Billing & Trial */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-bold">{s.billingTitle}</h2>
          <button
            onClick={refreshBillingStatus}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            {s.refreshBtn}
          </button>
        </div>

        {billingNotice && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900 text-sm">
            {billingNotice}
          </div>
        )}

        {billingLoading && <p className="text-sm text-gray-600">{s.billingLoading}</p>}

        {!billingLoading && !billing && (
          <p className="text-sm text-gray-600">{s.noBilling}</p>
        )}

        {!billingLoading && billing && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500">{s.statusLabel}</p>
                <p className="font-semibold text-lg">{billing.subscriptionStatus}</p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500">{s.planLabel}</p>
                <p className="font-semibold text-lg">{billing.plan}</p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500">{s.daysLeftLabel}</p>
                <p className="font-semibold text-lg">{billing.daysLeft}</p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500">{s.billingNameLabel}</p>
                <p className="font-semibold text-lg">{billing.billingDescriptor || "RYNEX"}</p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500">{s.trialEndLabel}</p>
                <p className="font-semibold">{formatDateTime(billing.trialEndsAt)}</p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500">{s.effectiveEndLabel}</p>
                <p className="font-semibold">{formatDateTime(billing.effectiveEndAt)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleUpgradePlan("basic")}
                disabled={billingLoading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {s.upgradeBasic}
              </button>

              <button
                onClick={() => handleUpgradePlan("pro")}
                disabled={billingLoading}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {s.upgradePro}
              </button>

              <button
                onClick={handleExtendTrial}
                disabled={!canExtendTrial || billingLoading}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {s.extendTrial}
              </button>

              <button
                onClick={handleCancelSubscription}
                disabled={billing.subscriptionStatus === "canceled" || billingLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {s.cancelSub}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 size={24} className="text-blue-600" />
          <h2 className="text-2xl font-bold">{s.companyTitle}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>{s.companyName}</label>
            <input
              type="text"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
              className={inputClass}
              placeholder="MyServices CRM"
            />
          </div>

          <div>
            <label className={labelClass}>{s.emailLabel}</label>
            <input
              type="email"
              value={companyInfo.email}
              onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
              className={inputClass}
              placeholder="info@company.com"
            />
          </div>

          <div>
            <label className={labelClass}>{s.phoneLabel}</label>
            <input
              type="tel"
              value={companyInfo.phone}
              onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
              className={inputClass}
              placeholder="1-800-000-0000"
            />
          </div>

          <div>
            <label className={labelClass}>{s.whatsappLabel}</label>
            <input
              type="tel"
              value={companyInfo.whatsapp || ""}
              onChange={(e) => setCompanyInfo({ ...companyInfo, whatsapp: e.target.value })}
              className={inputClass}
              placeholder="972501234567"
            />
          </div>

          <div>
            <label className={labelClass}>{s.addressLabel}</label>
            <input
              type="text"
              value={companyInfo.address}
              onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
              className={inputClass}
              placeholder="תל אביב, ישראל"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
        >
          <Save size={18} /> {s.saveBtn}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold mb-6">{s.statsTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statsData.map((stat, idx) => (
            <div key={idx} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Export */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold mb-6">{s.backupTitle}</h2>
        <div className="space-y-4">
          <button
            onClick={() => {
              const data = {
                leads,
                services: JSON.parse(localStorage.getItem("services") || "[]"),
                invoices: JSON.parse(localStorage.getItem("invoices") || "[]"),
                companyInfo,
                exportedAt: new Date().toISOString(),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `myservicescrm_backup_${new Date().toISOString().split("T")[0]}.json`;
              a.click();
            }}
            className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
          >
            <span>📥</span> {s.backupBtn}
          </button>

          <p className="text-sm text-gray-600 text-center">
            {s.backupDesc}
          </p>
        </div>
      </div>

      {/* API & Integration */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold mb-6">{s.integrationsTitle}</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-2">{s.webhookLabel}</h3>
            <input
              type="text"
              value={`${window.location.origin}/api/webhook`}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-white text-gray-600 text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">{s.webhookDesc}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-2">🔐 API Key</h3>
            <input
              type="password"
              value="מפתח מוגן - צור קשר עם המנהל"
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-white text-gray-600 text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              סוד - אל תשתף עם אף אחד
            </p>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
        <h2 className="text-2xl font-bold mb-3">🚀 MyServices CRM</h2>
        <p className="mb-4">
          מערכת ניהול לידים וחשבוניות עבור נותני שירות
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="font-semibold">✅ Leads Management</p>
            <p className="text-blue-100 text-xs">ניהול מלא של לידים</p>
          </div>
          <div>
            <p className="font-semibold">💵 Invoicing</p>
            <p className="text-blue-100 text-xs">חשבוניות אוטומטיות</p>
          </div>
          <div>
            <p className="font-semibold">📦 Services</p>
            <p className="text-blue-100 text-xs">קטלוג שירותים</p>
          </div>
          <div>
            <p className="font-semibold">📊 Analytics</p>
            <p className="text-blue-100 text-xs">דוחות מתקדמים</p>
          </div>
        </div>
        <p className="mt-6 text-blue-100 text-sm">
          גרסה 1.0 • © 2026 MyServices CRM • כל הזכויות שמורות
        </p>
      </div>
    </div>
  );
}
