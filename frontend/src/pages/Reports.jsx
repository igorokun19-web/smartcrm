import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import { useCrm, calculateLeadScore, formatDate } from "../context/CrmContext";
import { useLanguage } from "../context/LanguageContext";

const i18n = {
  he: {
    title: "דוחות",
    selectReport: "בחר דוח",
    reports: {
      summary: { name: "סיכום כללי", metrics: ["סה״כ לידים","עסקאות סגורות","הצעות מחיר","ממתינות","אבדו"] },
      activity: { name: "פעילויות", metrics: ["סה״כ משימות","הושלמו","פתוחות","הערות"] },
      quality: { name: "איכות לידים", metrics: ["ניקוד ממוצע","שיעור המרה","לידים איכותיים (70+)"] },
    },
    exportTitle: "ייצוא נתונים",
    exportDesc: "ייצא את כל לידיך בפורמטים שונים:",
    exportTip: "💡 טיפ: ייצא בכל פעם שאתה רוצה לגבות או לשתף את הנתונים",
    tableTitle: "📊 טבלת נתונים מפורטת",
    colName: "שם", colPhone: "טלפון", colStatus: "סטאטוס", colScore: "ניקוד", colTasks: "משימות", colNotes: "הערות", colActivities: "פעילויות", colDate: "תאריך יצירה",
    noLeads: "אין לידים להצגה",
  },
  en: {
    title: "Reports",
    selectReport: "Select Report",
    reports: {
      summary: { name: "Summary", metrics: ["Total Leads","Won Deals","Quoted","Pending Contact","Lost"] },
      activity: { name: "Activities", metrics: ["Total Tasks","Completed","Open","Notes"] },
      quality: { name: "Lead Quality", metrics: ["Avg. Score","Conversion Rate","High Quality (70+)"] },
    },
    exportTitle: "Export Data",
    exportDesc: "Export all your leads in different formats:",
    exportTip: "💡 Tip: Export whenever you want to back up or share your data with other tools",
    tableTitle: "📊 Detailed Data Table",
    colName: "Name", colPhone: "Phone", colStatus: "Status", colScore: "Score", colTasks: "Tasks", colNotes: "Notes", colActivities: "Activities", colDate: "Created",
    noLeads: "No leads to display",
  },
  ru: {
    title: "Отчёты",
    selectReport: "Выбрать отчёт",
    reports: {
      summary: { name: "Общая сводка", metrics: ["Всего лидов","Закрытых сделок","Предложений","Ожидают связи","Потерян"] },
      activity: { name: "Активность", metrics: ["Всего задач","Выполнено","Открыты","Заметки"] },
      quality: { name: "Качество лидов", metrics: ["Средний балл","Конверсия","Высокое качество (70+)"] },
    },
    exportTitle: "Экспорт данных",
    exportDesc: "Экспортируйте все ваши лиды в разных форматах:",
    exportTip: "💡 Совет: экспортируйте данные для резервного копирования",
    tableTitle: "📊 Детальная таблица",
    colName: "Имя", colPhone: "Телефон", colStatus: "Статус", colScore: "Балл", colTasks: "Задачи", colNotes: "Заметки", colActivities: "Активность", colDate: "Создан",
    noLeads: "Нет лидов для отображения",
  },
};

const kpiCard = "rounded-xl border p-4 bg-white shadow-sm";

function SmartInsights({ leads }) {
  const insights = useMemo(() => {
    const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    const services = JSON.parse(localStorage.getItem("services") || "[]");
    const total = leads.length;
    const won = leads.filter((l) => l.status === "Won").length;
    const quoted = leads.filter((l) => l.status === "Quoted").length;
    const allTasks = leads.flatMap((l) => l.tasks || []);
    const completedTasks = allTasks.filter((t) => t.completed).length;
    const noActionLeads = leads.filter(
      (l) => l.status !== "Won" && l.status !== "Lost" &&
        !(l.tasks || []).some((t) => !t.completed)
    ).length;
    const paidRevenue = invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
    const unpaidRevenue = invoices
      .filter((i) => i.status !== "paid")
      .reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);

    // Most profitable service by basePrice
    const topService = services.sort(
      (a, b) => parseFloat(b.basePrice || 0) - parseFloat(a.basePrice || 0)
    )[0];

    // Best lead score
    const bestLead = leads.reduce(
      (best, l) => (calculateLeadScore(l) > calculateLeadScore(best) ? l : best),
      leads[0]
    );

    const items = [];

    if (total > 0) {
      const pct = Math.round((won / total) * 100);
      items.push({ icon: pct >= 30 ? "✅" : "⚡", text: `${pct}% מהלידים נסגרו בהצלחה (${won} מתוך ${total})`, color: pct >= 30 ? "text-green-700" : "text-amber-700" });
    }
    if (quoted > 0) {
      items.push({ icon: "📋", text: `${quoted} הצעות מחיר פתוחות — פוטנציאל ₪${(quoted * 2000).toLocaleString()} לסגירה`, color: "text-blue-700" });
    }
    if (noActionLeads > 0) {
      items.push({ icon: "⚠️", text: `${noActionLeads} לידים ללא פעולה הבאה — דורשים טיפול`, color: "text-red-700" });
    }
    if (allTasks.length > 0) {
      const pct = Math.round((completedTasks / allTasks.length) * 100);
      items.push({ icon: "📋", text: `${pct}% מהמשימות הושלמו (${completedTasks} מתוך ${allTasks.length})`, color: "text-slate-700" });
    }
    if (paidRevenue > 0) {
      items.push({ icon: "✅", text: `הכנסות שהתקבלו: ₪${paidRevenue.toLocaleString()}`, color: "text-green-700" });
    }
    if (unpaidRevenue > 0) {
      items.push({ icon: "💸", text: `חשבוניות פתוחות: ₪${unpaidRevenue.toLocaleString()} ממתינים לגבייה`, color: "text-orange-700" });
    }
    if (topService) {
      items.push({ icon: "📈", text: `השירות היקר ביותר: ${topService.name} (₪${topService.basePrice})`, color: "text-purple-700" });
    }
    if (bestLead) {
      items.push({ icon: "⭐", text: `הליד בעל הניקוד הגבוה ביותר: ${bestLead.name} (${calculateLeadScore(bestLead)}/100)`, color: "text-indigo-700" });
    }

    return items;
  }, [leads]);

  if (insights.length === 0) return null;

  return (
    <div className="rounded-xl border border-indigo-100 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 bg-indigo-50 border-b border-indigo-100">
        <p className="text-sm font-bold text-indigo-700">💡 תובנות חכמות</p>
      </div>
      <ul className="divide-y divide-neutral-50">
        {insights.map((item, i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-3">
            <span className="text-lg shrink-0">{item.icon}</span>
            <span className={`text-sm font-medium ${item.color}`}>{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
  const { language } = useLanguage();
  const s = i18n[language] || i18n.he;
  const isRtl = language === "he";
  const [selectedReport, setSelectedReport] = useState("summary");

  // Calculate metrics
  const totalLeads = leads.length;
  const wonDeals = leads.filter((l) => l.status === "Won").length;
  const quotedDeals = leads.filter((l) => l.status === "Quoted").length;
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
      name: s.reports.summary.name,
      icon: "📊",
      metrics: [
        { label: s.reports.summary.metrics[0], value: totalLeads, color: "blue" },
        { label: s.reports.summary.metrics[1], value: wonDeals, color: "green" },
        { label: s.reports.summary.metrics[2], value: quotedDeals, color: "blue" },
        { label: s.reports.summary.metrics[3], value: newLeads, color: "yellow" },
        { label: s.reports.summary.metrics[4], value: lostLeads, color: "red" },
      ],
    },
    activity: {
      name: s.reports.activity.name,
      icon: "📋",
      metrics: [
        { label: s.reports.activity.metrics[0], value: totalTasks, color: "blue" },
        { label: s.reports.activity.metrics[1], value: completedTasks, color: "green" },
        { label: s.reports.activity.metrics[2], value: totalTasks - completedTasks, color: "yellow" },
        { label: s.reports.activity.metrics[3], value: totalNotes, color: "purple" },
      ],
    },
    quality: {
      name: s.reports.quality.name,
      icon: "⭐",
      metrics: [
        { label: s.reports.quality.metrics[0], value: avgScore, color: "blue" },
        { label: s.reports.quality.metrics[1], value: conversionRate + "%", color: "green" },
        { label: s.reports.quality.metrics[2], value: leads.filter((l) => calculateLeadScore(l) >= 70).length, color: "purple" },
      ],
    },
  };

  const currentReport = reportsData[selectedReport];

  return (
    <div className="p-6 space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{s.title}</h1>
      </div>

      {/* Smart text insights */}
      <SmartInsights leads={leads} />

      {/* Report Type Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-bold mb-4">{s.selectReport}</h2>
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
          {s.exportTitle}
        </h2>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">{s.exportDesc}</p>
          <div className="flex flex-wrap gap-3">
            <ExportButton format="json" data={leadsForExport} filename="myservicescrm-leads" />
            <ExportButton format="csv" data={leadsForExport} filename="myservicescrm-leads" />
            <ExportButton format="xlsx" data={leadsForExport} filename="myservicescrm-leads" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            {s.exportTip}
          </p>
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">{s.tableTitle}</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="p-3 text-right text-gray-700">{s.colName}</th>
                <th className="p-3 text-right text-gray-700">{s.colPhone}</th>
                <th className="p-3 text-right text-gray-700">{s.colStatus}</th>
                <th className="p-3 text-right text-gray-700">{s.colScore}</th>
                <th className="p-3 text-right text-gray-700">{s.colTasks}</th>
                <th className="p-3 text-right text-gray-700">{s.colNotes}</th>
                <th className="p-3 text-right text-gray-700">{s.colActivities}</th>
                <th className="p-3 text-right text-gray-700">{s.colDate}</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-gray-500">
                      {s.noLeads}
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
