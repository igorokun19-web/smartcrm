import { AlertTriangle, CheckCircle2, Clock3, ListChecks, UserPlus } from "lucide-react";
import { useState } from "react";

import { useCrm } from "../context/CrmContext";
import { useLanguage } from "../context/LanguageContext";

const DAY_MS = 24 * 60 * 60 * 1000;
const statuses = ["New", "Contacted", "Quoted", "Won", "Lost"];

function getLastActivityAt(lead) {
  const activityDates = (lead.activity || [])
    .map((activity) => new Date(activity.createdAt).getTime())
    .filter(Number.isFinite);
  const createdAt = new Date(lead.createdAt).getTime();

  return Math.max(createdAt || 0, ...activityDates);
}

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Icon size={18} className={tone} />
        <span>{label}</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default function Operations() {
  const { leads } = useCrm();
  const { t } = useLanguage();
  const [now] = useState(() => Date.now());
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const openLeads = leads.filter((lead) => !["Won", "Lost"].includes(lead.status));
  const allTasks = leads.flatMap((lead) =>
    (lead.tasks || []).map((task) => ({ ...task, leadName: lead.name }))
  );
  const recentLeads = leads.filter((lead) => now - new Date(lead.createdAt).getTime() <= DAY_MS);
  const overdueTasks = allTasks.filter(
    (task) => !task.completed && task.dueDate && task.dueDate < today
  );
  const inactiveLeads = openLeads.filter(
    (lead) => now - getLastActivityAt(lead) >= 3 * DAY_MS
  );
  const agingQuotes = leads.filter(
    (lead) => lead.status === "Quoted" && now - getLastActivityAt(lead) >= 7 * DAY_MS
  );

  const alerts = [
    ...overdueTasks.map((task) => `${task.leadName}: ${task.title}`),
    ...inactiveLeads.map((lead) => lead.name),
    ...agingQuotes.map((lead) => lead.name),
  ];
  const recommendations = [
    overdueTasks.length && t("operations.overdueRecommendation"),
    inactiveLeads.length && t("operations.inactiveRecommendation"),
    agingQuotes.length && t("operations.quoteRecommendation"),
    recentLeads.length && t("operations.newLeadRecommendation"),
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("operations.title")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("operations.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric icon={UserPlus} label={t("operations.newLeads")} value={recentLeads.length} tone="text-blue-600" />
        <Metric icon={Clock3} label={t("operations.overdueTasks")} value={overdueTasks.length} tone="text-red-600" />
        <Metric icon={AlertTriangle} label={t("operations.inactiveLeads")} value={inactiveLeads.length} tone="text-amber-600" />
        <Metric icon={ListChecks} label={t("operations.agingQuotes")} value={agingQuotes.length} tone="text-purple-600" />
      </div>

      {leads.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
          {t("operations.noData")}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">{t("operations.funnel")}</h2>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {statuses.map((status) => (
                <div key={status} className="min-w-0 rounded-md bg-slate-50 p-3 text-center">
                  <p className="text-xl font-bold text-slate-900">
                    {leads.filter((lead) => lead.status === status).length}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">{t(`operations.status${status}`)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-slate-900">{t("operations.alerts")}</h2>
            {alerts.length ? (
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {alerts.slice(0, 8).map((alert, index) => (
                  <li key={`${alert}-${index}`} className="flex items-center gap-2">
                    <AlertTriangle size={15} className="shrink-0 text-amber-600" />
                    <span>{alert}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">{t("operations.noAlerts")}</p>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
            <h2 className="font-bold text-slate-900">{t("operations.recommendations")}</h2>
            {recommendations.length ? (
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {recommendations.map((recommendation) => (
                  <li key={recommendation} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">{t("operations.noRecommendations")}</p>
            )}
          </section>
        </div>
      )}
    </div>
  );
}