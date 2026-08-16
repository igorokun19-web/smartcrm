import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useCrm, calculateLeadScore, getLeadQuality, getPipelineStats } from "../context/CrmContext";
import { useLanguage } from "../context/LanguageContext";

const i18n = {
  he: {
    subtitle: "ניהול לידים לאורך כל שלבי המכירה",
    kpiTotal: "סה״כ לידים", kpiTotalSub: "בכל הצינור",
    kpiConversion: "שיעור המרה", kpiConversionSub: (n) => `${n} עסקאות סגורות`,
    kpiScore: "ניקוד ממוצע", kpiScoreSub: "איכות הלידים",
    kpiValue: "ערך משוער", kpiValueSub: "מלידים שסגורים",
    pipelineMetrics: "📊 מדדי צינור", ofPipeline: "מהצינור",
    pipelineTitle: "🏗️ צינור המכירה",
    emptyStage: "אין לידים בשלב זה",
    stageLeads: (n) => `${n} לידים`,
    modalScore: "ניקוד", modalQuality: "איכות", modalDays: "ימים כלקוח",
    modalTasks: "משימות", modalNotes: "הערות", modalActivity: "פעילויות", modalStatus: "סטאטוס",
    lastActivity: "📊 פעילות אחרונה",
    recommendations: "💡 המלצות",
    rec0: "צרו קשר חדש עם הלקוח",
    rec30: "שלחו הצעת מחיר",
    rec50: "עקבו אחרי הצעת המחיר",
    rec75: "סגרו את העסקה",
    recTasks: "צרו משימות עזר",
    recInactive: "הלקוח לא פעיל - שקלו צעדי תזכורת",
    closeBtn: "סגור",
    stageLabels: { New: "חדש", Contacted: "נוצר קשר", Quoted: "הצעת מחיר", Won: "ניצחון", Lost: "הפסד" },
    dateLocale: "he-IL",
  },
  en: {
    subtitle: "Manage leads through every stage of the sales process",
    kpiTotal: "Total Leads", kpiTotalSub: "In the pipeline",
    kpiConversion: "Conversion Rate", kpiConversionSub: (n) => `${n} closed deal${n === 1 ? "" : "s"}`,
    kpiScore: "Avg. Score", kpiScoreSub: "Lead quality",
    kpiValue: "Est. Value", kpiValueSub: "From closed leads",
    pipelineMetrics: "📊 Pipeline Metrics", ofPipeline: "of pipeline",
    pipelineTitle: "🏗️ Sales Pipeline",
    emptyStage: "No leads in this stage",
    stageLeads: (n) => `${n} lead${n === 1 ? "" : "s"}`,
    modalScore: "Score", modalQuality: "Quality", modalDays: "Days as Client",
    modalTasks: "Tasks", modalNotes: "Notes", modalActivity: "Activities", modalStatus: "Status",
    lastActivity: "📊 Last Activity",
    recommendations: "💡 Recommendations",
    rec0: "Reach out to the client",
    rec30: "Send a quote",
    rec50: "Follow up on the quote",
    rec75: "Close the deal",
    recTasks: "Create follow-up tasks",
    recInactive: "Client inactive — consider a reminder",
    closeBtn: "Close",
    stageLabels: { New: "New", Contacted: "Contacted", Quoted: "Quoted", Won: "Won", Lost: "Lost" },
    dateLocale: "en-US",
  },
  ru: {
    subtitle: "Управляйте лидами на каждом этапе продаж",
    kpiTotal: "Всего лидов", kpiTotalSub: "В воронке",
    kpiConversion: "Конверсия", kpiConversionSub: (n) => `${n} закрытых сделок`,
    kpiScore: "Средний балл", kpiScoreSub: "Качество лидов",
    kpiValue: "Имющее значение", kpiValueSub: "От закрытых лидов",
    pipelineMetrics: "📊 Показатели", ofPipeline: "воронки",
    pipelineTitle: "🏗️ Воронка продаж",
    emptyStage: "Нет лидов на этом этапе",
    stageLeads: (n) => `${n} лидов`,
    modalScore: "Балл", modalQuality: "Качество", modalDays: "Дней как клиент",
    modalTasks: "Задачи", modalNotes: "Заметки", modalActivity: "Активность", modalStatus: "Статус",
    lastActivity: "📊 Последняя активность",
    recommendations: "💡 Рекомендации",
    rec0: "Свяжитесь с клиентом",
    rec30: "Отправьте предложение",
    rec50: "Подтвердите предложение",
    rec75: "Закройте сделку",
    recTasks: "Создайте задачи по отслеживанию",
    recInactive: "Клиент неактивен — отправьте напоминание",
    closeBtn: "Закрыть",
    stageLabels: { New: "Новый", Contacted: "Обработан", Quoted: "Предложение", Won: "Победа", Lost: "Проигрыш" },
    dateLocale: "ru-RU",
  },
};

const kpiCard = "rounded-xl border p-4 bg-white shadow-sm";

function PipelineStage({ label, color, leads, onLeadClick, now, s }) {
  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden flex flex-col" style={{ minHeight: "300px" }}>
      {/* Stage Header */}
      <div className={`${color} text-white p-4 flex items-center justify-between`}>
        <div>
          <h3 className="font-bold text-lg">{label}</h3>
          <p className="text-sm opacity-90">{s.stageLeads(leads.length)}</p>
        </div>
        <div className="text-2xl font-bold">{leads.length}</div>
      </div>

      {/* Leads Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            {s.emptyStage}
          </div>
        ) : (
          leads.map((lead) => {
            const score = calculateLeadScore(lead);
            const quality = getLeadQuality(score);
            const daysOld = Math.floor((now - new Date(lead.createdAt).getTime()) / (24 * 60 * 60 * 1000));

            return (
              <div
                key={lead.id}
                onClick={() => onLeadClick(lead)}
                className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-gray-800 truncate">{lead.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">📞 {lead.phone}</p>
                  </div>
                </div>

                {/* Score Badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${quality.color} text-white text-xs font-bold px-2 py-1 rounded`}>
                    {score} pts
                  </span>
                  <span className="text-xs text-gray-500">{quality.label}</span>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>📅 {daysOld}d</span>
                  <span>💼 {lead.tasks?.length || 0}</span>
                  <span>📝 {lead.notes?.length || 0}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function LeadDetailModal({ lead, onClose, now, s, language }) {
  if (!lead) return null;

  const score = calculateLeadScore(lead);
  const quality = getLeadQuality(score);
  const daysOld = Math.floor((now - new Date(lead.createdAt).getTime()) / (24 * 60 * 60 * 1000));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl my-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">{lead.name}</h2>
            <p className="text-gray-600">📞 {lead.phone}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Score & Quality */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">{s.modalScore}</p>
              <p className="text-3xl font-bold text-blue-600">{score}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">{s.modalQuality}</p>
              <div className={`${quality.color} text-white px-3 py-1 rounded font-bold inline-block`}>
                {quality.label}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">{s.modalDays}</p>
              <p className="text-3xl font-bold text-green-600">{daysOld}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-gray-500">{s.modalTasks}</p>
            <p className="text-2xl font-bold">{lead.tasks?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{s.modalNotes}</p>
            <p className="text-2xl font-bold">{lead.notes?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{s.modalActivity}</p>
            <p className="text-2xl font-bold">{lead.activity?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{s.modalStatus}</p>
            <p className="text-lg font-bold text-blue-600">{lead.status}</p>
          </div>
        </div>

        {/* Last Activity */}
        {lead.activity && lead.activity.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">{s.lastActivity}</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 mb-2">{lead.activity[lead.activity.length - 1].action || lead.activity[lead.activity.length - 1].text}</p>
              <p className="text-xs text-gray-500">
                {new Date(lead.activity[lead.activity.length - 1].createdAt || lead.activity[lead.activity.length - 1].timestamp).toLocaleString(s.dateLocale)}
              </p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            {s.recommendations}
          </h3>
          <ul className="text-sm text-gray-700 space-y-1">
            {score < 30 && <li>• {s.rec0}</li>}
            {score >= 30 && score < 50 && <li>• {s.rec30}</li>}
            {score >= 50 && score < 75 && <li>• {s.rec50}</li>}
            {score >= 75 && lead.status !== "Won" && <li>• {s.rec75}</li>}
            {(lead.tasks?.length || 0) === 0 && <li>• {s.recTasks}</li>}
            {daysOld > 7 && lead.status === "New" && <li>• {s.recInactive}</li>}
          </ul>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={() => {
              const message = `שלום ${lead.name}! זהו הודעה מ-MyServices CRM`;
              const phone = lead.phone?.replace(/\D/g, "");
              if (phone) {
                window.open(`https://wa.me/972${phone.slice(-9)}?text=${encodeURIComponent(message)}`);
              } else {
                alert(language === "he" ? "אין מספר טלפון לליד" : language === "ru" ? "Нет номера телефона для лида" : "No phone number for this lead");
              }
            }}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            WhatsApp
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            {s.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Pipeline() {
  const { leads } = useCrm();
  const { language } = useLanguage();
  const [selectedLead, setSelectedLead] = useState(null);
  const [now] = useState(() => Date.now());
  const s = i18n[language] || i18n.he;
  const isRtl = language === "he";

  const { statuses: pipelineStatuses, totalValue, avgScore } = getPipelineStats(leads);

  // Group leads by status
  const leadsGrouped = {
    New: leads.filter((l) => l.status === "New"),
    Contacted: leads.filter((l) => l.status === "Contacted"),
    Quoted: leads.filter((l) => l.status === "Quoted"),
    Won: leads.filter((l) => l.status === "Won"),
    Lost: leads.filter((l) => l.status === "Lost"),
  };

  // Calculate conversion rates
  const conversionRate = leads.length > 0 ? Math.round((leadsGrouped.Won.length / leads.length) * 100) : 0;
  return (
    <div className="p-6 space-y-8" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">{s.pipelineTitle}</h1>
        <p className="text-gray-500 mt-2">{s.subtitle}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${kpiCard} bg-blue-50`}>
          <p className="text-sm text-gray-600 mb-1">{s.kpiTotal}</p>
          <p className="text-3xl font-bold">{leads.length}</p>
          <p className="text-xs text-gray-500 mt-2">{s.kpiTotalSub}</p>
        </div>

        <div className={`${kpiCard} bg-green-50`}>
          <p className="text-sm text-gray-600 mb-1">{s.kpiConversion}</p>
          <p className="text-3xl font-bold text-green-600">{conversionRate}%</p>
          <p className="text-xs text-gray-500 mt-2">{s.kpiConversionSub(leadsGrouped.Won.length)}</p>
        </div>

        <div className={`${kpiCard} bg-purple-50`}>
          <p className="text-sm text-gray-600 mb-1">{s.kpiScore}</p>
          <p className="text-3xl font-bold text-purple-600">{Math.round(avgScore)}</p>
          <p className="text-xs text-gray-500 mt-2">{s.kpiScoreSub}</p>
        </div>

        <div className={`${kpiCard} bg-orange-50`}>
          <p className="text-sm text-gray-600 mb-1">{s.kpiValue}</p>
          <p className="text-3xl font-bold text-orange-600">₪{(totalValue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-gray-500 mt-2">{s.kpiValueSub}</p>
        </div>
      </div>

      {/* Pipeline Metrics */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-bold text-lg mb-4">{s.pipelineMetrics}</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(leadsGrouped).map(([status, items]) => (
            <div key={status} className="text-center">
              <p className="text-sm text-gray-600 mb-2">{s.stageLabels[status]}</p>
              <p className="text-2xl font-bold">{items.length}</p>
              {status !== "Won" && status !== "Lost" && (
                <p className="text-xs text-gray-500 mt-1">
                  {items.length > 0 ? Math.round((items.length / leads.length) * 100) : 0}% {s.ofPipeline}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{s.pipelineTitle}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pb-8">
          <PipelineStage
            label={s.stageLabels.New}
            color="bg-blue-600"
            leads={leadsGrouped.New}
            onLeadClick={setSelectedLead}
            now={now}
            s={s}
          />
          <PipelineStage
            label={s.stageLabels.Contacted}
            color="bg-purple-600"
            leads={leadsGrouped.Contacted}
            onLeadClick={setSelectedLead}
            now={now}
            s={s}
          />
          <PipelineStage
            label={s.stageLabels.Quoted}
            color="bg-amber-600"
            leads={leadsGrouped.Quoted}
            onLeadClick={setSelectedLead}
            now={now}
            s={s}
          />
          <PipelineStage
            label={s.stageLabels.Won}
            color="bg-green-600"
            leads={leadsGrouped.Won}
            onLeadClick={setSelectedLead}
            now={now}
            s={s}
          />
          <PipelineStage
            label={s.stageLabels.Lost}
            color="bg-red-600"
            leads={leadsGrouped.Lost}
            onLeadClick={setSelectedLead}
            now={now}
            s={s}
          />
        </div>
      </div>

      {/* Lead Detail Modal */}
      <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} now={now} s={s} />
    </div>
  );
}



