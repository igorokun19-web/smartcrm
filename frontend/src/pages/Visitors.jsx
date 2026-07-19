import { useEffect, useState } from "react";
import { Users, Eye, Globe, LogIn, RefreshCw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3001" : window.location.origin);

const kpiCard = "rounded-xl border p-4 bg-white shadow-sm";

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

  const fetchSummary = async (selectedDays) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
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
  };

  useEffect(() => {
    fetchSummary(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

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
