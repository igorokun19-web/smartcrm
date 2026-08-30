import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, Eye, Globe, LogIn, RefreshCw } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3001" : "https://smartcrm-3cle.onrender.com");

const kpiCard = "rounded-xl border p-4 bg-white shadow-sm";
const conversionLabels = {
  register_success: "הרשמה הושלמה",
  login_success: "התחברות מוצלחת",
  lead_created: "ליד נוצר",
  forgot_password_requested: "בקשת איפוס סיסמה",
  reset_password_success: "איפוס סיסמה הצליח",
};

function Kpi({ icon: Icon, label, value, color }) {
  return (
    <div className={kpiCard}>
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        <Icon size={18} className={color} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function Visitors() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const publicationReport = useMemo(() => {
    if (!data) {
      return null;
    }

    const topCampaign = data.topCampaigns?.[0];
    const topReferrer = data.topReferrers?.[0];
    const topConversion = data.conversionEvents?.[0];
    const socialWinner = data.socialBreakdown?.[0];

    const safeCampaign = topCampaign
      ? `${topCampaign.campaign} (${topCampaign.source}/${topCampaign.medium})`
      : "אין עדיין קמפיין מוביל";
    const safeReferrer = topReferrer ? topReferrer.referrer : "אין עדיין רפרר מוביל";
    const safeConversion = topConversion
      ? `${conversionLabels[topConversion.event_name] || topConversion.event_name} - ${topConversion.events}`
      : "אין עדיין המרות מדידות";
    const safeSocial = socialWinner ? socialWinner.channel : "אין עדיין ערוץ מוביל";

    return [
      `טווח נבדק: ${data.range.days} ימים`,
      `תנועה מובילה: ${safeSocial}`,
      `מקור מוביל: ${safeReferrer}`,
      `קמפיין מוביל: ${safeCampaign}`,
      `המרה חזקה: ${safeConversion}`,
      `סך לידים/המרות: ${data.totals.usage_events}`,
    ].join("\n");
  }, [data]);

  const copyReport = useCallback(async () => {
    if (!publicationReport) {
      return;
    }

    try {
      await navigator.clipboard.writeText(publicationReport);
    } catch {
      window.alert("לא הצלחתי להעתיק אוטומטית. אפשר לסמן ולהעתיק ידנית.");
    }
  }, [publicationReport]);

  const fetchSummary = useCallback(async (selectedDays) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        throw new Error("Authentication is required");
      }
      const response = await fetch(`${API_URL}/api/analytics/summary?days=${selectedDays}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "שגיאה בשליפת נתוני כניסות");
      }

      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      fetchSummary(days);
    }, 0);

    return () => clearTimeout(id);
  }, [days, fetchSummary]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">כניסות לאתר</h1>
          <p className="text-gray-500 text-sm">כמה אנשים נכנסו לאתר ומאיפה הגיעו</p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value={7}>7 ימים אחרונים</option>
            <option value={30}>30 ימים אחרונים</option>
            <option value={90}>90 ימים אחרונים</option>
          </select>
          <button
            onClick={() => fetchSummary(days)}
            className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50"
          >
            <RefreshCw size={16} />
            רענן
          </button>
          {publicationReport && (
            <button
              onClick={copyReport}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm bg-gray-900 text-white hover:bg-gray-800"
            >
              העתק דוח
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 text-sm">טוען נתונים...</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Kpi icon={Users} label="מבקרים ייחודיים" value={data.totals.unique_visitors} color="text-blue-600" />
            <Kpi icon={Globe} label="סשנים" value={data.totals.unique_sessions} color="text-purple-600" />
            <Kpi icon={Eye} label="צפיות בעמודים" value={data.totals.page_views} color="text-green-600" />
            <Kpi icon={LogIn} label="משתמשים מחוברים" value={data.totals.authenticated_users} color="text-orange-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={kpiCard}>
              <h2 className="font-bold text-gray-800 mb-3">כניסות לפי יום</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-right text-gray-500 border-b">
                      <th className="p-2">תאריך</th>
                      <th className="p-2">מבקרים</th>
                      <th className="p-2">צפיות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.daily.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-3 text-center text-gray-400">
                          אין נתונים בטווח שנבחר
                        </td>
                      </tr>
                    ) : (
                      data.daily.map((row) => (
                        <tr key={row.date} className="border-b hover:bg-gray-50">
                          <td className="p-2">{row.date}</td>
                          <td className="p-2">{row.visitors}</td>
                          <td className="p-2">{row.page_views}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={kpiCard}>
              <h2 className="font-bold text-gray-800 mb-3">עמודים מובילים</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-right text-gray-500 border-b">
                      <th className="p-2">עמוד</th>
                      <th className="p-2">צפיות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPages.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="p-3 text-center text-gray-400">
                          אין נתונים בטווח שנבחר
                        </td>
                      </tr>
                    ) : (
                      data.topPages.map((row) => (
                        <tr key={row.path} className="border-b hover:bg-gray-50">
                          <td className="p-2">{row.path}</td>
                          <td className="p-2">{row.views}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={kpiCard}>
              <h2 className="font-bold text-gray-800 mb-3">מקורות הפניה מובילים</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-right text-gray-500 border-b">
                      <th className="p-2">מקור</th>
                      <th className="p-2">אירועים</th>
                      <th className="p-2">מבקרים</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topReferrers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-3 text-center text-gray-400">
                          אין נתונים בטווח שנבחר
                        </td>
                      </tr>
                    ) : (
                      data.topReferrers.map((row) => (
                        <tr key={row.referrer} className="border-b hover:bg-gray-50">
                          <td className="p-2">{row.referrer}</td>
                          <td className="p-2">{row.events}</td>
                          <td className="p-2">{row.visitors}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={kpiCard}>
              <h2 className="font-bold text-gray-800 mb-3">פירוק תנועה חברתית</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-right text-gray-500 border-b">
                      <th className="p-2">ערוץ</th>
                      <th className="p-2">אירועים</th>
                      <th className="p-2">מבקרים</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.socialBreakdown.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-3 text-center text-gray-400">
                          אין נתונים בטווח שנבחר
                        </td>
                      </tr>
                    ) : (
                      data.socialBreakdown.map((row) => (
                        <tr key={row.channel} className="border-b hover:bg-gray-50">
                          <td className="p-2 capitalize">{row.channel}</td>
                          <td className="p-2">{row.events}</td>
                          <td className="p-2">{row.visitors}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className={kpiCard}>
            <h2 className="font-bold text-gray-800 mb-3">המרות מרכזיות</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-right text-gray-500 border-b">
                    <th className="p-2">אירוע</th>
                    <th className="p-2">כמות</th>
                    <th className="p-2">סשנים</th>
                    <th className="p-2">מבקרים</th>
                  </tr>
                </thead>
                <tbody>
                  {data.conversionEvents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-gray-400">
                        אין נתוני המרה בטווח שנבחר
                      </td>
                    </tr>
                  ) : (
                    data.conversionEvents.map((row) => (
                      <tr key={row.event_name} className="border-b hover:bg-gray-50">
                        <td className="p-2">{conversionLabels[row.event_name] || row.event_name}</td>
                        <td className="p-2">{row.events}</td>
                        <td className="p-2">{row.sessions}</td>
                        <td className="p-2">{row.visitors}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {publicationReport && (
            <div className={kpiCard}>
              <h2 className="font-bold text-gray-800 mb-3">דוח אופרטיבי לפרסום</h2>
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 border rounded-lg p-4 leading-6">
                {publicationReport}
              </pre>
            </div>
          )}

          <div className={kpiCard}>
            <h2 className="font-bold text-gray-800 mb-3">קמפיינים מובילים (UTM)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-right text-gray-500 border-b">
                    <th className="p-2">קמפיין</th>
                    <th className="p-2">מקור</th>
                    <th className="p-2">מדיום</th>
                    <th className="p-2">מבקרים</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-gray-400">
                        אין נתונים בטווח שנבחר
                      </td>
                    </tr>
                  ) : (
                    data.topCampaigns.map((row, idx) => (
                      <tr key={`${row.campaign}-${row.source}-${idx}`} className="border-b hover:bg-gray-50">
                        <td className="p-2">{row.campaign}</td>
                        <td className="p-2">{row.source}</td>
                        <td className="p-2">{row.medium}</td>
                        <td className="p-2">{row.visitors}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
