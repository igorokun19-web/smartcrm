import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCrm } from "../context/CrmContext";
import { useAuth } from "../context/AuthContext";
import { AlertCircle, CheckSquare, FileText, Users, ArrowLeft, TrendingUp } from "lucide-react";

// ─── Greeting ────────────────────────────────────────────────────────────────
function getGreeting(name) {
  const h = new Date().getHours();
  const n = name ? `, ${name.split(" ")[0]}` : "";
  if (h < 12) return `בוקר טוב${n} ☀️`;
  if (h < 17) return `צהריים טובים${n} 🌤`;
  return `ערב טוב${n} 🌙`;
}

// ─── Business Health Score ────────────────────────────────────────────────────
function useHealthScore(leads, invoices) {
  return useMemo(() => {
    if (!leads.length) return { score: 0, items: [], recommendation: "הוסף ליד ראשון כדי להתחיל" };

    const allTasks = leads.flatMap((l) => l.tasks || []);
    const today = new Date().toISOString().split("T")[0];

    // Task completion rate (30 pts)
    const taskDone = allTasks.filter((t) => t.completed).length;
    const taskTotal = allTasks.length;
    const taskScore = taskTotal > 0 ? Math.round((taskDone / taskTotal) * 30) : 25;

    // Lead response rate — leads that are NOT "New with no activity" (25 pts)
    const responded = leads.filter(
      (l) => l.status !== "New" || (l.activity || []).length > 1 || (l.tasks || []).length > 0
    ).length;
    const responseScore = Math.round((responded / leads.length) * 25);

    // Quote conversion rate (20 pts)
    const quoted = leads.filter((l) => l.status === "Quoted" || l.status === "Won").length;
    const conversionScore = leads.length > 0 ? Math.round((quoted / leads.length) * 20) : 15;

    // Invoice payment rate (15 pts)
    const paid = invoices.filter((i) => i.status === "paid").length;
    const invoiceScore = invoices.length > 0 ? Math.round((paid / invoices.length) * 15) : 15;

    // Recency bonus (10 pts) — any activity in last 7 days
    const recentActive = leads.some((l) => {
      const last = [...(l.activity || [])].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      )[0];
      if (!last) return false;
      return (Date.now() - new Date(last.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;
    });
    const recencyScore = recentActive ? 10 : 3;

    const score = taskScore + responseScore + conversionScore + invoiceScore + recencyScore;

    // Breakdown items
    const items = [];
    const overdueCount = allTasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today).length;
    const noResponseCount = leads.filter((l) => l.status === "New" && (l.activity || []).length <= 1).length;
    const unpaidCount = invoices.filter((i) => i.status !== "paid").length;
    const staleQuotes = leads.filter((l) => {
      if (l.status !== "Quoted") return false;
      return (Date.now() - new Date(l.createdAt).getTime()) > 7 * 24 * 60 * 60 * 1000;
    }).length;

    if (taskDone === taskTotal && taskTotal > 0) items.push({ ok: true,  text: `${taskDone} משימות הושלמו ✓` });
    if (overdueCount === 0)                      items.push({ ok: true,  text: "אין משימות באיחור ✓" });
    if (noResponseCount > 0)                     items.push({ ok: false, text: `${noResponseCount} לידים ללא מענה` });
    if (staleQuotes > 0)                         items.push({ ok: false, text: `${staleQuotes} הצעות מחיר תקועות` });
    if (unpaidCount > 0)                         items.push({ ok: false, text: `${unpaidCount} חשבוניות שלא שולמו` });
    if (overdueCount > 0)                        items.push({ ok: false, text: `${overdueCount} משימות באיחור` });

    // Recommendation
    let recommendation = "המשיכו כך! העסק מנוהל מצוין 🎉";
    if (noResponseCount > 0)  recommendation = `טפל ב-${noResponseCount} לידים פתוחים כדי להעלות את הציון`;
    else if (overdueCount > 0) recommendation = `סגור ${overdueCount} משימות באיחור כדי לשפר את הציון`;
    else if (unpaidCount > 0)  recommendation = `גבה ${unpaidCount} חשבוניות פתוחות כדי לשפר ביצועים`;

    return { score: Math.min(score, 100), items, recommendation };
  }, [leads, invoices]);
}

// ─── Action Card ─────────────────────────────────────────────────────────────
function ActionRow({ icon, label, count, urgency, onClick }) {
  if (count === 0) return null;
  const styles = {
    red:    "bg-red-50 border-red-200 text-red-700",
    yellow: "bg-amber-50 border-amber-200 text-amber-700",
    green:  "bg-green-50 border-green-200 text-green-700",
    blue:   "bg-indigo-50 border-indigo-200 text-indigo-700",
  };
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border font-medium transition hover:opacity-80 text-right ${styles[urgency]}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold">{count}</span>
        <ArrowLeft size={16} className="opacity-50" />
      </div>
    </button>
  );
}

// ─── Health Score Ring ────────────────────────────────────────────────────────
function HealthRing({ score }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const emoji = score >= 80 ? "🟢" : score >= 60 ? "🟡" : "🔴";
  const r = 36, c = 44, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={88} height={88} className="-rotate-90">
        <circle cx={c} cy={c} r={r} fill="none" stroke="#e5e7eb" strokeWidth={8} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute">
        <p className="text-2xl font-bold text-neutral-800" style={{ marginTop: -54, textAlign: "center", width: 88 }}>
          {score}
        </p>
      </div>
      <p className="text-xs text-slate-500">{emoji} בריאות העסק</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MyDay() {
  const { leads } = useCrm();
  const { user } = useAuth();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
  const { score, items, recommendation } = useHealthScore(leads, invoices);

  const allTasks = leads.flatMap((l) =>
    (l.tasks || []).map((t) => ({ ...t, leadId: l.id, leadName: l.name }))
  );

  const todayTasks  = allTasks.filter((t) => !t.completed && t.dueDate === today).length;
  const overdueTasks = allTasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today).length;
  const noResponse   = leads.filter((l) => l.status === "New" && (l.activity || []).length <= 1 && !(l.tasks || []).some((t) => !t.completed)).length;
  const staleQuotes  = leads.filter((l) => {
    if (l.status !== "Quoted") return false;
    return (Date.now() - new Date(l.createdAt).getTime()) > 5 * 24 * 60 * 60 * 1000;
  }).length;
  const unpaidInvoices = invoices.filter((i) => i.status !== "paid").length;

  const totalActions = overdueTasks + noResponse + staleQuotes + unpaidInvoices + todayTasks;
  const dateStr = new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <p className="text-sm text-slate-400">{dateStr}</p>
        <h1 className="text-2xl font-bold text-neutral-900 mt-1">{getGreeting(user?.name)}</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {totalActions === 0
            ? "הכל נקי — אין פעולות ממתינות 🎉"
            : `יש ${totalActions} פעולות שדורשות אותך היום`}
        </p>
      </div>

      {/* Health Score */}
      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            <HealthRing score={score} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-neutral-800 mb-1">בריאות העסק</h2>
            <p className="text-sm text-slate-500 mb-3 italic">"{recommendation}"</p>
            <div className="space-y-1">
              {items.map((item, i) => (
                <p key={i} className={`text-xs flex items-center gap-1.5 ${item.ok ? "text-green-600" : "text-red-600"}`}>
                  <span>{item.ok ? "✅" : "⚠️"}</span>
                  {item.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Items */}
      {totalActions > 0 && (
        <div className="space-y-2">
          <h2 className="font-bold text-sm text-slate-600 px-1">דורש טיפול</h2>
          <ActionRow icon="🔴" label="משימות באיחור"         count={overdueTasks}    urgency="red"    onClick={() => navigate("/tasks")} />
          <ActionRow icon="👥" label="לידים ללא מענה"        count={noResponse}      urgency="red"    onClick={() => navigate("/leads")} />
          <ActionRow icon="📄" label="חשבוניות שלא שולמו"   count={unpaidInvoices}  urgency="yellow" onClick={() => navigate("/invoices")} />
          <ActionRow icon="📋" label="הצעות מחיר תקועות"    count={staleQuotes}     urgency="yellow" onClick={() => navigate("/leads")} />
          <ActionRow icon="✅" label="משימות להיום"           count={todayTasks}      urgency="blue"   onClick={() => navigate("/tasks")} />
        </div>
      )}

      {totalActions === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-2">
          <p className="text-3xl">🎉</p>
          <p className="font-bold text-green-800">מעולה! הכל מטופל</p>
          <p className="text-sm text-green-600">אין פעולות ממתינות להיום</p>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "הוסף ליד",     path: "/leads",    icon: "👥" },
          { label: "מרכז פעולות", path: "/command",  icon: "⚡" },
          { label: "דשבורד",       path: "/dashboard", icon: "📊" },
        ].map((l) => (
          <button
            key={l.path}
            onClick={() => navigate(l.path)}
            className="bg-white border rounded-xl py-3 px-2 flex flex-col items-center gap-1 hover:bg-slate-50 transition text-sm font-medium text-slate-700"
          >
            <span className="text-xl">{l.icon}</span>
            <span className="text-xs">{l.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
