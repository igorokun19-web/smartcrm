import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, TrendingUp, AlertTriangle, Zap } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

function AiBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
      ✦ AI
    </span>
  );
}

const i18n = {
  he: {
    stale:      (n) => `${n} ליד${n > 1 ? "ים" : ""} לא טופל${n > 1 ? "ו" : ""} 3+ ימים`,
    quotes:     (n) => `${n} הצעת מחיר ממתינ${n > 1 ? "ות" : "ת"} לסגירה`,
    overdue:    (n) => `${n} משימ${n > 1 ? "ות" : "ה"} באיחור`,
    conversion: (r) => `שיעור סגירה ${r}% — ${r > 20 ? "מעולה! 🎯" : "יש מה לשפר"}`,
    empty:      "הוסף ליד ראשון — AI יתחיל לנתח את הנתונים שלך",
    actionLeads: "עבור ללידים",
    actionFollow: "עקוב עכשיו",
    actionTasks: "ראה משימות",
    actionAdd:  "הוסף ליד",
  },
  en: {
    stale:      (n) => `${n} lead${n > 1 ? "s" : ""} with no follow-up in 3+ days`,
    quotes:     (n) => `${n} pending quote${n > 1 ? "s" : ""} awaiting a decision`,
    overdue:    (n) => `${n} overdue task${n > 1 ? "s" : ""}`,
    conversion: (r) => `Close rate: ${r}% — ${r > 20 ? "Excellent! 🎯" : "Room to improve"}`,
    empty:      "Add your first lead — AI will start analyzing your data",
    actionLeads: "Go to Leads",
    actionFollow: "Follow Up",
    actionTasks: "View Tasks",
    actionAdd:  "Add Lead",
  },
  ru: {
    stale:      (n) => `Без обработки ${n > 1 ? n + " лидов" : "1 лид"} — 3+ дней`,
    quotes:     (n) => `${n > 1 ? n + " предложений" : "1 предложение"} ожидает решения`,
    overdue:    (n) => `Просрочено: ${n > 1 ? n + " задач" : "1 задача"}`,
    conversion: (r) => `Конверсия: ${r}% — ${r > 20 ? "Отлично! 🎯" : "Есть потенциал"}`,
    empty:      "Добавьте первого лида — AI начнёт анализировать данные",
    actionLeads: "К лидам",
    actionFollow: "Проследить",
    actionTasks: "К задачам",
    actionAdd:  "Добавить лида",
  },
};

export default function AiInsights({ leads }) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const s = i18n[language] || i18n.en;

  const insights = useMemo(() => {
    const now = new Date().getTime();
    const results = [];

    // Leads with no follow-up in 3+ days
    const stale = leads.filter(l => {
      if (l.status === "Won" || l.status === "Lost") return false;
      const lastActivity = l.activity?.length > 0
        ? Math.max(...l.activity.map(a => new Date(a.date || a.timestamp || 0).getTime()))
        : new Date(l.createdAt || 0).getTime();
      return (now - lastActivity) > 3 * 24 * 60 * 60 * 1000;
    });
    if (stale.length > 0) {
      results.push({
        id: "stale", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 border-amber-200",
        title: s.stale(stale.length), action: s.actionLeads,
        onAction: () => navigate("/leads"), priority: "high"
      });
    }

    // Leads in Quoted stage for 5+ days
    const pendingQuotes = leads.filter(l => {
      if (l.status !== "Quoted") return false;
      const created = new Date(l.createdAt || 0).getTime();
      return (now - created) > 5 * 24 * 60 * 60 * 1000;
    });
    if (pendingQuotes.length > 0) {
      results.push({
        id: "quotes", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 border-blue-200",
        title: s.quotes(pendingQuotes.length), action: s.actionFollow,
        onAction: () => navigate("/leads?filter=Quoted"), priority: "high"
      });
    }

    // Overdue tasks
    const today = new Date().toISOString().split("T")[0];
    const overdue = leads.flatMap(l => (l.tasks || []).filter(t => !t.completed && t.dueDate && t.dueDate < today));
    if (overdue.length > 0) {
      results.push({
        id: "overdue", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50 border-red-200",
        title: s.overdue(overdue.length), action: s.actionTasks,
        onAction: () => navigate("/tasks"), priority: "critical"
      });
    }

    // Positive insight: conversion rate
    const closed = leads.filter(l => l.status === "Won").length;
    if (leads.length >= 5 && closed > 0) {
      const rate = Math.round((closed / leads.length) * 100);
      results.push({
        id: "conversion", icon: Zap, color: "text-green-600", bg: "bg-green-50 border-green-200",
        title: s.conversion(rate), action: null, priority: "info"
      });
    }

    // Empty state
    if (leads.length === 0) {
      results.push({
        id: "empty", icon: Zap, color: "text-violet-600", bg: "bg-violet-50 border-violet-200",
        title: s.empty, action: s.actionAdd,
        onAction: () => navigate("/leads"),
        priority: "info"
      });
    }

    return results.sort((a, b) => {
      const order = { critical: 0, high: 1, info: 2 };
      return order[a.priority] - order[b.priority];
    }).slice(0, 3);
  }, [leads, navigate]);

  if (insights.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base md:text-lg font-bold text-slate-900">תובנות חכמות</h2>
        <AiBadge />
      </div>
      <div className="space-y-3">
        {insights.map(insight => (
          <div key={insight.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${insight.bg}`}>
            <div className="flex items-center gap-3 min-w-0">
              <insight.icon size={18} className={`${insight.color} flex-shrink-0`} />
              <p className="text-sm font-medium text-slate-800 leading-snug">{insight.title}</p>
            </div>
            {insight.action && (
              <button
                onClick={insight.onAction}
                className={`text-xs font-semibold whitespace-nowrap px-3 py-1.5 rounded-lg ${insight.color} bg-white border border-current hover:opacity-80 transition flex-shrink-0`}
              >
                {insight.action}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
