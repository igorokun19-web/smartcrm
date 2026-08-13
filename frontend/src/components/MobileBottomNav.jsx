import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, CheckSquare, Plus, Phone, MessageCircle, X } from "lucide-react";
import { useCrm } from "../context/CrmContext";

const NAV_ITEMS = [
  { path: "/dashboard", icon: LayoutDashboard, label: "דשבורד" },
  { path: "/leads",     icon: Users,           label: "לידים"   },
  { path: "/tasks",     icon: CheckSquare,     label: "משימות"  },
];

function QuickLeadForm({ onClose }) {
  const { addLead } = useCrm();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const nameRef = useRef(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  function handleSave() {
    if (!name.trim() || !phone.trim()) return;
    addLead({ name: name.trim(), phone: phone.trim() });
    onClose();
  }

  return (
    <div className="p-4 space-y-3">
      <p className="font-bold text-slate-800 text-base">ליד חדש</p>
      <input
        ref={nameRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="שם"
        className="w-full border rounded-xl px-3 py-2.5 text-right text-sm focus:outline-none focus:border-indigo-500"
      />
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="טלפון"
        type="tel"
        className="w-full border rounded-xl px-3 py-2.5 text-right text-sm focus:outline-none focus:border-indigo-500"
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
      />
      <button
        onClick={handleSave}
        disabled={!name.trim() || !phone.trim()}
        className="w-full bg-indigo-600 disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-xl text-sm transition"
      >
        שמור ליד
      </button>
    </div>
  );
}

function QuickContactList({ mode, onClose }) {
  const { leads } = useCrm();
  const recent = leads.slice(0, 8);

  return (
    <div className="p-4">
      <p className="font-bold text-slate-800 text-base mb-3">
        {mode === "call" ? "📞 חיוג מהיר" : "💬 WhatsApp מהיר"}
      </p>
      {recent.length === 0 && <p className="text-sm text-slate-400 text-center py-4">אין לידים</p>}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {recent.map((lead) => (
          <a
            key={lead.id}
            href={mode === "call"
              ? `tel:${lead.phone}`
              : `https://wa.me/972${(lead.phone || "").replace(/\D/g, "").slice(-9)}`
            }
            target={mode === "wa" ? "_blank" : undefined}
            rel="noreferrer"
            onClick={onClose}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl border hover:bg-indigo-50 hover:border-indigo-200 transition"
          >
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-800">{lead.name}</p>
              <p className="text-xs text-slate-400">{lead.phone}</p>
            </div>
            {mode === "call"
              ? <Phone size={16} className="text-indigo-500 shrink-0" />
              : <MessageCircle size={16} className="text-green-500 shrink-0" />
            }
          </a>
        ))}
      </div>
    </div>
  );
}

export default function MobileBottomNav() {
  // null | "new" | "call" | "wa"
  const [drawer, setDrawer] = useState(null);
  const navigate = useNavigate();
  const overlayRef = useRef(null);

  function close() { setDrawer(null); }

  // Close drawer on outside tap
  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) close();
  }

  return (
    <>
      {/* Bottom nav bar — mobile only */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 flex items-center justify-around px-2 h-16 shadow-lg"
        dir="rtl"
      >
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition ${
                isActive ? "text-indigo-600" : "text-slate-500"
              }`
            }
          >
            <Icon size={22} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}

        {/* Centre action button */}
        <button
          onClick={() => setDrawer((d) => d ? null : "menu")}
          className="flex flex-col items-center gap-0.5 px-3 py-1 text-slate-500"
          aria-label="פעולות מהירות"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
            <Plus size={22} className="text-white" />
          </div>
        </button>
      </nav>

      {/* Drawer overlay + sheet — mobile only */}
      {drawer && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          className="md:hidden fixed inset-0 bg-black/40 z-50 flex items-end"
        >
          <div className="w-full bg-white rounded-t-2xl shadow-xl" dir="rtl">
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            {/* Close button */}
            <button onClick={close} className="absolute top-3 left-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>

            {/* Content */}
            {drawer === "menu" && (
              <div className="p-4 space-y-2 pb-8">
                <p className="font-bold text-slate-700 text-sm mb-3 text-center">פעולה מהירה</p>
                <button
                  onClick={() => setDrawer("new")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border hover:bg-indigo-50 hover:border-indigo-200 transition"
                >
                  <Plus size={18} className="text-indigo-500" />
                  <span className="text-sm font-medium">ליד חדש</span>
                </button>
                <button
                  onClick={() => setDrawer("wa")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border hover:bg-green-50 hover:border-green-200 transition"
                >
                  <MessageCircle size={18} className="text-green-500" />
                  <span className="text-sm font-medium">WhatsApp מהיר</span>
                </button>
                <button
                  onClick={() => setDrawer("call")}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border hover:bg-blue-50 hover:border-blue-200 transition"
                >
                  <Phone size={18} className="text-blue-500" />
                  <span className="text-sm font-medium">חיוג ישיר</span>
                </button>
              </div>
            )}

            {drawer === "new" && (
              <QuickLeadForm onClose={close} />
            )}

            {(drawer === "call" || drawer === "wa") && (
              <QuickContactList mode={drawer} onClose={close} />
            )}

            {/* Bottom safe-area padding */}
            <div className="h-safe-bottom pb-4" />
          </div>
        </div>
      )}
    </>
  );
}
