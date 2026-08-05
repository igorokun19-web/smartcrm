import { useEffect, useState } from "react";
import { Save, Building2 } from "lucide-react";
import { useCrm } from "../context/CrmContext";
import { useAuth } from "../context/AuthContext";

const inputClass = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500";
const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function Settings() {
  const { leads } = useCrm();
  const { billing, billingLoading, extendTrial, cancelSubscription, refreshBillingStatus, startCheckout } = useAuth();
  const [companyInfo, setCompanyInfo] = useState(
    JSON.parse(localStorage.getItem("companyInfo") || '{"name":"SmartCRM","email":"info@smartcrm.com","phone":"1-800-SMARTCRM","address":"תל אביב, ישראל","logo":""}')
  );
  const [saved, setSaved] = useState(false);
  const [billingNotice, setBillingNotice] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const billingResult = params.get("billing");

    if (billingResult === "success") {
      setBillingNotice("✅ התשלום הושלם בהצלחה. המנוי עודכן.");
      refreshBillingStatus();
    } else if (billingResult === "cancel") {
      setBillingNotice("ℹ️ התשלום בוטל. לא בוצע חיוב.");
    }

    if (billingResult) {
      params.delete("billing");
      const nextQuery = params.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ""}`;
      window.history.replaceState({}, "", nextUrl);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("companyInfo", JSON.stringify(companyInfo));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const statsData = [
    { label: "סה״כ לידים", value: leads.length, icon: "👥" },
    { label: "לידים פעילים", value: leads.filter(l => ["New", "Contacted"].includes(l.status)).length, icon: "⚡" },
    { label: "עסקאות סגורות", value: leads.filter(l => l.status === "Won").length, icon: "🏆" },
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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">⚙️ הגדרות</h1>
        <p className="text-gray-600 mt-1">ניהול הגדרות והנתונים של החברה</p>
      </div>

      {/* Save Notification */}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <span>✅</span>
          <span>ההגדרות נשמרו בהצלחה!</span>
        </div>
      )}

      {/* Billing & Trial */}
      <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-bold">💳 מנוי וחיוב</h2>
          <button
            onClick={refreshBillingStatus}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            רענן סטטוס
          </button>
        </div>

        {billingNotice && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900 text-sm">
            {billingNotice}
          </div>
        )}

        {billingLoading && <p className="text-sm text-gray-600">טוען נתוני מנוי...</p>}

        {!billingLoading && !billing && (
          <p className="text-sm text-gray-600">לא נמצאו נתוני מנוי כרגע.</p>
        )}

        {!billingLoading && billing && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500">סטטוס מנוי</p>
                <p className="font-semibold text-lg">{billing.subscriptionStatus}</p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500">תוכנית</p>
                <p className="font-semibold text-lg">{billing.plan}</p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500">ימים שנותרו</p>
                <p className="font-semibold text-lg">{billing.daysLeft}</p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500">שם חיוב</p>
                <p className="font-semibold text-lg">{billing.billingDescriptor || "RYNEX"}</p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500">סיום ניסיון</p>
                <p className="font-semibold">{formatDateTime(billing.trialEndsAt)}</p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <p className="text-gray-500">סיום אפקטיבי</p>
                <p className="font-semibold">{formatDateTime(billing.effectiveEndAt)}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleUpgradePlan("basic")}
                disabled={billingLoading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                שדרוג ל-Basic ($12.90)
              </button>

              <button
                onClick={() => handleUpgradePlan("pro")}
                disabled={billingLoading}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                שדרוג ל-Pro ($20.90)
              </button>

              <button
                onClick={handleExtendTrial}
                disabled={!canExtendTrial || billingLoading}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                הארכת ניסיון 14 ימים
              </button>

              <button
                onClick={handleCancelSubscription}
                disabled={billing.subscriptionStatus === "canceled" || billingLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ביטול מיידי
              </button>
            </div>
          </>
        )}
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Building2 size={24} className="text-blue-600" />
          <h2 className="text-2xl font-bold">📋 נתוני החברה</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>שם החברה</label>
            <input
              type="text"
              value={companyInfo.name}
              onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
              className={inputClass}
              placeholder="SmartCRM"
            />
          </div>

          <div>
            <label className={labelClass}>דוא״ל</label>
            <input
              type="email"
              value={companyInfo.email}
              onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
              className={inputClass}
              placeholder="info@company.com"
            />
          </div>

          <div>
            <label className={labelClass}>טלפון</label>
            <input
              type="tel"
              value={companyInfo.phone}
              onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
              className={inputClass}
              placeholder="1-800-000-0000"
            />
          </div>

          <div>
            <label className={labelClass}>טלפון WhatsApp</label>
            <input
              type="tel"
              value={companyInfo.whatsapp || ""}
              onChange={(e) => setCompanyInfo({ ...companyInfo, whatsapp: e.target.value })}
              className={inputClass}
              placeholder="972501234567"
            />
          </div>

          <div>
            <label className={labelClass}>כתובת</label>
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
          <Save size={18} /> שמור הגדרות
        </button>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold mb-6">📊 סטטיסטיקות מהירות</h2>
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
        <h2 className="text-2xl font-bold mb-6">💾 גיבוי וייצוא</h2>
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
              a.download = `smartcrm_backup_${new Date().toISOString().split("T")[0]}.json`;
              a.click();
            }}
            className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"
          >
            <span>📥</span> גיבוי מלא של הנתונים
          </button>

          <p className="text-sm text-gray-600 text-center">
            ✅ גיבוי מלא כולל לידים, שירותים וחשבוניות בקובץ JSON
          </p>
        </div>
      </div>

      {/* API & Integration */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-bold mb-6">🔌 אינטגרציות</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold mb-2">📧 Webhook URL</h3>
            <input
              type="text"
              value={`${window.location.origin}/api/webhook`}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-white text-gray-600 text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              השתמש בקישור זה כדי לשלוח נתונים מחוץ למערכת
            </p>
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
          גרסה 1.0 • © 2026 SmartCRM • כל הזכויות שמורות
        </p>
      </div>
    </div>
  );
}
