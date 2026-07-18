import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "myservices-leads";

const CrmContext = createContext(null);

function createId() {
  return Date.now() + Math.floor(Math.random() * 100000);
}

function nowIso() {
  return new Date().toISOString();
}

export function formatDate(value) {
  if (!value) return "";

  try {
    return new Date(value).toLocaleString("he-IL");
  } catch {
    return value;
  }
}

export function getStatusLabel(status) {
  const labels = {
    New: "חדש",
    Contacted: "נוצר קשר",
    Quoted: "הצעת מחיר",
    Won: "נסגר בהצלחה",
    Lost: "אבוד",
  };

  return labels[status] || status || "חדש";
}

export function getPriorityLabel(priority) {
  if (priority === "High") return "גבוהה";
  if (priority === "Low") return "נמוכה";
  return "בינונית";
}

export function getPriorityClass(priority) {
  if (priority === "High") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  if (priority === "Low") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  return "bg-yellow-100 text-yellow-700 border-yellow-200";
}

// Lead Scoring System
export function calculateLeadScore(lead) {
  let score = 0;

  // Status scoring
  const statusScores = {
    Won: 100,
    Quoted: 75,
    Contacted: 50,
    New: 25,
    Lost: 0,
  };
  score += statusScores[lead.status] || 0;

  // Interaction scoring
  const interactions = (lead.tasks?.length || 0) + (lead.notes?.length || 0) + (lead.activity?.length || 0);
  score += Math.min(interactions * 5, 50);

  // Activity recency bonus (more recent = higher score)
  const daysSinceCreated = (Date.now() - new Date(lead.createdAt).getTime()) / (24 * 60 * 60 * 1000);
  if (daysSinceCreated < 7) score += 20;
  else if (daysSinceCreated < 30) score += 10;

  // Task completion bonus
  const completedTasks = lead.tasks?.filter(t => t.completed).length || 0;
  if (completedTasks > 0) score += 15;

  return Math.min(score, 100);
}

// Get lead quality tier
export function getLeadQuality(score) {
  if (score >= 90) return { label: "⭐ Excellent", color: "bg-green-500" };
  if (score >= 75) return { label: "⭐ Good", color: "bg-blue-500" };
  if (score >= 50) return { label: "⭐ Fair", color: "bg-yellow-500" };
  if (score >= 25) return { label: "⭐ Low", color: "bg-orange-500" };
  return { label: "⭐ Very Low", color: "bg-red-500" };
}

// Calculate pipeline statistics
export function getPipelineStats(leads) {
  const statuses = {
    New: { label: "חדש", color: "bg-yellow-500", count: 0 },
    Contacted: { label: "נוצר קשר", color: "bg-purple-500", count: 0 },
    Quoted: { label: "הצעת מחיר", color: "bg-blue-500", count: 0 },
    Won: { label: "נסגר בהצלחה", color: "bg-green-500", count: 0 },
    Lost: { label: "אבוד", color: "bg-red-500", count: 0 },
  };

  let totalValue = 0;
  const avgScore = leads.length ? leads.reduce((sum, l) => sum + calculateLeadScore(l), 0) / leads.length : 0;

  leads.forEach(lead => {
    if (statuses[lead.status]) {
      statuses[lead.status].count++;
      if (lead.status === "Won") totalValue += 5000;
      if (lead.status === "Quoted") totalValue += 2000;
    }
  });

  return { statuses, totalValue, avgScore };
}

function createActivity(type, text) {
  return {
    id: createId(),
    type,
    text,
    createdAt: nowIso(),
  };
}

function normalizeTask(task) {
  return {
    id: task.id || createId(),
    title: task.title || task.task || "משימה ללא כותרת",
    dueDate: task.dueDate || "",
    completed: Boolean(task.completed),
    priority: task.priority || "Medium",
    createdAt: task.createdAt || nowIso(),
  };
}

function normalizeLead(lead) {
  const notes = Array.isArray(lead.notes)
    ? lead.notes
    : lead.notes
    ? [
        {
          id: createId(),
          text: lead.notes,
          createdAt: nowIso(),
        },
      ]
    : [];

  const tasks = Array.isArray(lead.tasks)
    ? lead.tasks.map(normalizeTask)
    : lead.task
    ? [
        normalizeTask({
          title: lead.task,
          dueDate: lead.dueDate || "",
          completed: false,
          priority: lead.priority || "Medium",
        }),
      ]
    : [];

  const activity =
    Array.isArray(lead.activity) && lead.activity.length
      ? lead.activity
      : [createActivity("lead-created", "נוצר ליד חדש")];

  return {
    id: lead.id || createId(),
    name: lead.name || "",
    phone: lead.phone || "",
    email: lead.email || "",
    message: lead.message || "",
    status: lead.status || "New",
    createdAt: lead.createdAt || nowIso(),
    notes,
    tasks,
    activity,
  };
}

function loadLeads() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map(normalizeLead);
  } catch {
    return [];
  }
}

export function CrmProvider({ children }) {
  const [leads, setLeads] = useState(loadLeads);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  // Keep multiple tabs/windows in sync with each other.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key === STORAGE_KEY) {
        setLeads(loadLeads());
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updateLead = useCallback((leadId, updater) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? normalizeLead(updater(lead)) : lead))
    );
  }, []);

  const addLead = useCallback(({ name, phone, email = "", message = "" }) => {
    const newLead = normalizeLead({
      id: createId(),
      name,
      phone,
      email,
      message,
      status: "New",
      createdAt: nowIso(),
      notes: [],
      tasks: [],
      activity: [createActivity("lead-created", "נוצר ליד חדש")],
    });

    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  }, []);

  const editLeadDetails = useCallback(
    (leadId, { name, phone, email = "", message = "" }) => {
      updateLead(leadId, (lead) => ({
        ...lead,
        name,
        phone,
        email,
        message,
        activity: [
          createActivity("lead-updated", "פרטי הליד עודכנו"),
          ...(lead.activity || []),
        ],
      }));
    },
    [updateLead]
  );

  const deleteLead = useCallback((leadId) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
  }, []);

  const changeStatus = useCallback(
    (leadId, status) => {
      updateLead(leadId, (lead) => {
        if (lead.status === status) return lead;

        return {
          ...lead,
          status,
          activity: [
            createActivity(
              "status-changed",
              `הסטטוס שונה ל-${getStatusLabel(status)}`
            ),
            ...(lead.activity || []),
          ],
        };
      });
    },
    [updateLead]
  );

  const addNote = useCallback(
    (leadId, text) => {
      updateLead(leadId, (lead) => {
        const newNote = { id: createId(), text, createdAt: nowIso() };

        return {
          ...lead,
          notes: [newNote, ...(lead.notes || [])],
          activity: [
            createActivity("note-added", `נוספה הערה: ${text}`),
            ...(lead.activity || []),
          ],
        };
      });
    },
    [updateLead]
  );

  const deleteNote = useCallback(
    (leadId, noteId) => {
      updateLead(leadId, (lead) => {
        const noteToDelete = (lead.notes || []).find((note) => note.id === noteId);

        return {
          ...lead,
          notes: (lead.notes || []).filter((note) => note.id !== noteId),
          activity: [
            createActivity("note-deleted", `נמחקה הערה: ${noteToDelete?.text || ""}`),
            ...(lead.activity || []),
          ],
        };
      });
    },
    [updateLead]
  );

  const addTask = useCallback(
    (leadId, taskData) => {
      updateLead(leadId, (lead) => {
        const newTask = normalizeTask({ ...taskData, completed: false });

        return {
          ...lead,
          tasks: [newTask, ...(lead.tasks || [])],
          activity: [
            createActivity("task-added", `נוספה משימה: ${newTask.title}`),
            ...(lead.activity || []),
          ],
        };
      });
    },
    [updateLead]
  );

  const toggleTask = useCallback(
    (leadId, taskId) => {
      updateLead(leadId, (lead) => {
        const task = (lead.tasks || []).find((t) => t.id === taskId);
        if (!task) return lead;

        const nextCompleted = !task.completed;

        return {
          ...lead,
          tasks: (lead.tasks || []).map((t) =>
            t.id === taskId ? { ...t, completed: nextCompleted } : t
          ),
          activity: [
            createActivity(
              nextCompleted ? "task-completed" : "task-reopened",
              nextCompleted
                ? `הושלמה משימה: ${task.title}`
                : `משימה נפתחה מחדש: ${task.title}`
            ),
            ...(lead.activity || []),
          ],
        };
      });
    },
    [updateLead]
  );

  const deleteTask = useCallback(
    (leadId, taskId) => {
      updateLead(leadId, (lead) => {
        const taskToDelete = (lead.tasks || []).find((t) => t.id === taskId);

        return {
          ...lead,
          tasks: (lead.tasks || []).filter((t) => t.id !== taskId),
          activity: [
            createActivity("task-deleted", `נמחקה משימה: ${taskToDelete?.title || ""}`),
            ...(lead.activity || []),
          ],
        };
      });
    },
    [updateLead]
  );

  const editTask = useCallback(
    (leadId, taskId, data) => {
      updateLead(leadId, (lead) => ({
        ...lead,
        tasks: (lead.tasks || []).map((t) =>
          t.id === taskId ? { ...t, ...data } : t
        ),
        activity: [
          createActivity("task-updated", `המשימה עודכנה: ${data.title || ""}`),
          ...(lead.activity || []),
        ],
      }));
    },
    [updateLead]
  );

  const customers = leads.filter((lead) => lead.status === "Won");

  const value = {
    leads,
    customers,
    addLead,
    editLeadDetails,
    deleteLead,
    changeStatus,
    addNote,
    deleteNote,
    addTask,
    toggleTask,
    deleteTask,
    editTask,
  };

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const context = useContext(CrmContext);

  if (!context) {
    throw new Error("useCrm must be used within a CrmProvider");
  }

  return context;
}
