import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCrm } from "../context/CrmContext";
import { useLanguage } from "../context/LanguageContext";
import { AlertCircle, CheckSquare, FileText, Users, ArrowLeft } from "lucide-react";

const i18n = {
  he: {
    title: "⚡ מרכז פעולות",
    allClear: "הכל נקי — אין פעולות ממתינות",
    actionsNeeded: (n) => `${n} פעולות דורשות טיפול`,
    overdueTasks: "משימות באיחור", todayTasks: "משימות להיום",
    noResponse: "לידים ללא מענה", staleQuotes: "הצעות מחיר תקועות", unpaidInvoices: "חשבוניות שלא שולמו",
    emptyOverdue: "אין משימות באיחור ✓", emptyToday: "אין משימות להיום ✓",
    emptyNoResponse: "כל הלידים קיבלו מענה ✓", emptyStale: "אין הצעות מחיר תקועות ✓", emptyUnpaid: "כל החשבוניות שולמו ✓",
    allTasks: "לכל המשימות", allLeads: "לכל הלידים", allInvoices: "לכל החשבוניות",
    noResponseBadge: "ללא מענה", urgentBadge: "דחוף", todayBadge: "היום", sentBadge: "נשלחה", draftBadge: "טיוטה",
    createdOn: (d) => `נוצר ${d}`,
    openDays: (n) => `הצעת מחיר פתוחה ${n} ימים`,
    overdueDays: (n) => `באיחור ${n} ימים`,
    forLead: (n) => `ל: ${n}`,
    invoiceRef: (num, total) => `חשבונית ${num} — ₪${total}`,
    dateLocale: "he-IL",
  },
  en: {
    title: "⚡ Command Center",
    allClear: "All clear — no pending actions",
    actionsNeeded: (n) => `${n} action${n === 1 ? "" : "s"} need attention`,
    overdueTasks: "Overdue Tasks", todayTasks: "Today's Tasks",
    noResponse: "Leads Without Response", staleQuotes: "Stale Quotes", unpaidInvoices: "Unpaid Invoices",
    emptyOverdue: "No overdue tasks ✓", emptyToday: "No tasks for today ✓",
    emptyNoResponse: "All leads have been contacted ✓", emptyStale: "No stale quotes ✓", emptyUnpaid: "All invoices paid ✓",
    allTasks: "View all tasks", allLeads: "View all leads", allInvoices: "View all invoices",
    noResponseBadge: "No response", urgentBadge: "Urgent", todayBadge: "Today", sentBadge: "Sent", draftBadge: "Draft",
    createdOn: (d) => `Created ${d}`,
    openDays: (n) => `Quote open ${n} day${n === 1 ? "" : "s"}`,
    overdueDays: (n) => `${n} day${n === 1 ? "" : "s"} overdue`,
    forLead: (n) => `For: ${n}`,
    invoiceRef: (num, total) => `Invoice ${num} — ₪${total}`,
    dateLocale: "en-US",
  },
  ru: {
    title: "⚡ Центр управления",
    allClear: "Всё в порядке — нет ожидающих действий",
    actionsNeeded: (n) => `${n} действий требуют внимания`,
    overdueTasks: "Просроченные задачи", todayTasks: "Задачи на сегодня",
    noResponse: "Лиды без ответа", staleQuotes: "Зависшие предложения", unpaidInvoices: "Неоплаченные счета",
    emptyOverdue: "Нет просроченных задач ✓", emptyToday: "Задач на сегодня нет ✓",
    emptyNoResponse: "Все лиды получили ответ ✓", emptyStale: "Нет зависших предложений ✓", emptyUnpaid: "Все счета оплачены ✓",
    allTasks: "Все задачи", allLeads: "Все лиды", allInvoices: "Все счета",
    noResponseBadge: "Нет ответа", urgentBadge: "Срочно", todayBadge: "Сегодня", sentBadge: "Отправлен", draftBadge: "Черновик",
    createdOn: (d) => `Создан ${d}`,
    openDays: (n) => `Предложение открыто ${n} дней`,
    overdueDays: (n) => `Просрочено ${n} дней`,
    forLead: (n) => `Для: ${n}`,
    invoiceRef: (num, total) => `Счёт ${num} — ₪${total}`,
    dateLocale: "ru-RU",
  },
};

function ActionCard({ icon: Icon, iconColor, title, items, onAction, emptyText, actionLabel }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-slate-50">
        <Icon size={16} className={iconColor} />
        <h3 className="font-bold text-sm text-slate-800">{title}</h3>
        {items.length > 0 && (
          <span className="mr-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="px-4 py-8 text-center text-sm text-slate-400">{emptyText}</div>
      ) : (
        <div className="divide-y">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onAction(item)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition text-right"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm truncate">{item.name}</p>
                {item.sub && <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 mr-2 ${item.badgeClass}`}>
                {item.badge}
              </span>
              <ArrowLeft size={14} className="text-slate-300 shrink-0" />
            </button>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="px-4 py-2 border-t">
          <button
            onClick={() => onAction(null)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {actionLabel} ←
          </button>
        </div>
      )}
    </div>
  );
}

export default function CommandCenter() {
  const { leads } = useCrm();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const s = i18n[language] || i18n.he;
  const isRtl = language === "he";

  const today = new Date().toISOString().split("T")[0];
  const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");

  const data = useMemo(() => {
    const allTasks = leads.flatMap((l) =>
      (l.tasks || []).map((t) => ({ ...t, leadName: l.name, leadId: l.id }))
    );

    const noResponse = leads
      .filter((l) => l.status === "New" && (l.activity || []).length <= 1 && (l.tasks || []).filter(t => !t.completed).length === 0)
      .map((l) => ({
        id: l.id, name: l.name,
        sub: s.createdOn(new Date(l.createdAt).toLocaleDateString(s.dateLocale)),
        badge: s.noResponseBadge, badgeClass: "bg-orange-100 text-orange-700",
      }));

    const staleQuotes = leads
      .filter((l) => {
        if (l.status !== "Quoted") return false;
        const days = (Date.now() - new Date(l.createdAt).getTime()) / (24 * 60 * 60 * 1000);
        return days > 5;
      })
      .map((l) => {
        const days = Math.round((Date.now() - new Date(l.createdAt).getTime()) / (24 * 60 * 60 * 1000));
        return {
          id: l.id, name: l.name,
          sub: s.openDays(days),
          badge: `${days}d`, badgeClass: "bg-blue-100 text-blue-700",
        };
      });

    const unpaid = invoices
      .filter((i) => i.status !== "paid")
      .map((i) => {
        const lead = leads.find((l) => l.id === i.leadId);
        const total = (parseFloat(i.amount || 0) * (1 + parseFloat(i.tax || 0) / 100)).toFixed(0);
        return {
          id: i.id, name: lead?.name || i.number,
          sub: s.invoiceRef(i.number, total),
          badge: i.status === "sent" ? s.sentBadge : s.draftBadge,
          badgeClass: "bg-yellow-100 text-yellow-700",
        };
      });

    const todayTasks = allTasks
      .filter((t) => !t.completed && t.dueDate === today)
      .map((t) => ({
        id: t.id + t.leadId, name: t.title,
        sub: s.forLead(t.leadName),
        badge: t.priority === "High" ? s.urgentBadge : s.todayBadge,
        badgeClass: t.priority === "High" ? "bg-red-100 text-red-700" : "bg-indigo-100 text-indigo-700",
      }));

    const overdue = allTasks
      .filter((t) => !t.completed && t.dueDate && t.dueDate < today)
      .map((t) => {
        const days = Math.round((Date.now() - new Date(t.dueDate).getTime()) / (24 * 60 * 60 * 1000));
        return {
          id: t.id + t.leadId + "od", name: t.title,
          sub: s.forLead(t.leadName) + " — " + s.overdueDays(days),
          badge: `${days}d`, badgeClass: "bg-red-100 text-red-700",
        };
      });

    return { noResponse, staleQuotes, unpaid, todayTasks, overdue };
  }, [leads, today, invoices, s]);

  const totalActions = data.noResponse.length + data.staleQuotes.length + data.unpaid.length + data.todayTasks.length + data.overdue.length;

  return (
    <div className="p-4 md:p-6 space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{s.title}</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {totalActions === 0 ? s.allClear : s.actionsNeeded(totalActions)}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <ActionCard
          icon={AlertCircle} iconColor="text-red-500"
          title={s.overdueTasks}
          items={data.overdue}
          onAction={(item) => navigate(item ? "/tasks" : "/tasks")}
          emptyText={s.emptyOverdue}
          actionLabel={s.allTasks}
        />
        <ActionCard
          icon={CheckSquare} iconColor="text-indigo-500"
          title={s.todayTasks}
          items={data.todayTasks}
          onAction={() => navigate("/tasks")}
          emptyText={s.emptyToday}
          actionLabel={s.allTasks}
        />
        <ActionCard
          icon={Users} iconColor="text-orange-500"
          title={s.noResponse}
          items={data.noResponse}
          onAction={() => navigate("/leads")}
          emptyText={s.emptyNoResponse}
          actionLabel={s.allLeads}
        />
        <ActionCard
          icon={FileText} iconColor="text-blue-500"
          title={s.staleQuotes}
          items={data.staleQuotes}
          onAction={() => navigate("/leads")}
          emptyText={s.emptyStale}
          actionLabel={s.allLeads}
        />
        <ActionCard
          icon={FileText} iconColor="text-yellow-600"
          title={s.unpaidInvoices}
          items={data.unpaid}
          onAction={() => navigate("/invoices")}
          emptyText={s.emptyUnpaid}
          actionLabel={s.allInvoices}
        />
      </div>
    </div>
  );
}
