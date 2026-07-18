import { useState } from "react";
import { TrendingUp, ArrowRight, Clock, AlertCircle, MessageCircle } from "lucide-react";
import { useCrm, calculateLeadScore, getLeadQuality, getPipelineStats } from "../context/CrmContext";
import { useTranslation } from "../hooks/useTranslation";

const kpiCard = "rounded-xl border p-4 bg-white shadow-sm";

function PipelineStage({ status, label, color, leads, onLeadClick }) {
  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden flex flex-col" style={{ minHeight: "600px" }}>
      {/* Stage Header */}
      <div className={`${color} text-white p-4 flex items-center justify-between`}>
        <div>
          <h3 className="font-bold text-lg">{label}</h3>
          <p className="text-sm opacity-90">{leads.length} לידים</p>
        </div>
        <div className="text-2xl font-bold">{leads.length}</div>
      </div>

      {/* Leads Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {leads.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            אין לידים בשלב זה
          </div>
        ) : (
          leads.map((lead) => {
            const score = calculateLeadScore(lead);
            const quality = getLeadQuality(score);
            const daysOld = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (24 * 60 * 60 * 1000));

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
                  <span>💼 {lead.tasks?.length || 0} משימות</span>
                  <span>📝 {lead.notes?.length || 0} הערות</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function LeadDetailModal({ lead, onClose }) {
  if (!lead) return null;

  const score = calculateLeadScore(lead);
  const quality = getLeadQuality(score);
  const daysOld = Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (24 * 60 * 60 * 1000));

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
              <p className="text-sm text-gray-600 mb-1">ניקוד</p>
              <p className="text-3xl font-bold text-blue-600">{score}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">איכות</p>
              <div className={`${quality.color} text-white px-3 py-1 rounded font-bold inline-block`}>
                {quality.label}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">ימים כלקוח</p>
              <p className="text-3xl font-bold text-green-600">{daysOld}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-gray-500">משימות</p>
            <p className="text-2xl font-bold">{lead.tasks?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">הערות</p>
            <p className="text-2xl font-bold">{lead.notes?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">פעילויות</p>
            <p className="text-2xl font-bold">{lead.activity?.length || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">סטטוס</p>
            <p className="text-lg font-bold text-blue-600">{lead.status}</p>
          </div>
        </div>

        {/* Last Activity */}
        {lead.activity && lead.activity.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">📊 פעילות אחרונה</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 mb-2">{lead.activity[lead.activity.length - 1].action || lead.activity[lead.activity.length - 1].text}</p>
              <p className="text-xs text-gray-500">
                {new Date(lead.activity[lead.activity.length - 1].createdAt || lead.activity[lead.activity.length - 1].timestamp).toLocaleString("he-IL")}
              </p>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            💡 המלצות
          </h3>
          <ul className="text-sm text-gray-700 space-y-1">
            {score < 30 && <li>• צרו קשר חדש עם הלקוח</li>}
            {score >= 30 && score < 50 && <li>• שלחו הצעת מחיר</li>}
            {score >= 50 && score < 75 && <li>• עקבו אחרי הצעת המחיר</li>}
            {score >= 75 && lead.status !== "Won" && <li>• סגרו את העסקה</li>}
            {(lead.tasks?.length || 0) === 0 && <li>• צרו משימות ניעזור</li>}
            {daysOld > 7 && lead.status === "New" && <li>• הלקוח לא פעיל - שקלו צעדי תזכור</li>}
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
                alert("אין מספר טלפון לליד");
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
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Pipeline() {
  const { leads } = useCrm();
  const [selectedLead, setSelectedLead] = useState(null);

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
  const quoteConversion = leadsGrouped.Quoted.length > 0 ? Math.round((leadsGrouped.Won.length / leadsGrouped.Quoted.length) * 100) : 0;

  return (
    <div className="p-6 space-y-8" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold">🏗️ Sales Pipeline Pro</h1>
        <p className="text-gray-500 mt-2">ניהול לידים לאורך כל שלבי המכירה</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${kpiCard} bg-blue-50`}>
          <p className="text-sm text-gray-600 mb-1">סה״כ לידים</p>
          <p className="text-3xl font-bold">{leads.length}</p>
          <p className="text-xs text-gray-500 mt-2">בכל הצינור</p>
        </div>

        <div className={`${kpiCard} bg-green-50`}>
          <p className="text-sm text-gray-600 mb-1">שיעור המרה</p>
          <p className="text-3xl font-bold text-green-600">{conversionRate}%</p>
          <p className="text-xs text-gray-500 mt-2">{leadsGrouped.Won.length} עסקאות סגורות</p>
        </div>

        <div className={`${kpiCard} bg-purple-50`}>
          <p className="text-sm text-gray-600 mb-1">ניקוד ממוצע</p>
          <p className="text-3xl font-bold text-purple-600">{Math.round(avgScore)}</p>
          <p className="text-xs text-gray-500 mt-2">איכות הלידים</p>
        </div>

        <div className={`${kpiCard} bg-orange-50`}>
          <p className="text-sm text-gray-600 mb-1">ערך משוער</p>
          <p className="text-3xl font-bold text-orange-600">₪{(totalValue / 1000).toFixed(0)}K</p>
          <p className="text-xs text-gray-500 mt-2">מלידים שסגורים</p>
        </div>
      </div>

      {/* Pipeline Metrics */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-bold text-lg mb-4">📊 מדדי צינור</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(leadsGrouped).map(([status, items]) => (
            <div key={status} className="text-center">
              <p className="text-sm text-gray-600 mb-2">{pipelineStatuses[status].label}</p>
              <p className="text-2xl font-bold">{items.length}</p>
              {status !== "Won" && status !== "Lost" && (
                <p className="text-xs text-gray-500 mt-1">
                  {items.length > 0 ? Math.round((items.length / leads.length) * 100) : 0}% מהצינור
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div>
        <h2 className="text-2xl font-bold mb-4">🏛️ צינור המכירה</h2>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pb-8">
          <PipelineStage
            status="New"
            label="חדש"
            color="bg-yellow-500"
            leads={leadsGrouped.New}
            onLeadClick={setSelectedLead}
          />
          <PipelineStage
            status="Contacted"
            label="נוצר קשר"
            color="bg-purple-500"
            leads={leadsGrouped.Contacted}
            onLeadClick={setSelectedLead}
          />
          <PipelineStage
            status="Quoted"
            label="הצעת מחיר"
            color="bg-blue-500"
            leads={leadsGrouped.Quoted}
            onLeadClick={setSelectedLead}
          />
          <PipelineStage
            status="Won"
            label="נסגר בהצלחה"
            color="bg-green-500"
            leads={leadsGrouped.Won}
            onLeadClick={setSelectedLead}
          />
          <PipelineStage
            status="Lost"
            label="אבוד"
            color="bg-red-500"
            leads={leadsGrouped.Lost}
            onLeadClick={setSelectedLead}
          />
        </div>
      </div>

      {/* Lead Detail Modal */}
      <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
}
