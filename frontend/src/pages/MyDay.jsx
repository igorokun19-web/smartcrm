import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCrm, getLeadTemperature } from "../context/CrmContext";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { Plus, MessageCircle } from "lucide-react";

const i18n = {
  he: {
    greeting: (h, n) => h < 12 ? `בוקר טוב${n ? `, ${n}` : ""} 👋` : h < 17 ? `צהריים טובים${n ? `, ${n}` : ""} ☀️` : `ערב טוב${n ? `, ${n}` : ""} 🌙`,
    dateLocale: "he-IL",
    newBtn: "חדש",
    fabItems: [{ label: "ליד חדש", path: "/leads" }, { label: "משימה", path: "/tasks" }, { label: "חשבונית", path: "/invoices" }, { label: "שירות", path: "/services" }],
    overdue: "באיחור", leads: "לידים", invoices: "חשבוניות", quotes: "הצעות",
    todayTitle: "✅ המשימות שלי היום", todayEmpty: "אין משימות להיום 🎉",
    hotTitle: "🔥 לידים חמים", hotEmpty: "אין לידים חמים כרגע",
    recTitle: "💡 המלצה יומית",
    actTitle: "🕒 פעילות אחרונה", actEmpty: "אין פעילות עדיין",
    urgent: "דחוף", normal: "רגיל",
    revenue: "הכנסות", customers: "לקוחות", leadsLabel: "לידים", closings: "סגירות",
    rec: {
      noLeads: "הוסף ליד ראשון כדי להתחיל",
      great: "המשיכו כך! העסק מנוהל מצוין 🎉",
      noResponse: (n) => `צור קשר עם ${n} לידים שממתינים למענה`,
      overdue: (n) => `סגור ${n} משימות באיחור להעלאת הציון`,
      unpaid: (n) => `גבה ${n} חשבוניות פתוחות`,
      staleQuote: (n) => `עקוב אחרי ${n} הצעות מחיר תקועות`,
    },
  },
  en: {
    greeting: (h, n) => h < 12 ? `Good morning${n ? `, ${n}` : ""} 👋` : h < 17 ? `Good afternoon${n ? `, ${n}` : ""} ☀️` : `Good evening${n ? `, ${n}` : ""} 🌙`,
    dateLocale: "en-US",
    newBtn: "New",
    fabItems: [{ label: "New Lead", path: "/leads" }, { label: "Task", path: "/tasks" }, { label: "Invoice", path: "/invoices" }, { label: "Service", path: "/services" }],
    overdue: "Overdue", leads: "Leads", invoices: "Invoices", quotes: "Quotes",
    todayTitle: "✅ Today's Tasks", todayEmpty: "No tasks for today 🎉",
    hotTitle: "🔥 Hot Leads", hotEmpty: "No hot leads right now",
    recTitle: "💡 Daily Recommendation",
    actTitle: "🕒 Recent Activity", actEmpty: "No activity yet",
    urgent: "Urgent", normal: "Normal",
    revenue: "Revenue", customers: "Customers", leadsLabel: "Leads", closings: "Closings",
    rec: {
      noLeads: "Add your first lead to get started",
      great: "Keep it up! Business is running great 🎉",
      noResponse: (n) => `Contact ${n} lead${n === 1 ? "" : "s"} waiting for a response`,
      overdue: (n) => `Close ${n} overdue task${n === 1 ? "" : "s"} to boost your score`,
      unpaid: (n) => `Collect payment on ${n} open invoice${n === 1 ? "" : "s"}`,
      staleQuote: (n) => `Follow up on ${n} stale quote${n === 1 ? "" : "s"}`,
    },
  },
  ru: {
    greeting: (h, n) => h < 12 ? `Доброе утро${n ? `, ${n}` : ""} 👋` : h < 17 ? `Добрый день${n ? `, ${n}` : ""} ☀️` : `Добрый вечер${n ? `, ${n}` : ""} 🌙`,
    dateLocale: "ru-RU",
    newBtn: "Создать",
    fabItems: [{ label: "Новый лид", path: "/leads" }, { label: "Задача", path: "/tasks" }, { label: "Счёт", path: "/invoices" }, { label: "Услуга", path: "/services" }],
    overdue: "Просрочено", leads: "Лиды", invoices: "Счета", quotes: "Предложения",
    todayTitle: "✅ Задачи на сегодня", todayEmpty: "Задач на сегодня нет 🎉",
    hotTitle: "🔥 Горячие лиды", hotEmpty: "Горячих лидов пока нет",
    recTitle: "💡 Рекомендация дня",
    actTitle: "🕒 Последняя активность", actEmpty: "Активности пока нет",
    urgent: "Срочно", normal: "Обычная",
    revenue: "Доходы", customers: "Клиенты", leadsLabel: "Лиды", closings: "Сделки",
    rec: {
      noLeads: "Добавьте первого лида, чтобы начать",
      great: "Отлично! Бизнес идёт великолепно 🎉",
      noResponse: (n) => `Свяжитесь с ${n} лидами, ожидающими ответа`,
      overdue: (n) => `Закройте ${n} просроченных задач для повышения оценки`,
      unpaid: (n) => `Получите оплату по ${n} открытым счетам`,
      staleQuote: (n) => `Следите за ${n} зависшими предложениями`,
    },
  },
};

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
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [fabOpen, setFabOpen] = useState(false);
  const s = i18n[language] || i18n.he;
  const isRtl = language === "he";

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
    if (!leads.length) return { score: 0, recommendation: s.rec.noLeads };
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
    const total = Math.min(taskScore + responseScore + conversionScore + invoiceScore + recencyScore, 100);

    let rec = s.rec.great;
    if (noResponseCount > 0)  rec = s.rec.noResponse(noResponseCount);
    else if (overdueCount > 0) rec = s.rec.overdue(overdueCount);
    else if (unpaidCount > 0)  rec = s.rec.unpaid(unpaidCount);
    else if (staleQuoteCount > 0) rec = s.rec.staleQuote(staleQuoteCount);
    return { score: total, recommendation: rec };
  }, [leads, invoices, allTasks, noResponseCount, overdueCount, unpaidCount, staleQuoteCount, s]);

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
    <div className="p-3 md:p-5 space-y-4 max-w-xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            {s.greeting(new Date().getHours(), user?.name?.split(" ")[0] || "")}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date().toLocaleDateString(s.dateLocale, { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setFabOpen((v) => !v)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-3 py-2 rounded-xl shadow transition"
          >
            <Plus size={16} /> {s.newBtn}
          </button>
          {fabOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setFabOpen(false)} />
              <div className="absolute left-0 top-10 bg-white border rounded-xl shadow-xl z-20 min-w-[140px] py-1 text-sm">
                {s.fabItems.map((item) => (
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
        <StatPill emoji="🔴" label={s.overdue}   count={overdueCount}    urgency="red"    onClick={() => navigate("/tasks")} />
        <StatPill emoji="🟡" label={s.leads}     count={noResponseCount} urgency="yellow" onClick={() => navigate("/leads")} />
        <StatPill emoji="🔴" label={s.invoices}  count={unpaidCount}     urgency="red"    onClick={() => navigate("/invoices")} />
        <StatPill emoji="🟠" label={s.quotes}    count={staleQuoteCount} urgency="orange" onClick={() => navigate("/leads")} />
      </div>

      {/* ── Today's tasks ──────────────────────────────────────────────── */}
      <Section title={s.todayTitle} empty={todayTasks.length === 0} emptyText={s.todayEmpty}>
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
            }`}>{task.priority === "High" ? s.urgent : s.normal}</span>
          </button>
        ))}
      </Section>

      {/* ── Hot leads ──────────────────────────────────────────────────── */}
      <Section title={s.hotTitle} empty={hotLeads.length === 0} emptyText={s.hotEmpty}>
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
          <span className="font-bold text-indigo-800 text-sm">{s.recTitle}</span>
          <span className={`mr-auto text-sm font-bold ${scoreColor}`}>{scoreEmoji} {score}/100</span>
        </div>
        <p className="text-sm text-indigo-700">{recommendation}</p>
      </div>

      {/* ── Recent activity ────────────────────────────────────────────── */}
      <Section title={s.actTitle} empty={recentActivity.length === 0} emptyText={s.actEmpty}>
        {recentActivity.map((act, i) => {
          const iconMap = { "lead-created": "🌱", "status-changed": "🔄", "note-added": "📝", "task-added": "✅", "lead-updated": "🖊" };
          return (
            <div key={i} className="flex items-start gap-3 px-4 py-2.5">
              <span className="text-base shrink-0 mt-0.5">{iconMap[act.type] || "•"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-700 truncate">{act.text}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {act.leadName} · {act.createdAt ? new Date(act.createdAt).toLocaleDateString(s.dateLocale) : ""}
                </p>
              </div>
            </div>
          );
        })}
      </Section>

      {/* ── Bottom stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: s.revenue,    value: `₪${totalRevenue > 0 ? totalRevenue.toLocaleString() : "0"}` },
          { label: s.customers,  value: leads.length },
          { label: s.leadsLabel, value: leads.length },
          { label: s.closings,   value: wonCount },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border rounded-xl p-2.5 text-center shadow-sm">
            <p className="text-[10px] text-slate-400">{stat.label}</p>
            <p className="font-bold text-sm text-slate-800 mt-0.5 truncate">{stat.value}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
