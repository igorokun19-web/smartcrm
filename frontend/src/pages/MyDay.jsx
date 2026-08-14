import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCrm, getLeadTemperature } from "../context/CrmContext";
import { useAuth } from "../context/AuthContext";
import { Plus, MessageCircle } from "lucide-react";

function greeting(user) {
  const h = new Date().getHours();
  const n = user?.name?.split(" ")[0] || "";
  if (h < 12) return `בוקר טוב${n ? `, ${n}` : ""} 👋`;
  if (h < 17) return `צהריים טובים${n ? `, ${n}` : ""} ☀️`;
  return `ערב טוב${n ? `, ${n}` : ""} 🌙`;
}

function StatPill({ emoji, label, count, urgency, onClick }) {
  const styles = {
    red:    "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100",
    orange: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100",
  };
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 px-2 py-3 rounded-xl border font-semibold transition flex-1 ${styles[urgency]}`}>
      <span className="text-xl">{emoji}</span>
      <span className="text-2xl font-bold leading-tight">{count}</span>
      <span className="text-[10px] font-medium opacity-80 truncate w-full text-center">{label}</span>
    </button>
  );
}

function Section({ title, children, empty, emptyText }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b bg-slate-50">
        <h2 className="font-bold text-sm text-slate-700">{title}</h2>
      </div>
      {empty
        ? <div className="px-4 py-5 text-center text-sm text-slate-400">{emptyText}</div>
        : <div className="divide-y">{children}</div>}
    </div>
  );
}

export default function MyDay() {
  const { leads } = useCrm();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fabOpen, setFabOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");

  const allTasks = leads.flatMap((l) =>
    (l.tasks || []).map((t) => ({ ...t, leadId: l.id, leadName: l.name }))
  );

  // ── Stat counts ──────────────────────────────────────────────────────────
  const overdueCount    = allTasks.filter((t) => !t.completed && t.dueDate && t.dueDate < today).length;
  const noResponseCount = leads.filter((l) => l.status === "New" && (l.activity || []).length <= 1).length;
  const unpaidCount     = invoices.filter((i) => i.status !== "paid").length;
  const staleQuoteCount = leads.filter((l) => {
    if (l.status !== "Quoted") return false;
    return (Date.now() - new Date(l.createdAt).getTime()) > 5 * 24 * 60 * 60 * 1000;
  }).length;

  // ── Today's tasks ─────────────────────────────────────────────────────────
  const todayTasks = allTasks.filter((t) => !t.completed && t.dueDate === today);

  // ── Hot leads ─────────────────────────────────────────────────────────────
  const hotLeads = useMemo(
    () => leads.filter((l) => getLeadTemperature(l).temp === "hot").slice(0, 5),
    [leads]
  );

  // ── Health score ─────────────────────────────────────────────────────────
  const { score, recommendation } = useMemo(() => {
    if (!leads.length) return { score: 0, recommendation: "הוסף ליד ראשון כדי להתחיל" };
    const taskDone = allTasks.filter((t) => t.completed).length;
    const taskTotal = allTasks.length;
    const taskScore = taskTotal > 0 ? Math.round((taskDone / taskTotal) * 30) : 20;
    const responded = leads.filter((l) => l.status !== "New" || (l.activity || []).length > 1).length;
    const responseScore = Math.round((responded / leads.length) * 25);
    const quoted = leads.filter((l) => l.status === "Quoted" || l.status === "Won").length;
    const conversionScore = Math.round((quoted / leads.length) * 20);
    const paid = invoices.filter((i) => i.status === "paid").length;
    const invoiceScore = invoices.length > 0 ? Math.round((paid / invoices.length) * 15) : 15;
    const recentActive = leads.some((l) =>
      (l.activity || []).some((a) => (Date.now() - new Date(a.createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000)
    );
    const recencyScore = recentActive ? 10 : 3;
    const s = Math.min(taskScore + responseScore + conversionScore + invoiceScore + recencyScore, 100);

    let rec = "המשיכו כך! העסק מנוהל מצוין 🎉";
    if (noResponseCount > 0)  rec = `צור קשר עם ${noResponseCount} לידים שממתינים למענה`;
    else if (overdueCount > 0) rec = `סגור ${overdueCount} משימות באיחור להעלאת הציון`;
    else if (unpaidCount > 0)  rec = `גבה ${unpaidCount} חשבוניות פתוחות`;
    else if (staleQuoteCount > 0) rec = `עקוב אחרי ${staleQuoteCount} הצעות מחיר תקועות`;
    return { score: s, recommendation: rec };
  }, [leads, invoices, allTasks, noResponseCount, overdueCount, unpaidCount, staleQuoteCount]);

  // ── Recent activity ───────────────────────────────────────────────────────
  const recentActivity = useMemo(() =>
    leads
      .flatMap((l) => (l.activity || []).map((a) => ({ ...a, leadName: l.name })))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6),
    [leads]
  );

  // ── Bottom stats ──────────────────────────────────────────────────────────
  const totalRevenue  = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + parseFloat(i.amount || 0), 0);
  const wonCount      = leads.filter((l) => l.status === "Won").length;
  const scoreColor    = score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-500" : "text-red-500";
  const scoreEmoji    = score >= 80 ? "🟢" : score >= 60 ? "🟡" : "🔴";

  return (
    <div className="p-3 md:p-5 space-y-4 max-w-xl mx-auto" dir="rtl">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">{greeting(user)}</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setFabOpen((v) => !v)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-3 py-2 rounded-xl shadow transition"
          >
            <Plus size={16} /> חדש
          </button>
          {fabOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFabOpen(false)} />
              <div className="absolute left-0 top-10 bg-white border rounded-xl shadow-xl z-20 min-w-[140px] py-1 text-sm">
                {[
                  { label: "ליד חדש",  path: "/leads" },
                  { label: "משימה",    path: "/tasks" },
                  { label: "חשבונית", path: "/invoices" },
                  { label: "שירות",   path: "/services" },
                ].map((item) => (
                  <button key={item.path}
                    onClick={() => { navigate(item.path, { state: { openNew: true } }); setFabOpen(false); }}
                    className="w-full text-right px-4 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── 4 Stat Pills ───────────────────────────────────────────────── */}
      <div className="flex gap-2">
        <StatPill emoji="🔴" label="באיחור"   count={overdueCount}    urgency="red"    onClick={() => navigate("/tasks")} />
        <StatPill emoji="🟡" label="לידים"    count={noResponseCount} urgency="yellow" onClick={() => navigate("/leads")} />
        <StatPill emoji="🔴" label="חשבוניות" count={unpaidCount}     urgency="red"    onClick={() => navigate("/invoices")} />
        <StatPill emoji="🟠" label="הצעות"    count={staleQuoteCount} urgency="orange" onClick={() => navigate("/leads")} />
      </div>

      {/* ── Today's tasks ──────────────────────────────────────────────── */}
      <Section title="✅ המשימות שלי היום" empty={todayTasks.length === 0} emptyText="אין משימות להיום 🎉">
        {todayTasks.map((task) => (
          <button key={task.id + task.leadId} onClick={() => navigate("/tasks")}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition text-right"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 truncate">{task.title}</p>
              <p className="text-xs text-slate-400">{task.leadName}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 mr-2 ${
              task.priority === "High" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
            }`}>{task.priority === "High" ? "דחוף" : "רגיל"}</span>
          </button>
        ))}
      </Section>

      {/* ── Hot leads ──────────────────────────────────────────────────── */}
      <Section title="🔥 לידים חמים" empty={hotLeads.length === 0} emptyText="אין לידים חמים כרגע">
        {hotLeads.map((lead) => {
          const temp = getLeadTemperature(lead);
          return (
            <div key={lead.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{lead.name}</p>
                <p className="text-xs text-slate-400">{temp.reason}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${temp.bg}`}>{temp.label}</span>
                <button
                  onClick={() => {
                    const phone = lead.phone?.replace(/\D/g, "");
                    if (phone) window.open(`https://wa.me/972${phone.slice(-9)}`);
                  }}
                  className="p-1.5 hover:bg-green-50 rounded-lg text-green-600"
                >
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </Section>

      {/* ── Daily recommendation ───────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl px-5 py-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-lg">💡</span>
          <span className="font-bold text-indigo-800 text-sm">המלצה יומית</span>
          <span className={`mr-auto text-sm font-bold ${scoreColor}`}>{scoreEmoji} {score}/100</span>
        </div>
        <p className="text-sm text-indigo-700">{recommendation}</p>
      </div>

      {/* ── Recent activity ────────────────────────────────────────────── */}
      <Section title="🕒 פעילות אחרונה" empty={recentActivity.length === 0} emptyText="אין פעילות עדיין">
        {recentActivity.map((act, i) => {
          const iconMap = { "lead-created": "🌱", "status-changed": "🔄", "note-added": "📝", "task-added": "✅", "lead-updated": "🖊" };
          return (
            <div key={i} className="flex items-start gap-3 px-4 py-2.5">
              <span className="text-base shrink-0 mt-0.5">{iconMap[act.type] || "•"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 truncate">{act.text}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {act.leadName} · {act.createdAt ? new Date(act.createdAt).toLocaleDateString("he-IL") : ""}
                </p>
              </div>
            </div>
          );
        })}
      </Section>

      {/* ── Bottom stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "הכנסות",  value: `₪${totalRevenue > 0 ? totalRevenue.toLocaleString() : "0"}` },
          { label: "לקוחות", value: leads.length },
          { label: "לידים",   value: leads.length },
          { label: "סגירות", value: wonCount },
        ].map((s) => (
          <div key={s.label} className="bg-white border rounded-xl p-2.5 text-center shadow-sm">
            <p className="text-[10px] text-slate-400">{s.label}</p>
            <p className="font-bold text-sm text-slate-800 mt-0.5 truncate">{s.value}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
