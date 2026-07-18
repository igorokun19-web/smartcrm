import { useState } from "react";
import { TrendingUp, Users, Award, AlertCircle, BarChart3, Heart, Calendar, Activity, Zap, DollarSign, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { useCrm, formatDate } from "../context/CrmContext";

const kpiCard = "rounded-xl border p-4 bg-white shadow-sm";
const badgeStyle = "inline-flex items-center gap-1 rounded-full text-xs font-semibold px-3 py-1";

// Customer segment determination
function getCustomerSegment(lead) {
  if (lead.status === "Won") return "VIP";
  if (lead.status === "Quoted" && lead.activity?.length > 3) return "Active";
  if ((lead.status === "New" || lead.status === "Contacted") && lead.activity?.length < 2) return "AtRisk";
  if (lead.createdAt && (Date.now() - new Date(lead.createdAt).getTime()) > 30 * 24 * 60 * 60 * 1000 && lead.status === "New") return "Inactive";
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

function CustomerCard({ customer, onExpand }) {
  const segment = getCustomerSegment(customer);
  const ltv = estimateLifetimeValue(customer);
  const daysSinceCreated = Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / (24 * 60 * 60 * 1000));

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

function CustomerDetailModal({ customer, onClose }) {
  if (!customer) return null;

  const segment = getCustomerSegment(customer);
  const ltv = estimateLifetimeValue(customer);
  const daysSinceCreated = Math.floor((Date.now() - new Date(customer.createdAt).getTime()) / (24 * 60 * 60 * 1000));

  const statusColors = {
    Won: "bg-green-500",
    Quoted: "bg-blue-500",
    Contacted: "bg-purple-500",
    New: "bg-yellow-500",
    Lost: "bg-red-500",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl my-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">{customer.name}</h2>
            <p className="text-gray-600">📞 {customer.phone}</p>
            {customer.email && <p className="text-gray-600">✉️ {customer.email}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-gray-500">LTV משוער</p>
            <p className="text-2xl font-bold">₪{ltv.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">סטטוס</p>
            <span className={`${badgeStyle} ${statusColors[customer.status]} text-white mt-1`}>
              {customer.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">ימים כלקוח</p>
            <p className="text-2xl font-bold">{daysSinceCreated}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">אינטראקציות</p>
            <p className="text-2xl font-bold">{(customer.tasks?.length || 0) + (customer.notes?.length || 0) + (customer.activity?.length || 0)}</p>
          </div>
        </div>

        {/* Tasks Section */}
        {customer.tasks && customer.tasks.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">📋 משימות ({customer.tasks.length})</h3>
            <div className="space-y-2">
              {customer.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-lg border-l-4 ${
                    task.completed
                      ? "bg-green-50 border-green-500"
                      : "bg-yellow-50 border-yellow-500"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-sm text-gray-600 mt-1">
                          📅 {formatDate(task.dueDate)}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        task.completed
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {task.completed ? "הושלם" : "פתוח"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        {customer.notes && customer.notes.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">📝 הערות ({customer.notes.length})</h3>
            <div className="space-y-2">
              {customer.notes.map((note, idx) => (
                <div key={idx} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">{note}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Section */}
        {customer.activity && customer.activity.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">📊 פעילות ({customer.activity.length})</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {customer.activity.map((act, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                  <span className="text-gray-400 text-xs mt-1">•</span>
                  <div>
                    <p className="text-gray-700">{act.action}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(act.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Customers() {
  const { leads } = useCrm();
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

    const segment = getCustomerSegment(customer);
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
  const vipCount = customers.filter((c) => getCustomerSegment(c) === "VIP").length;
  const activeCount = customers.filter((c) => getCustomerSegment(c) === "Active").length;
  const atRiskCount = customers.filter((c) => getCustomerSegment(c) === "AtRisk").length;
  const inactiveCount = customers.filter((c) => getCustomerSegment(c) === "Inactive").length;

  const totalLTV = customers.reduce((sum, c) => sum + estimateLifetimeValue(c), 0);
  const avgLTV = totalCustomers > 0 ? Math.round(totalLTV / totalCustomers) : 0;

  const wonCount = customers.filter((c) => c.status === "Won").length;
  const conversionRate = totalCustomers > 0 ? Math.round((wonCount / totalCustomers) * 100) : 0;

  const totalInteractions = customers.reduce(
    (sum, c) => sum + (c.tasks?.length || 0) + (c.notes?.length || 0) + (c.activity?.length || 0),
    0
  );
  const avgInteractions = totalCustomers > 0 ? Math.round(totalInteractions / totalCustomers) : 0;

  return (
    <div className="p-6 space-y-8" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">🤝 Customers Pro v2</h1>
        <p className="text-gray-500 mt-2">ניהול לקוחות מתקדם עם אנליטיקה חכמה</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${kpiCard} bg-blue-50`}>
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-blue-600" />
            <p className="text-sm text-gray-600">סה״כ לקוחות</p>
          </div>
          <p className="text-3xl font-bold">{totalCustomers}</p>
          <p className="text-xs text-gray-500 mt-2">בכל המערכת</p>
        </div>

        <div className={`${kpiCard} bg-purple-50`}>
          <div className="flex items-center gap-2 mb-2">
            <Heart size={18} className="text-purple-600" />
            <p className="text-sm text-gray-600">VIP לקוחות</p>
          </div>
          <p className="text-3xl font-bold text-purple-600">{vipCount}</p>
          <p className="text-xs text-gray-500 mt-2">{totalCustomers > 0 ? Math.round((vipCount / totalCustomers) * 100) : 0}% מהלקוחות</p>
        </div>

        <div className={`${kpiCard} bg-green-50`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-green-600" />
            <p className="text-sm text-gray-600">LTV ממוצע</p>
          </div>
          <p className="text-3xl font-bold">₪{avgLTV.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">סה״כ ₪{totalLTV.toLocaleString()}</p>
        </div>

        <div className={`${kpiCard} bg-orange-50`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-orange-600" />
            <p className="text-sm text-gray-600">שיעור המרה</p>
          </div>
          <p className="text-3xl font-bold text-orange-600">{conversionRate}%</p>
          <p className="text-xs text-gray-500 mt-2">{wonCount} לקוחות מומרים</p>
        </div>
      </div>

      {/* Customer Segments */}
      <div>
        <h2 className="text-2xl font-bold mb-4">📊 פילוח לקוחות</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <p className="text-2xl mb-2">👑</p>
            <p className="font-bold text-lg text-purple-900">{vipCount}</p>
            <p className="text-sm text-purple-700">VIP לקוחות</p>
            <p className="text-xs text-purple-600 mt-2">הלקוחות הכי ערכיים</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <p className="text-2xl mb-2">⚡</p>
            <p className="font-bold text-lg text-green-900">{activeCount}</p>
            <p className="text-sm text-green-700">לקוחות פעילים</p>
            <p className="text-xs text-green-600 mt-2">עם אינטראקציה קבועה</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <p className="text-2xl mb-2">⚠️</p>
            <p className="font-bold text-lg text-orange-900">{atRiskCount}</p>
            <p className="text-sm text-orange-700">לקוחות בסיכון</p>
            <p className="text-xs text-orange-600 mt-2">צריכים עניין מחדש</p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
            <p className="text-2xl mb-2">😴</p>
            <p className="font-bold text-lg text-gray-900">{inactiveCount}</p>
            <p className="text-sm text-gray-700">לקוחות לא פעילים</p>
            <p className="text-xs text-gray-600 mt-2">לא היה קשר ימים</p>
          </div>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="חיפוש בשם או טלפון..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          />

          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">כל הפילוחים</option>
            <option value="VIP">VIP בלבד</option>
            <option value="Active">פעילים בלבד</option>
            <option value="AtRisk">בסיכון בלבד</option>
            <option value="Inactive">לא פעילים בלבד</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">כל הסטטוסים</option>
            <option value="New">חדש</option>
            <option value="Contacted">נוצר קשר</option>
            <option value="Quoted">הצעת מחיר</option>
            <option value="Won">נסגר בהצלחה</option>
            <option value="Lost">אבוד</option>
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
            />
          ))}
        </div>
      )}

      {/* Customer Detail Modal */}
      <CustomerDetailModal
        customer={expandedCustomer}
        onClose={() => setExpandedCustomer(null)}
      />
    </div>
  );
}