import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCrm } from "../context/CrmContext";
import { AlertCircle, CheckSquare, FileText, Users, ArrowLeft } from "lucide-react";

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
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");

  const data = useMemo(() => {
    const allTasks = leads.flatMap((l) =>
      (l.tasks || []).map((t) => ({ ...t, leadName: l.name, leadId: l.id }))
    );

    // Leads without any response (New status, no tasks at all, or no activity beyond creation)
    const noResponse = leads
      .filter((l) => l.status === "New" && (l.activity || []).length <= 1 && (l.tasks || []).filter(t => !t.completed).length === 0)
      .map((l) => ({
        id: l.id, name: l.name,
        sub: `נוצר ${new Date(l.createdAt).toLocaleDateString("he-IL")}`,
        badge: "ללא מענה", badgeClass: "bg-orange-100 text-orange-700",
      }));

    // Stale quotes (Quoted > 5 days)
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
          sub: `הצעת מחיר פתוחה ${days} ימים`,
          badge: `${days} ימים`, badgeClass: "bg-blue-100 text-blue-700",
        };
      });

    // Unpaid invoices
    const unpaid = invoices
      .filter((i) => i.status !== "paid")
      .map((i) => {
        const lead = leads.find((l) => l.id === i.leadId);
        const total = (parseFloat(i.amount || 0) * (1 + parseFloat(i.tax || 0) / 100)).toFixed(0);
        return {
          id: i.id, name: lead?.name || i.number,
          sub: `חשבונית ${i.number} — ₪${total}`,
          badge: i.status === "sent" ? "נשלחה" : "טיוטה",
          badgeClass: "bg-yellow-100 text-yellow-700",
        };
      });

    // Today's tasks
    const todayTasks = allTasks
      .filter((t) => !t.completed && t.dueDate === today)
      .map((t) => ({
        id: t.id + t.leadId, name: t.title,
        sub: `ל: ${t.leadName}`,
        badge: t.priority === "High" ? "דחוף" : "היום",
        badgeClass: t.priority === "High" ? "bg-red-100 text-red-700" : "bg-indigo-100 text-indigo-700",
      }));

    // Overdue tasks
    const overdue = allTasks
      .filter((t) => !t.completed && t.dueDate && t.dueDate < today)
      .map((t) => {
        const days = Math.round((Date.now() - new Date(t.dueDate).getTime()) / (24 * 60 * 60 * 1000));
        return {
          id: t.id + t.leadId + "od", name: t.title,
          sub: `ל: ${t.leadName} — באיחור ${days} ימים`,
          badge: `${days} ימים`, badgeClass: "bg-red-100 text-red-700",
        };
      });

    return { noResponse, staleQuotes, unpaid, todayTasks, overdue };
  }, [leads, today, invoices]);

  const totalActions = data.noResponse.length + data.staleQuotes.length + data.unpaid.length + data.todayTasks.length + data.overdue.length;

  return (
    <div className="p-4 md:p-6 space-y-6" dir="rtl">
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">⚡ מרכז פעולות</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {totalActions === 0 ? "הכל נקי — אין פעולות ממתינות" : `${totalActions} פעולות דורשות טיפול`}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        <ActionCard
          icon={AlertCircle} iconColor="text-red-500"
          title="משימות באיחור"
          items={data.overdue}
          onAction={(item) => navigate(item ? "/tasks" : "/tasks")}
          emptyText="אין משימות באיחור ✓"
          actionLabel="לכל המשימות"
        />
        <ActionCard
          icon={CheckSquare} iconColor="text-indigo-500"
          title="משימות להיום"
          items={data.todayTasks}
          onAction={() => navigate("/tasks")}
          emptyText="אין משימות להיום ✓"
          actionLabel="לכל המשימות"
        />
        <ActionCard
          icon={Users} iconColor="text-orange-500"
          title="לידים ללא מענה"
          items={data.noResponse}
          onAction={() => navigate("/leads")}
          emptyText="כל הלידים קיבלו מענה ✓"
          actionLabel="לכל הלידים"
        />
        <ActionCard
          icon={FileText} iconColor="text-blue-500"
          title="הצעות מחיר תקועות"
          items={data.staleQuotes}
          onAction={() => navigate("/leads")}
          emptyText="אין הצעות מחיר תקועות ✓"
          actionLabel="לכל הלידים"
        />
        <ActionCard
          icon={FileText} iconColor="text-yellow-600"
          title="חשבוניות שלא שולמו"
          items={data.unpaid}
          onAction={() => navigate("/invoices")}
          emptyText="כל החשבוניות שולמו ✓"
          actionLabel="לכל החשבוניות"
        />
      </div>
    </div>
  );
}
