import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Users, UserCheck, CheckSquare, Package, FileText } from "lucide-react";

const ACTIONS = [
  { label: "ליד חדש",      Icon: Users,       path: "/leads",    state: { openNew: true } },
  { label: "לקוח חדש",     Icon: UserCheck,   path: "/customers", state: { openNew: true } },
  { label: "משימה חדשה",   Icon: CheckSquare, path: "/tasks",    state: { openNew: true } },
  { label: "שירות חדש",    Icon: Package,     path: "/services", state: { openNew: true } },
  { label: "חשבונית חדשה", Icon: FileText,    path: "/invoices", state: { openNew: true } },
];

export default function GlobalFAB() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  function handleAction(action) {
    setOpen(false);
    navigate(action.path, { state: action.state });
  }

  return (
    <div ref={ref} className="hidden md:flex fixed bottom-6 left-6 z-50 flex-col-reverse items-start gap-2">
      {/* Action items — appear above the FAB */}
      {open && (
        <div className="flex flex-col-reverse gap-2 mb-2">
          {ACTIONS.map((action) => (
            <button
              key={action.path + action.label}
              onClick={() => handleAction(action)}
              className="flex items-center gap-2.5 bg-white text-slate-800 text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg border border-slate-200 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition whitespace-nowrap"
            >
              <action.Icon size={15} className="shrink-0 text-indigo-500" />
              {action.label}
            </button>
          ))}
        </div>
      )}

      {/* FAB trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "סגור תפריט" : "צור חדש"}
        aria-expanded={open}
        className={`flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          open
            ? "bg-slate-700 hover:bg-slate-800 rotate-45"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {open ? <X size={22} className="text-white" /> : <Plus size={24} className="text-white" />}
      </button>
    </div>
  );
}
