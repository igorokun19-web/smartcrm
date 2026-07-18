import { useState } from "react";
import { Download, BarChart3, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import { useCrm, calculateLeadScore, formatDate } from "../context/CrmContext";

const kpiCard = "rounded-xl border p-4 bg-white shadow-sm";

function ExportButton({ format, data, filename }) {
  const handleExport = () => {
    let content;
    let mimeType;
    let fileExtension;

    if (format === "json") {
      content = JSON.stringify(data, null, 2);
      mimeType = "application/json";
      fileExtension = ".json";
    } else if (format === "csv") {
      // Convert to CSV
      const headers = Object.keys(data[0] || {});
      const rows = data.map((item) =>
        headers.map((h) => {
          const value = item[h];
          if (typeof value === "object") return JSON.stringify(value);
          if (typeof value === "string" && value.includes(",")) return `"${value}"`;
          return value;
        }).join(",")
      );
      content = [headers.join(","), ...rows].join("\n");
      mimeType = "text/csv";
      fileExtension = ".csv";
    } else if (format === "xlsx") {
      // Simple Excel-like format (TSV that Excel can open)
      const headers = Object.keys(data[0] || {});
      const rows = data.map((item) =>
        headers.map((h) => {
          const value = item[h];
          if (typeof value === "object") return JSON.stringify(value);
          return value;
        }).join("\t")
      );
      content = [headers.join("\t"), ...rows].join("\n");
      mimeType = "text/plain";
      fileExtension = ".tsv";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}${fileExtension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={() => handleExport()}
      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
    >
      <Download size={16} />
      {format.toUpperCase()}
    </button>
  );
}

export default function Reports() {
  const { leads } = useCrm();
  const [selectedReport, setSelectedReport] = useState("summary");

  // Calculate metrics
  const totalLeads = leads.length;
  const wonDeals = leads.filter((l) => l.status === "Won").length;
  const quotedDeals = leads.filter((l) => l.status === "Quoted").length;
  const contactedLeads = leads.filter((l) => l.status === "Contacted").length;
  const newLeads = leads.filter((l) => l.status === "New").length;
  const lostLeads = leads.filter((l) => l.status === "Lost").length;

  const totalTasks = leads.reduce((sum, l) => sum + (l.tasks?.length || 0), 0);
  const completedTasks = leads.reduce((sum, l) => sum + (l.tasks?.filter(t => t.completed).length || 0), 0);
  const totalNotes = leads.reduce((sum, l) => sum + (l.notes?.length || 0), 0);

  const avgScore = leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + calculateLeadScore(l), 0) / leads.length) : 0;
  const conversionRate = totalLeads > 0 ? Math.round((wonDeals / totalLeads) * 100) : 0;

  // Prepare export data
  const leadsForExport = leads.map((lead) => ({
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    status: lead.status,
    score: calculateLeadScore(lead),
    tasks: lead.tasks?.length || 0,
    notes: lead.notes?.length || 0,
    activities: lead.activity?.length || 0,
    createdAt: formatDate(lead.createdAt),
  }));

  const reportsData = {
    summary: {
      name: "סיכום כללי",
      icon: "📊",
      metrics: [
        { label: "סה״כ לידים", value: totalLeads, color: "blue" },
        { label: "עסקאות סגורות", value: wonDeals, color: "green" },
        { label: "הצעות מחיר", value: quotedDeals, color: "blue" },
        { label: "ממתינות ליצירת קשר", value: newLeads, color: "yellow" },
        { label: "עסקאות שאבודו", value: lostLeads, color: "red" },
      ],
    },
    activity: {
      name: "פעילויות",
      icon: "📋",
      metrics: [
        { label: "סה״כ משימות", value: totalTasks, color: "blue" },
        { label: "משימות שהושלמו", value: completedTasks, color: "green" },
        { label: "משימות פתוחות", value: totalTasks - completedTasks, color: "yellow" },
        { label: "סה״כ הערות", value: totalNotes, color: "purple" },
      ],
    },
    quality: {
      name: "איכות לידים",
      icon: "⭐",
      metrics: [
        { label: "ניקוד ממוצע", value: avgScore, color: "blue" },
        { label: "שיעור המרה", value: conversionRate + "%", color: "green" },
        { label: "לידים איכותיים (70+)", value: leads.filter((l) => calculateLeadScore(l) >= 70).length, color: "purple" },
      ],
    },
  };

  const currentReport = reportsData[selectedReport];

  return (
    <div className="p-6 space-y-8" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">📈 Advanced Reports Pro</h1>
        <p className="text-gray-500 mt-2">דוחות מפורטים, אנליטיקה מתקדמת וייצוא נתונים</p>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-bold mb-4">בחר דוח</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(reportsData).map(([key, report]) => (
            <button
              key={key}
              onClick={() => setSelectedReport(key)}
              className={`p-4 rounded-lg border-2 transition ${
                selectedReport === key
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="text-2xl mb-2">{report.icon}</p>
              <p className="font-bold text-sm">{report.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Current Report Metrics */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{currentReport.icon} {currentReport.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentReport.metrics.map((metric, idx) => {
            const colorMap = {
              blue: "bg-blue-50",
              green: "bg-green-50",
              yellow: "bg-yellow-50",
              red: "bg-red-50",
              purple: "bg-purple-50",
            };

            const textColorMap = {
              blue: "text-blue-600",
              green: "text-green-600",
              yellow: "text-yellow-600",
              red: "text-red-600",
              purple: "text-purple-600",
            };

            return (
              <div key={idx} className={`${kpiCard} ${colorMap[metric.color]}`}>
                <p className="text-sm text-gray-600 mb-2">{metric.label}</p>
                <p className={`text-3xl font-bold ${textColorMap[metric.color]}`}>
                  {metric.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Data Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Download size={24} />
          ייצוא נתונים
        </h2>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">ייצא את כל לידיך בפורמטים שונים:</p>
          <div className="flex flex-wrap gap-3">
            <ExportButton format="json" data={leadsForExport} filename="smartcrm-leads" />
            <ExportButton format="csv" data={leadsForExport} filename="smartcrm-leads" />
            <ExportButton format="xlsx" data={leadsForExport} filename="smartcrm-leads" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            💡 <strong>טיפ:</strong> ייצא כל פעם שאתה רוצה לגבוב או לשתף את הנתונים שלך עם כלים אחרים
          </p>
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">📊 טבלת נתונים מפורטת</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="p-3 text-right text-gray-700">שם</th>
                <th className="p-3 text-right text-gray-700">טלפון</th>
                <th className="p-3 text-right text-gray-700">סטטוס</th>
                <th className="p-3 text-right text-gray-700">ניקוד</th>
                <th className="p-3 text-right text-gray-700">משימות</th>
                <th className="p-3 text-right text-gray-700">הערות</th>
                <th className="p-3 text-right text-gray-700">פעילויות</th>
                <th className="p-3 text-right text-gray-700">תאריך יצירה</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-500">
                    אין לידים להצגה
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const score = calculateLeadScore(lead);
                  const scoreColor = score >= 75 ? "bg-green-100 text-green-700" : score >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";

                  const statusColors = {
                    Won: "bg-green-100 text-green-700",
                    Quoted: "bg-blue-100 text-blue-700",
                    Contacted: "bg-purple-100 text-purple-700",
                    New: "bg-yellow-100 text-yellow-700",
                    Lost: "bg-red-100 text-red-700",
                  };

                  return (
                    <tr key={lead.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-semibold">{lead.name}</td>
                      <td className="p-3 text-gray-600">{lead.phone}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusColors[lead.status]}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${scoreColor}`}>
                          {score}/100
                        </span>
                      </td>
                      <td className="p-3 text-center">{lead.tasks?.length || 0}</td>
                      <td className="p-3 text-center">{lead.notes?.length || 0}</td>
                      <td className="p-3 text-center">{lead.activity?.length || 0}</td>
                      <td className="p-3 text-gray-600">{formatDate(lead.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <p className="text-lg font-bold text-blue-900 mb-2">💼 ערך עסקי</p>
          <p className="text-3xl font-bold text-blue-600">₪{wonDeals * 5000}</p>
          <p className="text-sm text-blue-700 mt-2">משעומות שסגורות ({wonDeals} עסקאות)</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <p className="text-lg font-bold text-purple-900 mb-2">⏰ משימות בטיפול</p>
          <p className="text-3xl font-bold text-purple-600">{totalTasks - completedTasks}</p>
          <p className="text-sm text-purple-700 mt-2">מתוך {totalTasks} משימות כוללות</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <p className="text-lg font-bold text-green-900 mb-2">✅ שיעור הצלחה</p>
          <p className="text-3xl font-bold text-green-600">{conversionRate}%</p>
          <p className="text-sm text-green-700 mt-2">{wonDeals} עסקאות מ-{totalLeads} לידים</p>
        </div>
      </div>
    </div>
  );
}
