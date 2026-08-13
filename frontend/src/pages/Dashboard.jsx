import { useCrm } from "../context/CrmContext";
import { useTranslation } from "../hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import AiInsights from "../components/AiInsights";
import { Card, Badge, EmptyState } from "../components/UI";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, CheckCircle, AlertCircle, PlusCircle, ArrowLeft, Calendar, FileText } from "lucide-react";

function WelcomeBanner({ onAddLead }) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1">ברוך הבא! 👋 התחל עכשיו בשלושה צעדים</h2>
          <div className="flex flex-col sm:flex-row gap-3 mt-3 text-sm text-indigo-100">
            <span className="flex items-center gap-1"><span className="bg-white/20 rounded-full px-2 py-0.5 font-bold text-white">1</span> הוסף ליד ראשון</span>
            <span className="hidden sm:block text-indigo-300">→</span>
            <span className="flex items-center gap-1"><span className="bg-white/20 rounded-full px-2 py-0.5 font-bold text-white">2</span> עקוב אחרי הסטטוס</span>
            <span className="hidden sm:block text-indigo-300">→</span>
            <span className="flex items-center gap-1"><span className="bg-white/20 rounded-full px-2 py-0.5 font-bold text-white">3</span> ראה את הגרף עולה</span>
          </div>
        </div>
        <button
          onClick={onAddLead}
          className="flex items-center gap-2 bg-white text-indigo-700 font-bold px-5 py-3 rounded-xl shadow hover:bg-indigo-50 transition whitespace-nowrap"
        >
          <PlusCircle size={18} />
          הוסף ליד ראשון
          <ArrowLeft size={16} />
        </button>
      </div>
    </div>
  );
}

import { colors } from "../styles/theme";

function FocusPanel({ items, onNavigate }) {
  const active = items.filter((i) => i.count > 0);
  if (active.length === 0) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 flex items-center gap-3">
        <CheckCircle size={18} className="text-green-600 shrink-0" />
        <p className="text-sm font-semibold text-green-800">הכל נקי — אין פעולות ממתינות</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-amber-200 bg-white overflow-hidden shadow-sm">
      <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200">
        <p className="text-sm font-bold text-amber-700">⚡ מה צריך לעשות עכשיו?</p>
      </div>
      <div className="divide-y divide-neutral-100">
        {active.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.path)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-50 transition text-right"
          >
            <div className="flex items-center gap-2.5">
              <item.Icon size={15} className={item.iconColor} />
              <span className="text-sm text-neutral-800">{item.label}</span>
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.badgeClass}`}>
              {item.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, color }) {
  return (
    <Card hover className="relative overflow-hidden">
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <p className="text-neutral-600 text-sm font-medium">{label}</p>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <p className="text-3xl font-bold text-neutral-900">{value}</p>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { leads } = useCrm();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Calculate KPIs
  const totalLeads = leads.length;
  const today = new Date().toISOString().split("T")[0];
  const allTasks = leads.flatMap((lead) => lead.tasks || []);

  const closedDeals = leads.filter((l) => l.status === "Won").length;
  const quotedDeals = leads.filter((l) => l.status === "Quoted").length;
  const newLeads = leads.filter((l) => l.status === "New").length;
  const lostDeals = leads.filter((l) => l.status === "Lost").length;
  const completedTasks = allTasks.filter((t) => t.completed).length;
  const overdueTasks = allTasks.filter(
    (t) => !t.completed && t.dueDate && t.dueDate < today
  ).length;
  const todayTasks = allTasks.filter(
    (t) => !t.completed && t.dueDate === today
  ).length;
  const unpaidInvoices = JSON.parse(localStorage.getItem("invoices") || "[]").filter(
    (i) => i.status !== "paid"
  ).length;

  const focusItems = [
    { key: "newLeads",    label: "לידים חדשים",              count: newLeads,        path: "/leads",    Icon: Users,       iconColor: "text-blue-500",   badgeClass: "bg-blue-100 text-blue-700" },
    { key: "todayTasks",  label: "משימות להיום",              count: todayTasks,      path: "/tasks",    Icon: Calendar,    iconColor: "text-purple-500", badgeClass: "bg-purple-100 text-purple-700" },
    { key: "overdue",     label: "משימות באיחור",             count: overdueTasks,    path: "/tasks",    Icon: AlertCircle, iconColor: "text-red-500",    badgeClass: "bg-red-100 text-red-700" },
    { key: "quotes",      label: "הצעות מחיר שממתינות",      count: quotedDeals,     path: "/leads",    Icon: TrendingUp,  iconColor: "text-yellow-600", badgeClass: "bg-yellow-100 text-yellow-700" },
    { key: "invoices",    label: "חשבוניות שלא שולמו",       count: unpaidInvoices,  path: "/invoices", Icon: FileText,    iconColor: "text-orange-500", badgeClass: "bg-orange-100 text-orange-700" },
  ];

  const closeRate = totalLeads > 0 ? Math.round((closedDeals / totalLeads) * 100) : 0;

  // Lead creation trend (last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0];
  }).reverse();

  const trendData = last7Days.map((date) => {
    const count = leads.filter((l) => l.createdAt?.split("T")[0] === date).length;
    return {
      date: new Date(date).toLocaleDateString("he-IL", { month: "short", day: "numeric" }),
      leads: count,
    };
  });

  // Status distribution
  const statusData = [
    { name: t("leads.new"), value: newLeads, color: colors.leadStatus.New },
    { name: t("leads.won"), value: closedDeals, color: colors.leadStatus.Won },
    { name: t("leads.quoted"), value: quotedDeals, color: colors.leadStatus.Quoted },
    { name: t("leads.lost"), value: lostDeals, color: colors.leadStatus.Lost },
  ].filter((s) => s.value > 0);

  // Task completion rate
  const taskCompletionRate = allTasks.length > 0 
    ? Math.round((completedTasks / allTasks.length) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome banner for new users */}
      {leads.length === 0 && (
        <WelcomeBanner onAddLead={() => navigate("/leads")} />
      )}

      {/* Focus panel — action items only */}
      {leads.length > 0 && (
        <FocusPanel items={focusItems} onNavigate={navigate} />
      )}

      {/* AI Insights */}
      <AiInsights leads={leads} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <KPICard icon={Users} label={t("dashboard.totalLeads")} value={totalLeads} color="text-blue-600" />
        <KPICard icon={CheckCircle} label={t("dashboard.closedDeals")} value={closedDeals} color="text-green-600" />
        <KPICard icon={TrendingUp} label={t("dashboard.quotes")} value={quotedDeals} color="text-yellow-600" />
        <KPICard icon={AlertCircle} label={t("dashboard.overdue")} value={overdueTasks} color="text-red-600" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-6">
        {/* Pipeline Trend Chart */}
        <Card>
          <h2 className="text-lg font-bold text-neutral-900 mb-6">
            📈 {t("dashboard.leadTrend")}
          </h2>
          {trendData.some((d) => d.leads > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke={colors.primary[500]}
                  strokeWidth={2}
                  dot={{ fill: colors.primary[600] }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title={t("dashboard.noData")} description={t("dashboard.noLeadsYet")} />
          )}
        </Card>

        {/* Status Distribution */}
        <Card>
          <h2 className="text-lg font-bold text-neutral-900 mb-6">
            🎯 {t("dashboard.statusDistribution")}
          </h2>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState title={t("dashboard.noData")} description={t("dashboard.noLeadsToDisplay")} />
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h2 className="text-lg font-bold text-neutral-900 mb-6">
          📋 {t("dashboard.recentLeads")}
        </h2>
        {leads.length === 0 ? (
          <EmptyState
            title={t("dashboard.noLeads")}
            description={t("dashboard.startAddingLeads")}
            action={
              <button
                onClick={() => navigate("/leads")}
                className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition"
              >
                <PlusCircle size={16} />
                הוסף ליד ראשון
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {leads.slice(0, 5).map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition"
              >
                <div>
                  <p className="font-semibold text-neutral-900">{lead.name}</p>
                  <p className="text-sm text-neutral-500">{lead.phone}</p>
                </div>
                <Badge variant="primary">{lead.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
