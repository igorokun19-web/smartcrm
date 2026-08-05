import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Clock, TrendingUp, AlertTriangle, Zap } from "lucide-react";

function AiBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">
      ✦ AI
    </span>
  );
}

export default function AiInsights({ leads }) {
  const navigate = useNavigate();

  const insights = useMemo(() => {
    const now = Date.now();
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
        id: "stale",
        icon: Clock,
        color: "text-amber-600",
        bg: "bg-amber-50 border-amber-200",
        title: `${stale.length} ליד${stale.length > 1 ? "ים" : ""} לא טופל${stale.length > 1 ? "ו" : ""} 3+ ימים`,
        action: "עבור ללידים",
        onAction: () => navigate("/leads"),
        priority: "high"
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
        id: "quotes",
        icon: TrendingUp,
        color: "text-blue-600",
        bg: "bg-blue-50 border-blue-200",
        title: `${pendingQuotes.length} הצעת מחיר ממתינ${pendingQuotes.length > 1 ? "ות" : "ת"} לסגירה`,
        action: "עקוב עכשיו",
        onAction: () => navigate("/leads?filter=Quoted"),
        priority: "high"
      });
    }

    // Overdue tasks
    const today = new Date().toISOString().split("T")[0];
    const overdue = leads.flatMap(l => (l.tasks || []).filter(t => !t.completed && t.dueDate && t.dueDate < today));
    if (overdue.length > 0) {
      results.push({
        id: "overdue",
        icon: AlertTriangle,
        color: "text-red-600",
        bg: "bg-red-50 border-red-200",
        title: `${overdue.length} משימ${overdue.length > 1 ? "ות" : "ה"} באיחור`,
        action: "ראה משימות",
        onAction: () => navigate("/tasks"),
        priority: "critical"
      });
    }

    // Positive insight: conversion rate
    const closed = leads.filter(l => l.status === "Won").length;
    if (leads.length >= 5 && closed > 0) {
      const rate = Math.round((closed / leads.length) * 100);
      results.push({
        id: "conversion",
        icon: Zap,
        color: "text-green-600",
        bg: "bg-green-50 border-green-200",
        title: `שיעור סגירה ${rate}% — ${rate > 20 ? "מעולה! 🎯" : "יש מה לשפר"}`,
        action: null,
        priority: "info"
      });
    }

    // Empty state suggestion
    if (leads.length === 0) {
      results.push({
        id: "empty",
        icon: Zap,
        color: "text-violet-600",
        bg: "bg-violet-50 border-violet-200",
        title: "הוסף ליד ראשון — AI יתחיל לנתח את הנתונים שלך",
        action: "הוסף ליד",
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
