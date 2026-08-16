import { useState } from "react";
import { TrendingUp, Users, Heart, DollarSign, ChevronDown, MessageCircle } from "lucide-react";
import { useCrm, formatDate } from "../context/CrmContext";
import { useLanguage } from "../context/LanguageContext";

const i18n = {
  he: {
    title: "🤝 לקוחות",
    kpiTotal: "סה״כ לקוחות", kpiTotalSub: "בכל המערכת",
    kpiVip: "VIP לקוחות", kpiVipSub: (p) => `${p}% מהלקוחות`,
    kpiLtv: "LTV ממוצע", kpiLtvSub: (t) => `סה״כ ₪${t.toLocaleString()}`,
    kpiConversion: "שיעור המרה", kpiConversionSub: (n) => `${n} לקוחות מומרים`,
    searchPlaceholder: "חיפוש בשם או טלפון...",
    allSegments: "כל הפילוחים",
    allStatuses: "כל הסטאטוסים",
    segLabels: { VIP: "VIP בלבד", Active: "פעילים", AtRisk: "בסיכון", Inactive: "לא פעילים" },
    statLabels: { New: "חדש", Contacted: "נוצר קשר", Quoted: "הצעת מחיר", Won: "נסגר", Lost: "אבוד" },
    sortLtv: "לפי LTV", sortDate: "לפי תאריך", sortActivity: "לפי פעילות",
    noResults: "לא נמצאו לקוחות",
    ltvLabel: "LTV משוער", daysLabel: "ימים כלקוח",
    tasksLabel: "משימות", notesLabel: "הערות", activityLabel: "פעילויות",
    closeBtn: "סגור",
    revenueKpi: "הכנסות", daysKpi: "ימים", invoicesKpi: "חשבוניות",
    invoicesTitle: "💵 חשבוניות", openTasksTitle: "📋 משימות פתוחות",
    paidBadge: "שולמה", pendingBadge: "ממתינה",
    dateLocale: "he-IL",
  },
  en: {
    title: "🤝 Customers",
    kpiTotal: "Total Customers", kpiTotalSub: "In the system",
    kpiVip: "VIP Customers", kpiVipSub: (p) => `${p}% of customers`,
    kpiLtv: "Avg. LTV", kpiLtvSub: (t) => `Total ₪${t.toLocaleString()}`,
    kpiConversion: "Conversion Rate", kpiConversionSub: (n) => `${n} converted`,
    searchPlaceholder: "Search by name or phone...",
    allSegments: "All Segments",
    allStatuses: "All Statuses",
    segLabels: { VIP: "VIP only", Active: "Active only", AtRisk: "At Risk only", Inactive: "Inactive only" },
    statLabels: { New: "New", Contacted: "Contacted", Quoted: "Quoted", Won: "Won", Lost: "Lost" },
    sortLtv: "By LTV", sortDate: "By Date", sortActivity: "By Activity",
    noResults: "No customers found",
    ltvLabel: "Est. LTV", daysLabel: "Days as Client",
    tasksLabel: "Tasks", notesLabel: "Notes", activityLabel: "Activities",
    closeBtn: "Close",
    revenueKpi: "Revenue", daysKpi: "Days", invoicesKpi: "Invoices",
    invoicesTitle: "💵 Invoices", openTasksTitle: "📋 Open Tasks",
    paidBadge: "Paid", pendingBadge: "Pending",
    dateLocale: "en-US",
  },
  ru: {
    title: "🤝 Клиенты",
    kpiTotal: "Всего клиентов", kpiTotalSub: "В системе",
    kpiVip: "VIP клиенты", kpiVipSub: (p) => `${p}% клиентов`,
    kpiLtv: "Ср. LTV", kpiLtvSub: (t) => `Итого ₪${t.toLocaleString()}`,
    kpiConversion: "Конверсия", kpiConversionSub: (n) => `${n} конвертировано`,
    searchPlaceholder: "Поиск по имени или телефону...",
    allSegments: "Все сегменты",
    allStatuses: "Все статусы",
    segLabels: { VIP: "Только VIP", Active: "Активные", AtRisk: "Под риском", Inactive: "Неактивные" },
    statLabels: { New: "Новый", Contacted: "Обработан", Quoted: "Предложение", Won: "Победа", Lost: "Проигрыш" },
    sortLtv: "По LTV", sortDate: "По дате", sortActivity: "По активности",
    noResults: "Клиенты не найдены",
    ltvLabel: "Оцен. LTV", daysLabel: "Дней как кл.",
    tasksLabel: "Задачи", notesLabel: "Заметки", activityLabel: "Активность",
    closeBtn: "Закрыть",
    revenueKpi: "Доход", daysKpi: "Дней", invoicesKpi: "Счета",
    invoicesTitle: "💵 Счета", openTasksTitle: "📋 Открытые задачи",
    paidBadge: "Оплачен", pendingBadge: "Ожидает",
    dateLocale: "ru-RU",
  },
};

const kpiCard = "rounded-xl border p-4 bg-white shadow-sm";
const badgeStyle = "inline-flex items-center gap-1 rounded-full text-xs font-semibold px-3 py-1";

// Customer segment determination
function getCustomerSegment(lead, now) {
  if (lead.status === "Won") return "VIP";
  if (lead.status === "Quoted" && lead.activity?.length > 3) return "Active";
  if ((lead.status === "New" || lead.status === "Contacted") && lead.activity?.length < 2) return "AtRisk";
  if (lead.createdAt && (now - new Date(lead.createdAt).getTime()) > 30 * 24 * 60 * 60 * 1000 && lead.status === "New") return "Inactive";
  return "Active";
}

// Calculate customer lifetime value (estimated)
function estimateLifetimeValue(lead) {
  const baseValue = 1000;
  const statusMultiplier = {
    Won: 3,
    Quoted: 2,
    Contacted: 1.5,
    New: 1,
    Lost: 0,
  };
  const interactionBonus = (lead.tasks?.length || 0) * 200 + (lead.notes?.length || 0) * 100;
  return Math.round((baseValue * (statusMultiplier[lead.status] || 1)) + interactionBonus);
}

function CustomerCard({ customer, onExpand, now }) {
  const segment = getCustomerSegment(customer, now);
  const ltv = estimateLifetimeValue(customer);
  const daysSinceCreated = Math.floor((now - new Date(customer.createdAt).getTime()) / (24 * 60 * 60 * 1000));

  const segmentColors = {
    VIP: "bg-purple-100 text-purple-700",
    Active: "bg-green-100 text-green-700",
    AtRisk: "bg-orange-100 text-orange-700",
    Inactive: "bg-gray-100 text-gray-700",
  };

  const segmentIcons = {
    VIP: "👑",
    Active: "⚡",
    AtRisk: "⚠️",
    Inactive: "😴",
  };

  const statusColors = {
    Won: "bg-green-500",
    Quoted: "bg-blue-500",
    Contacted: "bg-purple-500",
    New: "bg-yellow-500",
    Lost: "bg-red-500",
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800">{customer.name}</h3>
          <p className="text-sm text-gray-500">{customer.phone}</p>
        </div>
        <button
          onClick={() => {
            const message = `שלום ${customer.name}! זהו הודעה מ-MyServices CRM`;
            const phone = customer.phone?.replace(/\D/g, "");
            if (phone) {
              window.open(`https://wa.me/972${phone.slice(-9)}?text=${encodeURIComponent(message)}`);
            } else {
              alert("אין מספר טלפון ללקוח");
            }
          }}
          className="text-green-600 hover:text-green-700"
          title="WhatsApp"
        >
          <MessageCircle size={20} />
        </button>
        <button
          onClick={() => onExpand(customer)}
          className="text-blue-600 hover:text-blue-700"
          title="הצג פרטים"
        >
          <ChevronDown size={20} />
        </button>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        <span className={`${badgeStyle} ${segmentColors[segment]}`}>
          {segmentIcons[segment]} {segment}
        </span>
        <span className={`${badgeStyle} ${statusColors[customer.status]} text-white`}>
          {customer.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-500">LTV משוער</p>
          <p className="font-bold text-lg">₪{ltv.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">ימים כלקוח</p>
          <p className="font-bold text-lg">{daysSinceCreated}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t text-sm">
        <div className="text-center">
          <p className="text-gray-500">משימות</p>
          <p className="font-bold">{customer.tasks?.length || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">הערות</p>
          <p className="font-bold">{customer.notes?.length || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">פעילויות</p>
          <p className="font-bold">{customer.activity?.length || 0}</p>
        </div>
      </div>
    </div>
  );
}

function CustomerDetailModal({ customer, onClose, now }) {
  if (!customer) return null;

  const invoices = JSON.parse(localStorage.getItem("invoices") || "[]")
    .filter((i) => i.id === customer.id || i.leadId === customer.id);
  const paidRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + parseFloat(i.amount || 0), 0);
  const daysSinceCreated = Math.floor((now - new Date(customer.createdAt).getTime()) / (24 * 60 * 60 * 1000));

  const timelineEvents = [
    ...(customer.activity || []).map((a) => ({
      date: a.createdAt,
      icon: a.type === "lead-created" ? "🌱" : a.type === "status-changed" ? "🔄" : a.type === "note-added" ? "📝" : "•",
      text: a.text,
    })),
    ...(customer.tasks || []).filter((t) => t.completed).map((t) => ({
      date: t.createdAt,
      icon: "✅",
      text: `הושלמה: ${t.title}`,
    })),
    ...invoices.map((i) => ({
      date: i.issueDate,
      icon: i.status === "paid" ? "💰" : "📄",
      text: `חשבונית ${i.number} — ₪${parseFloat(i.amount || 0).toFixed(0)} (${i.status === "paid" ? "שולמה" : "פתוחה"})`,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
            <div className="flex flex-wrap gap-3 mt-2">
              <a href={`tel:${customer.phone}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                📞 {customer.phone}
              </a>
              {customer.email && (
                <a href={`mailto:${customer.email}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                  ✉️ {customer.email}
                </a>
              )}
              <button
                onClick={() => {
                  const phone = customer.phone?.replace(/\D/g, "");
                  if (phone) window.open(`https://wa.me/972${phone.slice(-9)}`);
                }}
                className="flex items-center gap-1 text-sm text-green-600 hover:underline"
              >
                💬 WhatsApp
              </button>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl font-bold">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xs text-green-600">הכנסות</p>
              <p className="text-xl font-bold text-green-700">₪{paidRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs text-blue-600">ימים כלקוח</p>
              <p className="text-xl font-bold text-blue-700">{daysSinceCreated}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <p className="text-xs text-purple-600">חשבוניות</p>
              <p className="text-xl font-bold text-purple-700">{invoices.length}</p>
            </div>
          </div>

          {/* Invoices */}
          {invoices.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-800 mb-2">💵 חשבוניות</h3>
              <div className="space-y-1">
                {invoices.map((inv) => (
                  <div key={inv.id} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-lg text-sm">
                    <span className="text-gray-700">{inv.number} — ₪{parseFloat(inv.amount || 0).toFixed(0)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inv.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {inv.status === "paid" ? "שולמה" : "ממתינה"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Open Tasks */}
          {(customer.tasks || []).filter((t) => !t.completed).length > 0 && (
            <div>
              <h3 className="font-bold text-gray-800 mb-2">📋 משימות פתוחות</h3>
              <div className="space-y-1">
                {(customer.tasks || []).filter((t) => !t.completed).map((task) => (
                  <div key={task.id} className="flex justify-between items-center px-3 py-2 bg-yellow-50 rounded-lg text-sm">
                    <span>{task.title}</span>
                    {task.dueDate && <span className="text-xs text-gray-500">{task.dueDate}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {timelineEvents.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-800 mb-3">📅 Timeline</h3>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {timelineEvents.slice(0, 12).map((ev, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="shrink-0 text-base">{ev.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 truncate">{ev.text}</p>
                      {ev.date && <p className="text-xs text-gray-400">{new Date(ev.date).toLocaleDateString("he-IL")}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 pb-5">
          <button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-medium transition">
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const { leads } = useCrm();
  const { language } = useLanguage();
  const s = i18n[language] || i18n.he;
  const isRtl = language === "he";
  const [now] = useState(() => Date.now());
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("ltv");
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  // Use leads as customers
  const customers = leads;

  // Filter and search
  let filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone?.includes(search);

    const segment = getCustomerSegment(customer, now);
    const matchesSegment = segmentFilter === "all" || segment === segmentFilter;
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;

    return matchesSearch && matchesSegment && matchesStatus;
  });

  // Sort
  filteredCustomers = filteredCustomers.sort((a, b) => {
    if (sortBy === "ltv") {
      return estimateLifetimeValue(b) - estimateLifetimeValue(a);
    } else if (sortBy === "date") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === "activity") {
      const aActivity = (a.tasks?.length || 0) + (a.notes?.length || 0) + (a.activity?.length || 0);
      const bActivity = (b.tasks?.length || 0) + (b.notes?.length || 0) + (b.activity?.length || 0);
      return bActivity - aActivity;
    }
    return 0;
  });

  // Calculate metrics
  const totalCustomers = customers.length;
  const vipCount = customers.filter((c) => getCustomerSegment(c, now) === "VIP").length;
  const activeCount = customers.filter((c) => getCustomerSegment(c, now) === "Active").length;
  const atRiskCount = customers.filter((c) => getCustomerSegment(c, now) === "AtRisk").length;
  const inactiveCount = customers.filter((c) => getCustomerSegment(c, now) === "Inactive").length;

  const totalLTV = customers.reduce((sum, c) => sum + estimateLifetimeValue(c), 0);
  const avgLTV = totalCustomers > 0 ? Math.round(totalLTV / totalCustomers) : 0;

  const wonCount = customers.filter((c) => c.status === "Won").length;
  const conversionRate = totalCustomers > 0 ? Math.round((wonCount / totalCustomers) * 100) : 0;

  return (
    <div className="p-6 space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">{s.title}</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${kpiCard} bg-blue-50`}>
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-blue-600" />
            <p className="text-sm text-gray-600">{s.kpiTotal}</p>
          </div>
          <p className="text-3xl font-bold">{totalCustomers}</p>
          <p className="text-xs text-gray-500 mt-2">{s.kpiTotalSub}</p>
        </div>

        <div className={`${kpiCard} bg-purple-50`}>
          <div className="flex items-center gap-2 mb-2">
            <Heart size={18} className="text-purple-600" />
            <p className="text-sm text-gray-600">{s.kpiVip}</p>
          </div>
          <p className="text-3xl font-bold text-purple-600">{vipCount}</p>
          <p className="text-xs text-gray-500 mt-2">{s.kpiVipSub(totalCustomers > 0 ? Math.round((vipCount / totalCustomers) * 100) : 0)}</p>
        </div>

        <div className={`${kpiCard} bg-green-50`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-sm text-gray-600">{s.kpiLtv}</p>
          </div>
          <p className="text-3xl font-bold">₪{avgLTV.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">{s.kpiLtvSub(totalLTV)}</p>
        </div>

        <div className={`${kpiCard} bg-orange-50`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-orange-600" />
            <p className="text-sm text-gray-600">{s.kpiConversion}</p>
          </div>
          <p className="text-3xl font-bold text-orange-600">{conversionRate}%</p>
          <p className="text-xs text-gray-500 mt-2">{s.kpiConversionSub(wonCount)}</p>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder={s.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />

          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">{s.allSegments}</option>
            <option value="VIP">{s.segLabels.VIP}</option>
            <option value="Active">{s.segLabels.Active}</option>
            <option value="AtRisk">{s.segLabels.AtRisk}</option>
            <option value="Inactive">{s.segLabels.Inactive}</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">{s.allStatuses}</option>
            <option value="New">{s.statLabels.New}</option>
            <option value="Contacted">{s.statLabels.Contacted}</option>
            <option value="Quoted">{s.statLabels.Quoted}</option>
            <option value="Won">{s.statLabels.Won}</option>
            <option value="Lost">{s.statLabels.Lost}</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="ltv">מיין לפי LTV</option>
            <option value="date">מיין לפי תאריך</option>
            <option value="activity">מיין לפי פעילות</option>
          </select>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {filteredCustomers.length} לקוח מתוך {totalCustomers}
        </p>
      </div>

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <p className="text-gray-500 text-lg">אין לקוחות להצגה</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onExpand={setExpandedCustomer}
              now={now}
            />
          ))}
        </div>
      )}

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={expandedCustomer}
        onClose={() => setExpandedCustomer(null)}
        now={now}
      />
    </div>
  );
}