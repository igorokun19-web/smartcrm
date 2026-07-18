import { useState } from "react";
import { Plus, Trash2, Edit2, TrendingUp, Package } from "lucide-react";
import { useCrm } from "../context/CrmContext";
import { useTranslation } from "../hooks/useTranslation";

const kpiCard = "rounded-xl border p-4 bg-white shadow-sm";
const tableClass = "w-full border-collapse";
const btnClass = "px-3 py-1 rounded text-sm font-medium cursor-pointer transition";
const inputClass = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500";

export default function Services() {
  const { leads } = useCrm();
  const [services, setServices] = useState(JSON.parse(localStorage.getItem("services") || "[]"));
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    basePrice: "",
    category: "אחר",
    duration: "60",
    profitMargin: "30",
  });

  const categories = ["צביעה", "אינסטלציה", "תיקון", "ניקיון", "פיתוח", "ייעוץ", "אחר"];

  const handleSave = () => {
    if (!formData.name || !formData.basePrice) {
      alert("נא למלא את השם והמחיר");
      return;
    }

    let updated;
    if (editingId) {
      updated = services.map((s) => (s.id === editingId ? { ...formData, id: editingId } : s));
    } else {
      updated = [...services, { ...formData, id: Date.now().toString() }];
    }

    setServices(updated);
    localStorage.setItem("services", JSON.stringify(updated));
    setFormData({ id: "", name: "", description: "", basePrice: "", category: "אחר", duration: "60", profitMargin: "30" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (service) => {
    setFormData(service);
    setEditingId(service.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const updated = services.filter((s) => s.id !== id);
    setServices(updated);
    localStorage.setItem("services", JSON.stringify(updated));
  };

  const totalRevenue = services.reduce((sum, s) => sum + (parseFloat(s.basePrice) || 0), 0);
  const avgMargin = services.length > 0 ? Math.round(services.reduce((sum, s) => sum + (parseFloat(s.profitMargin) || 0), 0) / services.length) : 0;
  const leadsWithServices = leads.filter((l) => l.services && l.services.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📦 ניהול שירותים</h1>
          <p className="text-gray-600 mt-1">קטלוג שירותים, תמחורים ודירוגים</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ id: "", name: "", description: "", basePrice: "", category: "אחר", duration: "60", profitMargin: "30" });
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} /> שירות חדש
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={kpiCard}>
          <p className="text-sm text-gray-600">סה״כ שירותים</p>
          <p className="text-3xl font-bold mt-2">{services.length}</p>
        </div>
        <div className={kpiCard}>
          <p className="text-sm text-gray-600">סכום ממוצע</p>
          <p className="text-3xl font-bold mt-2">₪{(totalRevenue / (services.length || 1)).toFixed(0)}</p>
        </div>
        <div className={kpiCard}>
          <p className="text-sm text-gray-600">רווח ממוצע</p>
          <p className="text-3xl font-bold mt-2">{avgMargin}%</p>
        </div>
        <div className={kpiCard}>
          <p className="text-sm text-gray-600">לידים עם שירותים</p>
          <p className="text-3xl font-bold mt-2">{leadsWithServices}</p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 space-y-4">
            <h2 className="text-2xl font-bold">{editingId ? "עדכן שירות" : "שירות חדש"}</h2>
            
            <input
              type="text"
              placeholder="שם השירות (צביעה, אינסטלציה וכו...)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
            />

            <textarea
              placeholder="תיאור השירות"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="2"
              className={inputClass}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">קטגוריה</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={inputClass}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">משך זמן (דקות)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מחיר בסיסי (₪)</label>
                <input
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  className={inputClass}
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מרווח רווח (%)</label>
                <input
                  type="number"
                  value={formData.profitMargin}
                  onChange={(e) => setFormData({ ...formData, profitMargin: e.target.value })}
                  className={inputClass}
                  placeholder="30"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                💾 שמור
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 font-medium"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Services Table */}
      <div className="bg-white rounded-xl shadow-sm border p-6 overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">📋 קטלוג שירותים</h2>
        
        {services.length === 0 ? (
          <div className="text-center py-8">
            <Package size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">אין שירותים עדיין. בואו נוסיף את הראשון!</p>
          </div>
        ) : (
          <table className={tableClass}>
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-right p-3 font-semibold">שם</th>
                <th className="text-right p-3 font-semibold">קטגוריה</th>
                <th className="text-right p-3 font-semibold">מחיר</th>
                <th className="text-right p-3 font-semibold">משך זמן</th>
                <th className="text-right p-3 font-semibold">מרווח</th>
                <th className="text-right p-3 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{service.name}</div>
                    <div className="text-xs text-gray-500">{service.description}</div>
                  </td>
                  <td className="p-3 text-sm">{service.category}</td>
                  <td className="p-3 font-semibold">₪{parseFloat(service.basePrice).toFixed(0)}</td>
                  <td className="p-3 text-sm">{service.duration} דקות</td>
                  <td className="p-3">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      {service.profitMargin}%
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className={`${btnClass} bg-blue-100 text-blue-700 hover:bg-blue-200`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className={`${btnClass} bg-red-100 text-red-700 hover:bg-red-200`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-bold mb-4">💰 ניתוח הכנסות</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">סכום כולל שירותים:</span>
              <span className="font-bold text-lg">₪{totalRevenue.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">שירות יקר ביותר:</span>
              <span className="font-bold">
                {services.length > 0
                  ? `₪${Math.max(...services.map((s) => parseFloat(s.basePrice) || 0)).toFixed(0)}`
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">שירות זול ביותר:</span>
              <span className="font-bold">
                {services.length > 0
                  ? `₪${Math.min(...services.map((s) => parseFloat(s.basePrice) || 0)).toFixed(0)}`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-bold mb-4">📊 התפלגות קטגוריות</h3>
          <div className="space-y-2">
            {categories.map((cat) => {
              const count = services.filter((s) => s.category === cat).length;
              return count > 0 ? (
                <div key={cat} className="flex justify-between items-center">
                  <span className="text-gray-600">{cat}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(count / services.length) * 100}%` }}
                      />
                    </div>
                    <span className="font-bold text-sm">{count}</span>
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
