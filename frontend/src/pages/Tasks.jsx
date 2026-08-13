import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, CheckCircle2, Edit3, Trash2, AlertTriangle, Bell } from "lucide-react";
import { useCrm, getPriorityLabel } from "../context/CrmContext";

const kpiCard =
  "rounded-xl border p-4 bg-white shadow-sm";

// Computes smart alerts from leads data
function useAlerts(leads) {
  const today = new Date().toISOString().split("T")[0];
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const noNextAction = leads.filter(
    (l) => l.status !== "Won" && l.status !== "Lost" &&
      !(l.tasks || []).some((t) => !t.completed)
  );

  const unhandledQuotes = leads.filter(
    (l) => l.status === "Quoted" &&
      !(l.tasks || []).some((t) => !t.completed)
  );

  const dormant = leads.filter(
    (l) => l.status !== "Won" && l.status !== "Lost" &&
      new Date(l.createdAt) < new Date(threeDaysAgo) &&
      (l.activity || []).every((a) => new Date(a.createdAt || a.timestamp) < new Date(threeDaysAgo)) &&
      (l.notes || []).length === 0
  );

  return { noNextAction, unhandledQuotes, dormant };
}

function AlertsPanel({ leads, onNavigate }) {
  const { noNextAction, unhandledQuotes, dormant } = useAlerts(leads);
  const total = noNextAction.length + unhandledQuotes.length + dormant.length;
  if (total === 0) return null;

  const groups = [
    {
      key: "noAction",
      icon: "⚡",
      label: "לידים ללא פעולה הבאה",
      items: noNextAction,
      color: "text-amber-700",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      key: "quotes",
      icon: "📋",
      label: "הצעות מחיר ללא מעקב",
      items: unhandledQuotes,
      color: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      key: "dormant",
      icon: "😴",
      label: "לידים ללא פעילות (3+ ימים)",
      items: dormant,
      color: "text-gray-700",
      bg: "bg-gray-50",
      border: "border-gray-200",
    },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="rounded-xl border border-rose-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 bg-rose-50 border-b border-rose-200 flex items-center gap-2">
        <Bell size={15} className="text-rose-600" />
        <p className="text-sm font-bold text-rose-700">התרעות — {total} לידים דורשים תשומת לב</p>
      </div>
      <div className="divide-y divide-neutral-100">
        {groups.map((group) =>
          group.items.map((lead) => (
            <button
              key={group.key + lead.id}
              onClick={() => onNavigate("/leads")}
              className={`w-full flex items-center justify-between px-4 py-2.5 hover:${group.bg} transition text-right`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{group.icon}</span>
                <div>
                  <span className={`text-sm font-semibold ${group.color}`}>{lead.name}</span>
                  <span className="text-xs text-neutral-400 mr-2">{lead.phone}</span>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${group.bg} ${group.border} ${group.color}`}>
                {group.label}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function KanbanColumn({ title, icon, tasks, onComplete, onReopen, onDelete, onEdit, taskCount, bgColor }) {
  return (
    <div className="flex flex-col bg-gray-50 rounded-lg overflow-hidden" style={{ minHeight: "600px" }}>
      {/* Column Header */}
      <div className={`${bgColor} text-white p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-sm opacity-90">{taskCount} משימות</p>
          </div>
        </div>
      </div>

      {/* Tasks Container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
            אין משימות
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={`${task.leadId}-${task.id}`}
              task={task}
              onComplete={onComplete}
              onReopen={onReopen}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}

function KanbanCard({ task, onComplete, onReopen, onDelete, onEdit }) {
  const priorityColors = {
    High: "bg-red-100 border-l-4 border-red-500",
    Medium: "bg-amber-100 border-l-4 border-amber-500",
    Low: "bg-green-100 border-l-4 border-green-500",
  };

  const priorityDotColors = {
    High: "bg-red-500",
    Medium: "bg-amber-500",
    Low: "bg-green-500",
  };

  const priority = task.priority || "Medium";
  const bgClass = priorityColors[priority] || priorityColors["Medium"];
  const dotClass = priorityDotColors[priority] || priorityDotColors["Medium"];

  return (
    <div className={`rounded-lg p-3 shadow transition hover:shadow-md ${bgClass}`}>
      {/* Priority Indicator */}
      <div className="flex items-start gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${dotClass} mt-1.5 flex-shrink-0`}></div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm text-gray-800 truncate">
            {task.title}
          </h4>
          <p className="text-xs text-gray-600 mt-1">
            {task.leadName}
          </p>
        </div>
      </div>

      {/* Date & Priority */}
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-3 flex-wrap">
        {task.dueDate && (
          <span className="flex items-center gap-1 bg-white/60 rounded px-2 py-1">
            <Calendar size={12} />
            {new Date(task.dueDate).toLocaleDateString("he-IL")}
          </span>
        )}
        <span className={`px-2 py-1 rounded text-white font-medium text-xs ${
          priority === "High" ? "bg-red-500" : priority === "Low" ? "bg-green-500" : "bg-amber-500"
        }`}>
          {getPriorityLabel(priority)}
        </span>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2 mb-3">
        {task.completed ? (
          <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            <CheckCircle2 size={14} />
            הושלם
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            <Clock size={14} />
            פתוח
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-white/30">
        {!task.completed ? (
          <button
            onClick={() => onComplete(task.id, task.leadId)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs py-1 rounded transition flex items-center justify-center gap-1"
            title="הושלם"
          >
            <CheckCircle2 size={14} />
            הושלם
          </button>
        ) : (
          <button
            onClick={() => onReopen(task.id, task.leadId)}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-1 rounded transition flex items-center justify-center gap-1"
            title="פתח מחדש"
          >
            <Clock size={14} />
            פתח
          </button>
        )}
        
        <button
          onClick={() => onEdit(task)}
          className="px-2 bg-blue-500 hover:bg-blue-600 text-white py-1 rounded transition"
          title="ערוך"
        >
          <Edit3 size={14} />
        </button>
        
        <button
          onClick={() => onDelete(task.id, task.leadId)}
          className="px-2 bg-red-500 hover:bg-red-600 text-white py-1 rounded transition"
          title="מחק"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { leads, toggleTask, deleteTask: deleteTaskFromContext, editTask } = useCrm();
  const navigate = useNavigate();

  const [editingTask, setEditingTask] = useState(null);

  const [editForm, setEditForm] = useState({
    title: "",
    dueDate: "",
    priority: "Medium",
  });

  const allTasks = leads.flatMap((lead) =>
    (lead.tasks || []).map((task) => ({
      ...task,
      priority: task.priority || "Medium",
      leadId: lead.id,
      leadName: lead.name,
    }))
  );

  const today = new Date().toISOString().split("T")[0];

  const overdueTasks = allTasks.filter(
    (task) =>
      !task.completed &&
      task.dueDate &&
      task.dueDate < today
  );

  const todayTasks = allTasks.filter(
    (task) =>
      !task.completed &&
      task.dueDate === today
  );

  const upcomingTasks = allTasks.filter(
    (task) =>
      !task.completed &&
      task.dueDate &&
      task.dueDate > today
  );

  const noDateTasks = allTasks.filter(
    (task) =>
      !task.completed &&
      !task.dueDate
  );

  const completedTasks = allTasks.filter(
    (task) => task.completed
  );

  const openTasks = allTasks.filter(
    (task) => !task.completed
  );

  const completeTask = (taskId, leadId) => {
    toggleTask(leadId, taskId);
  };

  const reopenTask = (taskId, leadId) => {
    toggleTask(leadId, taskId);
  };

  const deleteTask = (taskId, leadId) => {
    deleteTaskFromContext(leadId, taskId);
  };

  const openEditModal = (task) => {
    setEditingTask(task);

    setEditForm({
      title: task.title || "",
      dueDate: task.dueDate || "",
      priority: task.priority || "Medium",
    });
  };

  const closeEditModal = () => {
    setEditingTask(null);

    setEditForm({
      title: "",
      dueDate: "",
      priority: "Medium",
    });
  };

  const saveEditedTask = () => {
    if (!editingTask) return;

    editTask(editingTask.leadId, editingTask.id, {
      title: editForm.title.trim(),
      dueDate: editForm.dueDate,
      priority: editForm.priority,
    });

    closeEditModal();
  };

  return (
    <div className="p-6 space-y-8" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">משימות</h1>
      </div>

      {/* Smart alerts */}
      <AlertsPanel leads={leads} onNavigate={navigate} />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`${kpiCard} bg-slate-50`}>
          <p className="text-sm text-gray-600 mb-1">סה״כ משימות</p>
          <p className="text-3xl font-bold">{allTasks.length}</p>
          <p className="text-xs text-gray-500 mt-2">בכל הלידים</p>
        </div>

        <div className={`${kpiCard} bg-red-50`}>
          <p className="text-sm text-gray-600 mb-1">🔴 באיחור</p>
          <p className="text-3xl font-bold text-red-600">{overdueTasks.length}</p>
          <p className="text-xs text-gray-500 mt-2">דחוף!</p>
        </div>

        <div className={`${kpiCard} bg-yellow-50`}>
          <p className="text-sm text-gray-600 mb-1">🟡 להיום</p>
          <p className="text-3xl font-bold text-yellow-600">{todayTasks.length}</p>
          <p className="text-xs text-gray-500 mt-2">עד סיום היום</p>
        </div>

        <div className={`${kpiCard} bg-blue-50`}>
          <p className="text-sm text-gray-600 mb-1">🔵 עדיין פתוח</p>
          <p className="text-3xl font-bold text-blue-600">{openTasks.length}</p>
          <p className="text-xs text-gray-500 mt-2">לא הושלם</p>
        </div>

        <div className={`${kpiCard} bg-green-50`}>
          <p className="text-sm text-gray-600 mb-1">✅ הושלם</p>
          <p className="text-3xl font-bold text-green-600">{completedTasks.length}</p>
          <p className="text-xs text-gray-500 mt-2">עד כה</p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-4 pb-8">
        {/* Overdue Column */}
        <KanbanColumn
          title="באיחור"
          icon="🔴"
          color="red"
          bgColor="bg-red-500"
          tasks={overdueTasks}
          taskCount={overdueTasks.length}
          onComplete={completeTask}
          onReopen={reopenTask}
          onDelete={deleteTask}
          onEdit={openEditModal}
        />

        {/* Today Column */}
        <KanbanColumn
          title="להיום"
          icon="🟡"
          color="yellow"
          bgColor="bg-yellow-500"
          tasks={todayTasks}
          taskCount={todayTasks.length}
          onComplete={completeTask}
          onReopen={reopenTask}
          onDelete={deleteTask}
          onEdit={openEditModal}
        />

        {/* Upcoming Column */}
        <KanbanColumn
          title="עתידיות"
          icon="🔵"
          color="blue"
          bgColor="bg-blue-500"
          tasks={upcomingTasks}
          taskCount={upcomingTasks.length}
          onComplete={completeTask}
          onReopen={reopenTask}
          onDelete={deleteTask}
          onEdit={openEditModal}
        />

        {/* No Date Column */}
        <KanbanColumn
          title="ללא תאריך"
          icon="⚪"
          color="gray"
          bgColor="bg-slate-500"
          tasks={noDateTasks}
          taskCount={noDateTasks.length}
          onComplete={completeTask}
          onReopen={reopenTask}
          onDelete={deleteTask}
          onEdit={openEditModal}
        />

        {/* Completed Column */}
        <KanbanColumn
          title="הושלם"
          icon="✅"
          color="green"
          bgColor="bg-green-500"
          tasks={completedTasks}
          taskCount={completedTasks.length}
          onComplete={completeTask}
          onReopen={reopenTask}
          onDelete={deleteTask}
          onEdit={openEditModal}
        />
      </div>

      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              עריכת משימה
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  כותרת משימה
                </label>

                <input
                  type="text"
                  value={editForm.title}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      title: event.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="כותרת המשימה"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  תאריך יעד
                </label>

                <input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      dueDate: event.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  דחיפות
                </label>

                <select
                  value={editForm.priority}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      priority: event.target.value,
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="High">
                    גבוהה
                  </option>

                  <option value="Medium">
                    בינונית
                  </option>

                  <option value="Low">
                    נמוכה
                  </option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={saveEditedTask}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                שמור שינויים
              </button>

              <button
                onClick={closeEditModal}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}