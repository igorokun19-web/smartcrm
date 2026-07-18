import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronUp, Download, Edit2, Trash2, Plus, MessageCircle } from "lucide-react";
import {
  useCrm,
  formatDate,
  getPriorityLabel,
  getPriorityClass,
  calculateLeadScore,
  getLeadQuality,
} from "../context/CrmContext";
import { useTranslation } from "../hooks/useTranslation";
import { useDebounce } from "../hooks/index";

export default function Leads() {
  const { t, language } = useTranslation();
  const {
    leads,
    addLead,
    editLeadDetails,
    deleteLead: removeLead,
    changeStatus,
    addNote: addLeadNote,
    deleteNote,
    addTask: addLeadTask,
    toggleTask: toggleTaskCompleted,
    deleteTask,
  } = useCrm();

  // Dynamic STATUS_OPTIONS with translations
  const STATUS_OPTIONS = [
    { value: "New", label: t("leads.new"), color: "blue" },
    { value: "Contacted", label: t("leads.contacted"), color: "purple" },
    { value: "Quoted", label: t("leads.quoted"), color: "pink" },
    { value: "Won", label: t("leads.won"), color: "green" },
    { value: "Lost", label: t("leads.lost"), color: "red" },
  ];

  const getStatusColor = (status) => {
    const statusObj = STATUS_OPTIONS.find(s => s.value === status);
    return statusObj ? statusObj.color : "gray";
  };

  const getStatusLabel = (status) => {
    const statusObj = STATUS_OPTIONS.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const [editingId, setEditingId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const searchTerm = useDebounce(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [expandedLeads, setExpandedLeads] = useState({});
  const [noteInputs, setNoteInputs] = useState({});
  const [taskInputs, setTaskInputs] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      message: "",
    });

    setEditingId(null);
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const saveLead = () => {
    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const message = formData.message.trim();

    if (!name) {
      alert(t("leads.nameRequired"));
      return;
    }

    if (!phone) {
      alert(t("leads.phoneRequired"));
      return;
    }

    if (editingId) {
      editLeadDetails(editingId, { name, phone, message });
      resetForm();
      return;
    }

    addLead({ name, phone, message });
    resetForm();
  };

  const editLead = (lead) => {
    setEditingId(lead.id);

    setFormData({
      name: lead.name || "",
      phone: lead.phone || "",
      message: lead.message || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteLead = (id) => {
    if (!window.confirm("למחוק את הליד?")) {
      return;
    }

    removeLead(id);
  };

  const toggleExpanded = (leadId) => {
    setExpandedLeads((prev) => ({
      ...prev,
      [leadId]: !prev[leadId],
    }));
  };

  const exportToCSV = () => {
    const headers = ["שם", "טלפון", "סטטוס", "בקשה", "הערות", "משימות", "תאריך"];
    const rows = filteredSortedLeads.map((lead) => [
      lead.name,
      lead.phone,
      getStatusLabel(lead.status || "New"),
      lead.message || "---",
      lead.notes?.length || 0,
      lead.tasks?.length || 0,
      formatDate(lead.createdAt),
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredSortedLeads = useMemo(() => {
    let filtered = leads.filter((lead) => {
      const search = searchTerm.toLowerCase();
      const notesText = (lead.notes || [])
        .map((note) => note.text || "")
        .join(" ")
        .toLowerCase();
      const tasksText = (lead.tasks || [])
        .map((task) => task.title || "")
        .join(" ")
        .toLowerCase();
      const activityText = (lead.activity || [])
        .map((item) => item.text || "")
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        (lead.name || "").toLowerCase().includes(search) ||
        (lead.phone || "").includes(searchTerm) ||
        (lead.message || "").toLowerCase().includes(search) ||
        notesText.includes(search) ||
        tasksText.includes(search) ||
        activityText.includes(search);

      const matchesStatus =
        statusFilter === "all" || (lead.status || "New") === statusFilter;

      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      let compareA, compareB;

      switch (sortBy) {
        case "name":
          compareA = (a.name || "").toLowerCase();
          compareB = (b.name || "").toLowerCase();
          break;
        case "phone":
          compareA = a.phone || "";
          compareB = b.phone || "";
          break;
        case "status":
          compareA = a.status || "New";
          compareB = b.status || "New";
          break;
        case "tasks":
          compareA = (a.tasks || []).length;
          compareB = (b.tasks || []).length;
          break;
        default: // date
          compareA = new Date(a.createdAt || 0);
          compareB = new Date(b.createdAt || 0);
      }

      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [leads, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleNoteChange = (leadId, value) => {
    setNoteInputs((prev) => ({
      ...prev,
      [leadId]: value,
    }));
  };

  const addNote = (leadId) => {
    const text = (noteInputs[leadId] || "").trim();

    if (!text) {
      alert("נא להזין הערה");
      return;
    }

    addLeadNote(leadId, text);

    setNoteInputs((prev) => ({
      ...prev,
      [leadId]: "",
    }));
  };

  const handleTaskChange = (leadId, field, value) => {
    setTaskInputs((prev) => ({
      ...prev,
      [leadId]: {
        title: "",
        dueDate: "",
        priority: "Medium",
        ...(prev[leadId] || {}),
        [field]: value,
      },
    }));
  };

  const addTask = (leadId) => {
    const currentTask = taskInputs[leadId] || { title: "", dueDate: "", priority: "Medium" };
    const title = (currentTask.title || "").trim();

    if (!title) {
      alert("נא להזין כותרת משימה");
      return;
    }

    addLeadTask(leadId, {
      title,
      dueDate: currentTask.dueDate || "",
      priority: currentTask.priority || "Medium",
    });

    setTaskInputs((prev) => ({
      ...prev,
      [leadId]: {
        title: "",
        dueDate: "",
        priority: "Medium",
      },
    }));
  };

  const filteredLeads = filteredSortedLeads;

  return (
    <div className="p-6" dir={language === "he" ? "rtl" : "ltr"}>
      <h1 className="text-3xl font-bold mb-6">{t("leads.title")}</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? t("leads.editLead") : t("leads.addNewLead")}
        </h2>

        <div className="grid gap-3">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={t("leads.namePlaceholder")}
            className="border rounded-lg p-3 text-right"
          />

          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t("leads.phonePlaceholder")}
            className="border rounded-lg p-3 text-right"
          />

          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder={t("leads.messagePlaceholder")}
            rows="3"
            className="border rounded-lg p-3 text-right"
          />

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={saveLead}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-5 rounded-lg"
            >
              {editingId ? t("leads.updateLead") : t("leads.saveLead")}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-5 rounded-lg"
              >
                {t("common.cancel")}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex gap-4 flex-wrap items-center mb-4">
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={t("leads.searchPlaceholder")}
            className="border rounded-lg p-3 text-right flex-1 min-w-60"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg p-3"
          >
            <option value="all">{t("leads.allStatuses")}</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <button
            onClick={exportToCSV}
            disabled={filteredLeads.length === 0}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-5 rounded-lg flex items-center gap-2"
          >
            <Download size={18} />
            {t("leads.exportCSV")}
          </button>
        </div>

        <div className="text-sm text-gray-600">
          {filteredLeads.length} {t("leads.leadsOf")} {leads.length}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="text-right p-4 cursor-pointer hover:bg-gray-200" onClick={() => {
                if (sortBy === "name") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                else { setSortBy("name"); setSortOrder("asc"); }
              }}>
                <div className="flex items-center gap-2 justify-end">
                  {t("leads.name")}
                  {sortBy === "name" && (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </div>
              </th>
              <th className="text-right p-4 cursor-pointer hover:bg-gray-200" onClick={() => {
                if (sortBy === "phone") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                else { setSortBy("phone"); setSortOrder("asc"); }
              }}>
                <div className="flex items-center gap-2 justify-end">
                  {t("leads.phone")}
                  {sortBy === "phone" && (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </div>
              </th>
              <th className="text-right p-4 cursor-pointer hover:bg-gray-200" onClick={() => {
                if (sortBy === "status") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                else { setSortBy("status"); setSortOrder("asc"); }
              }}>
                <div className="flex items-center gap-2 justify-end">
                  {t("leads.status")}
                  {sortBy === "status" && (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </div>
              </th>
              <th className="text-right p-4 cursor-pointer hover:bg-gray-200" onClick={() => {
                if (sortBy === "tasks") setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                else { setSortBy("tasks"); setSortOrder("asc"); }
              }}>
                <div className="flex items-center gap-2 justify-end">
                  {t("leads.tasks")}
                  {sortBy === "tasks" && (sortOrder === "asc" ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                </div>
              </th>
              <th className="text-right p-4">{t("leads.notes")}</th>
              <th className="text-right p-4">{t("leads.activity")}</th>
              <th className="text-right p-4">{t("leads.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-8 text-gray-500">
                  {t("leads.noLeads")}
                </td>
              </tr>
            ) : (
              filteredLeads.map((lead) => (
                <React.Fragment key={lead.id}>
                  <tr className="border-b hover:bg-gray-50 transition">
                    <td className="p-4 text-right">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-semibold">{lead.name}</div>
                          <div className="text-sm text-gray-600">{lead.phone}</div>
                        </div>
                        <div className={`${getLeadQuality(calculateLeadScore(lead)).color} text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap`}>
                          {calculateLeadScore(lead)} pts
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right text-sm text-gray-600">{lead.phone}</td>
                    <td className="p-4 text-right">
                      <select
                        value={lead.status || "New"}
                        onChange={(e) => changeStatus(lead.id, e.target.value)}
                        className={`px-3 py-1 rounded-full text-sm font-medium border-0 text-white bg-${getStatusColor(lead.status || "New")}-600 hover:bg-${getStatusColor(lead.status || "New")}-700`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold">
                        {(lead.tasks || []).length}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 font-semibold">
                        {(lead.notes || []).length}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold">
                        {(lead.activity || []).length}
                      </span>
                    </td>
                    <td className="p-4 text-left">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => toggleExpanded(lead.id)}
                          className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                          title={t("leads.showDetails")}
                        >
                          {expandedLeads[lead.id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                        <button
                          onClick={() => {
                            const message = `${t("leads.whatsappGreeting")} ${lead.name}! ${t("leads.whatsappMessage")}`;
                            const phone = lead.phone?.replace(/\D/g, "");
                            if (phone) {
                              window.open(`https://wa.me/972${phone.slice(-9)}?text=${encodeURIComponent(message)}`);
                            } else {
                              alert(t("leads.noPhoneNumber"));
                            }
                          }}
                          className="p-2 hover:bg-green-100 rounded-lg text-green-600"
                          title="WhatsApp"
                        >
                          <MessageCircle size={18} />
                        </button>
                        <button
                          onClick={() => editLead(lead)}
                          className="p-2 hover:bg-yellow-100 rounded-lg text-yellow-600"
                          title={t("leads.edit")}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => deleteLead(lead.id)}
                          className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                          title={t("leads.delete")}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expandedLeads[lead.id] && (
                    <tr className="bg-gray-50 border-b">
                      <td colSpan="7" className="p-6">
                        <div className="grid xl:grid-cols-3 gap-6">
                          {/* Notes Section */}
                          <div className="bg-blue-50 rounded-xl p-4">
                            <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                              📝 {t("leads.notes")} ({(lead.notes || []).length})
                            </h4>
                            <div className="flex gap-2 mb-4">
                              <input
                                type="text"
                                value={noteInputs[lead.id] || ""}
                                onChange={(event) =>
                                  handleNoteChange(lead.id, event.target.value)
                                }
                                placeholder={t("leads.addNotePlaceholder")}
                                className="border rounded-lg p-2 text-right flex-1"
                              />
                              <button
                                onClick={() => addNote(lead.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                              >
                                <Plus size={18} />
                              </button>
                            </div>
                            {(lead.notes || []).length === 0 ? (
                              <p className="text-gray-500 text-sm">{t("leads.noNotes")}</p>
                            ) : (
                              <div className="space-y-2 max-h-64 overflow-auto">
                                {(lead.notes || []).map((note) => (
                                  <div key={note.id} className="bg-white p-3 rounded border text-sm">
                                    <p>{note.text}</p>
                                    <div className="flex justify-between items-center mt-2">
                                      <span className="text-xs text-gray-400">{formatDate(note.createdAt)}</span>
                                      <button
                                        onClick={() => deleteNote(lead.id, note.id)}
                                        className="text-red-600 text-xs hover:text-red-700"
                                      >
                                        {t("leads.delete")}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Tasks Section */}
                          <div className="bg-yellow-50 rounded-xl p-4">
                            <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                              ✅ {t("leads.tasks")} ({(lead.tasks || []).length})
                            </h4>
                            <div className="grid gap-2 mb-4">
                              <input
                                type="text"
                                value={(taskInputs[lead.id]?.title) || ""}
                                onChange={(event) =>
                                  handleTaskChange(lead.id, "title", event.target.value)
                                }
                                placeholder={t("leads.taskTitlePlaceholder")}
                                className="border rounded-lg p-2 text-right"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="date"
                                  value={(taskInputs[lead.id]?.dueDate) || ""}
                                  onChange={(event) =>
                                    handleTaskChange(lead.id, "dueDate", event.target.value)
                                  }
                                  className="border rounded-lg p-2"
                                />
                                <select
                                  value={(taskInputs[lead.id]?.priority) || "Medium"}
                                  onChange={(event) =>
                                    handleTaskChange(lead.id, "priority", event.target.value)
                                  }
                                  className="border rounded-lg p-2"
                                >
                                  <option value="High">{t("common.priorityHigh")}</option>
                                  <option value="Medium">{t("common.priorityMedium")}</option>
                                  <option value="Low">{t("common.priorityLow")}</option>
                                </select>
                              </div>
                              <button
                                onClick={() => addTask(lead.id)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg"
                              >
                                {t("leads.addTask")}
                              </button>
                            </div>
                            {(lead.tasks || []).length === 0 ? (
                              <p className="text-gray-500 text-sm">{t("leads.noTasks")}</p>
                            ) : (
                              <div className="space-y-2 max-h-64 overflow-auto">
                                {(lead.tasks || []).map((task) => (
                                  <div key={task.id} className="bg-white p-3 rounded border">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                      <div className="flex-1">
                                        <p
                                          className={`font-semibold text-sm ${
                                            task.completed
                                              ? "line-through text-gray-400"
                                              : "text-gray-800"
                                          }`}
                                        >
                                          {task.title}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {task.dueDate || t("leads.noDate")}
                                        </p>
                                      </div>
                                      <span
                                        className={`text-xs px-2 py-1 rounded whitespace-nowrap ${getPriorityClass(
                                          task.priority || "Medium"
                                        )}`}
                                      >
                                        {getPriorityLabel(task.priority || "Medium")}
                                      </span>
                                    </div>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          toggleTaskCompleted(lead.id, task.id)
                                        }
                                        className={`text-white px-2 py-1 rounded text-xs flex-1 ${
                                          task.completed
                                            ? "bg-yellow-500 hover:bg-yellow-600"
                                            : "bg-green-500 hover:bg-green-600"
                                        }`}
                                      >
                                        {task.completed ? t("leads.reopenTask") : t("leads.completeTask")}
                                      </button>
                                      <button
                                        onClick={() => deleteTask(lead.id, task.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                                      >
                                        {t("leads.delete")}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Activity Section */}
                          <div className="bg-purple-50 rounded-xl p-4">
                            <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                              📋 {t("leads.activity")} ({(lead.activity || []).length})
                            </h4>
                            {(lead.activity || []).length === 0 ? (
                              <p className="text-gray-500 text-sm">{t("leads.noActivity")}</p>
                            ) : (
                              <div className="space-y-2 max-h-64 overflow-auto">
                                {(lead.activity || []).map((item) => (
                                  <div key={item.id} className="bg-white p-3 rounded border text-sm">
                                    <p>{item.text}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {formatDate(item.createdAt)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
