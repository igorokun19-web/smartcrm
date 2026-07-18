import { useState } from "react";
import { Plus, Download, Eye, Trash2, Edit2, DollarSign, Calendar, MessageCircle } from "lucide-react";
import { useCrm, formatDate } from "../context/CrmContext";

const kpiCard = "rounded-xl border p-4 bg-white shadow-sm";
const inputClass = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500";
const btnClass = "px-3 py-1 rounded text-sm font-medium cursor-pointer transition";

export default function Invoices() {
  const { leads } = useCrm();
  const [invoices, setInvoices] = useState(JSON.parse(localStorage.getItem("invoices") || "[]"));
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    number: "",
    leadId: "",
    amount: "",
    tax: "17",
    status: "draft",
    dueDate: new Date().toISOString().split("T")[0],
    issueDate: new Date().toISOString().split("T")[0],
    description: "",
    items: [],
  });

  const statuses = {
    draft: { label: "טיוטה", color: "gray", icon: "📝" },
    sent: { label: "שנשלח", color: "blue", icon: "✉️" },
    paid: { label: "שולם", color: "green", icon: "✅" },
    overdue: { label: "逾期", color: "red", icon: "⚠️" },
  };

  const handleSave = () => {
    if (!formData.number || !formData.leadId || !formData.amount) {
      alert("נא למלא את כל השדות הנדרשים");
      return;
    }

    let updated;
    if (editingId) {
      updated = invoices.map((i) => (i.id === editingId ? { ...formData, id: editingId } : i));
    } else {
      updated = [...invoices, { ...formData, id: Date.now().toString() }];
    }

    setInvoices(updated);
    localStorage.setItem("invoices", JSON.stringify(updated));
    setFormData({
      id: "",
      number: "",
      leadId: "",
      amount: "",
      tax: "17",
      status: "draft",
      dueDate: new Date().toISOString().split("T")[0],
      issueDate: new Date().toISOString().split("T")[0],
      description: "",
      items: [],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (invoice) => {
    setFormData(invoice);
    setEditingId(invoice.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const updated = invoices.filter((i) => i.id !== id);
    setInvoices(updated);
    localStorage.setItem("invoices", JSON.stringify(updated));
  };

  const generatePDF = (invoice) => {
    const lead = leads.find((l) => l.id === invoice.leadId);
    const html = `
      <html dir="rtl">
        <head>
          <style>
            body { font-family: Arial; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
            th { background-color: #f0f0f0; }
            .total { font-weight: bold; font-size: 18px; }
            .footer { margin-top: 40px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>חשבונית</h1>
            <p>מס' ${invoice.number}</p>
          </div>
          
          <div class="details">
            <div>
              <strong>מ:</strong><br/>
              SmartCRM - ניהול לידים<br/>
              טל: 1-800-SMARTCRM
            </div>
            <div>
              <strong>ל:</strong><br/>
              ${lead?.name}<br/>
              ${lead?.phone}
            </div>
          </div>

          <div class="details">
            <div><strong>תאריך הנפקה:</strong> ${formatDate(invoice.issueDate)}</div>
            <div><strong>תאריך תשלום:</strong> ${formatDate(invoice.dueDate)}</div>
          </div>

          <table>
            <tr>
              <th>תיאור</th>
              <th>סכום</th>
            </tr>
            <tr>
              <td>${invoice.description}</td>
              <td>₪${parseFloat(invoice.amount).toFixed(2)}</td>
            </tr>
            <tr>
              <td>מס ערך מוסף (${invoice.tax}%)</td>
              <td>₪${(parseFloat(invoice.amount) * parseFloat(invoice.tax) / 100).toFixed(2)}</td>
            </tr>
            <tr class="total">
              <td>סה״כ לתשלום</td>
              <td>₪${(parseFloat(invoice.amount) * (1 + parseFloat(invoice.tax) / 100)).toFixed(2)}</td>
            </tr>
          </table>

          <div class="footer">
            <p>תודה על העסקה!</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice_${invoice.number}.html`;
    a.click();
  };

  const totalRevenue = invoices.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0);
  const paidInvoices = invoices.filter((i) => i.status === "paid").length;
  const totalTax = invoices.reduce((sum, i) => sum + (parseFloat(i.amount || 0) * parseFloat(i.tax || 0) / 100), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💵 חשבוניות</h1>
          <p className="text-gray-600 mt-1">ניהול חשבוניות ותשלומים</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              id: "",
              number: `INV-${Date.now().toString().slice(-6)}`,
              leadId: "",
              amount: "",
              tax: "17",
              status: "draft",
              dueDate: new Date().toISOString().split("T")[0],
              issueDate: new Date().toISOString().split("T")[0],
              description: "",
              items: [],
            });
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus size={18} /> חשבונית חדשה
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={kpiCard}>
          <p className="text-sm text-gray-600">סה״כ הכנסות</p>
          <p className="text-3xl font-bold mt-2">₪{totalRevenue.toFixed(0)}</p>
        </div>
        <div className={kpiCard}>
          <p className="text-sm text-gray-600">חשבוניות שולמו</p>
          <p className="text-3xl font-bold mt-2">{paidInvoices}</p>
        </div>
        <div className={kpiCard}>
          <p className="text-sm text-gray-600">סה״כ מס ערך מוסף</p>
          <p className="text-3xl font-bold mt-2">₪{totalTax.toFixed(0)}</p>
        </div>
        <div className={kpiCard}>
          <p className="text-sm text-gray-600">חשבוניות כוללות</p>
          <p className="text-3xl font-bold mt-2">{invoices.length}</p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 space-y-4 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold">{editingId ? "עדכן חשבונית" : "חשבונית חדשה"}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מספר חשבונית</label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">לקוח</label>
                <select
                  value={formData.leadId}
                  onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                  className={inputClass}
                >
                  <option value="">בחר לקוח</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סכום (₪)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={inputClass}
                  placeholder="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">מס ערך מוסף (%)</label>
                <input
                  type="number"
                  value={formData.tax}
                  onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                  className={inputClass}
                  placeholder="17"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">סטטוס</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={inputClass}
                >
                  {Object.entries(statuses).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תאריך הנפקה</label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">תאריך תשלום</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
                className={inputClass}
                placeholder="תיאור העבודה או השירות"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium"
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

      {/* Invoices Table */}
      <div className="bg-white rounded-xl shadow-sm border p-6 overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">📋 רשימת חשבוניות</h2>

        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <DollarSign size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500">אין חשבוניות עדיין</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-right p-3 font-semibold">מספר</th>
                <th className="text-right p-3 font-semibold">לקוח</th>
                <th className="text-right p-3 font-semibold">סכום</th>
                <th className="text-right p-3 font-semibold">סטטוס</th>
                <th className="text-right p-3 font-semibold">תאריך תשלום</th>
                <th className="text-right p-3 font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const lead = leads.find((l) => l.id === invoice.leadId);
                const status = statuses[invoice.status];
                const total = parseFloat(invoice.amount) * (1 + parseFloat(invoice.tax) / 100);
                return (
                  <tr key={invoice.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{invoice.number}</td>
                    <td className="p-3">{lead?.name || "לא ידוע"}</td>
                    <td className="p-3 font-semibold">₪{total.toFixed(0)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-opacity-20 bg-${status.color}-500 text-${status.color}-700`}>
                        {status.icon} {status.label}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{formatDate(invoice.dueDate)}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const lead = leads.find(l => l.id === invoice.leadId);
                            if (lead) {
                              const message = `שלום ${lead.name}! חשבונית INV-${invoice.number} בסכום ₪${invoice.amount} מחכה לך. MyServices CRM`;
                              const phone = lead.phone?.replace(/\D/g, "");
                              if (phone) {
                                window.open(`https://wa.me/972${phone.slice(-9)}?text=${encodeURIComponent(message)}`);
                              }
                            }
                          }}
                          className={`${btnClass} bg-green-100 text-green-700 hover:bg-green-200`}
                          title="שלח ב-WhatsApp"
                        >
                          <MessageCircle size={16} />
                        </button>
                        <button
                          onClick={() => generatePDF(invoice)}
                          className={`${btnClass} bg-blue-100 text-blue-700 hover:bg-blue-200`}
                          title="הורד PDF"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(invoice)}
                          className={`${btnClass} bg-yellow-100 text-yellow-700 hover:bg-yellow-200`}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className={`${btnClass} bg-red-100 text-red-700 hover:bg-red-200`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-bold mb-4">📊 על ידי סטטוס</h3>
          <div className="space-y-2">
            {Object.entries(statuses).map(([key, val]) => {
              const count = invoices.filter((i) => i.status === key).length;
              return count > 0 ? (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{val.icon} {val.label}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ) : null;
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-bold mb-4">💰 סכומים</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">סכום ממוצע:</span>
              <span className="font-bold">₪{(totalRevenue / (invoices.length || 1)).toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">הגבוה ביותר:</span>
              <span className="font-bold">
                ₪{invoices.length > 0 ? Math.max(...invoices.map((i) => parseFloat(i.amount) || 0)).toFixed(0) : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">הנמוך ביותר:</span>
              <span className="font-bold">
                ₪{invoices.length > 0 ? Math.min(...invoices.map((i) => parseFloat(i.amount) || 0)).toFixed(0) : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-bold mb-4">📅 על ידי חודש</h3>
          <div className="space-y-2 text-sm">
            {invoices.length > 0 ? (
              ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"].map((month, idx) => {
                const monthInvoices = invoices.filter((i) => new Date(i.issueDate).getMonth() === idx);
                return monthInvoices.length > 0 ? (
                  <div key={idx} className="flex justify-between text-gray-600">
                    <span>{month}</span>
                    <span className="font-semibold">₪{monthInvoices.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0).toFixed(0)}</span>
                  </div>
                ) : null;
              })
            ) : (
              <p className="text-gray-400">אין נתונים</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
