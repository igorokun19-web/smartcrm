import { ArrowLeft, BarChart3, CheckCircle2, LayoutDashboard, MessageCircle, MousePointerClick, ShieldCheck, Users } from "lucide-react";

const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || "";
const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || "").replace(/\D/g, "");
const demoUrl = import.meta.env.VITE_BOOK_DEMO_URL || "/login";

function CtaLink({ href, children, secondary = false }) {
  const baseClass = secondary
    ? "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
    : "bg-emerald-500 text-white hover:bg-emerald-600";

  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${baseClass}`}
    >
      {children}
    </a>
  );
}

export default function Landing() {
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("היי, ראיתי את SmartCRM ואני רוצה לשמוע עוד")}`
    : demoUrl;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#e0f2fe,transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#ffffff_100%)] text-slate-900" dir="rtl">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-sky-700">SmartCRM</p>
          <p className="mt-1 text-sm text-slate-600">עמוד שיווקי מהיר לפרסום בפייסבוק</p>
        </div>
        <a href="/login" className="text-sm font-semibold text-slate-700 underline-offset-4 hover:underline">
          כניסה למערכת
        </a>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-6">
        <section className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm text-sky-800 shadow-sm ring-1 ring-sky-100">
              <MousePointerClick size={16} />
              מתאים לפרסום מהיר ולבדיקת עניין מהפייסבוק
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight text-slate-950 md:text-6xl">
              מפסיקים לאבד לידים בין וואטסאפ, אקסל והודעות.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              SmartCRM מרכזת לידים, לקוחות ומעקב במקום אחד. פחות בלגן, פחות פניות שנופלות בין הכיסאות, ויותר סדר לצוות שמוכר ומשרת לקוחות.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href={whatsappHref}>
                <MessageCircle size={18} />
                בקשת הדגמה
              </CtaLink>
              <CtaLink href="#features" secondary>
                לראות מה מקבלים
                <ArrowLeft size={18} />
              </CtaLink>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["ניהול לידים", "כל הפניות במקום אחד"],
                ["מעקב סטטוסים", "יודעים בדיוק מי בטיפול"],
                ["תזכורות לצוות", "לא שוכחים לחזור ללקוח"],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-2xl bg-white/85 p-4 shadow-sm ring-1 ring-slate-200">
                  <p className="font-bold text-slate-900">{title}</p>
                  <p className="mt-1 text-sm text-slate-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-sky-200 via-cyan-100 to-emerald-100 blur-3xl opacity-70" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-slate-950 p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">Live Workflow</p>
                  <p className="mt-2 text-2xl font-bold">פחות כאב ראש, יותר שליטה</p>
                </div>
                <LayoutDashboard className="text-emerald-300" size={28} />
              </div>

              <div className="mt-6 space-y-4">
                {[
                  ["ליד חדש", "נכנס מהפייסבוק ומקבל סטטוס מיידי"],
                  ["שיחת המשך", "תזכורת אוטומטית כדי שלא תפספסו"],
                  ["הצעת מחיר", "רואים מי חם ומי צריך מעקב נוסף"],
                  ["סגירת עסקה", "מעבירים את הלקוח לשלב הבא בצורה מסודרת"],
                ].map(([title, desc]) => (
                  <div key={title} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-emerald-300" />
                      <p className="font-semibold">{title}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mt-24">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-sky-700">למה זה עובד</p>
            <h2 className="mt-3 text-3xl font-black text-slate-950 md:text-4xl">בעלי עסקים לא צריכים עוד כלי. הם צריכים סדר בתהליך.</h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: <Users className="text-sky-700" size={24} />,
                title: "ניהול לקוחות פשוט",
                desc: "מקום אחד לכל ליד, לקוח, סטטוס והערת מעקב.",
              },
              {
                icon: <BarChart3 className="text-sky-700" size={24} />,
                title: "רואים מה קורה",
                desc: "יודעים כמה פניות נכנסו, איפה הן נתקעות, ומה נסגר.",
              },
              {
                icon: <MessageCircle className="text-sky-700" size={24} />,
                title: "חוזרים בזמן",
                desc: "תזכורות מסודרות כדי שלא תאבדו פנייה חמה.",
              },
              {
                icon: <ShieldCheck className="text-sky-700" size={24} />,
                title: "מוכן לצמיחה",
                desc: "מתאים לשלב בדיקת עניין וגם לעסק שרוצה להתארגן נכון.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex rounded-2xl bg-sky-50 p-3">{item.icon}</div>
                <h3 className="text-xl font-bold text-slate-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-24 grid gap-6 lg:grid-cols-3">
          {[
            ["שיפוצניקים ובעלי מקצוע", "לעקוב אחרי פניות, הצעות מחיר ולקוחות שלא חזרו אליהם."],
            ["נותני שירות", "לרכז לידים, שירות ומשימות בלי להתפזר על פני כמה כלים."],
            ["סוכנויות ומשרדים קטנים", "לסדר תהליך מכירה בסיסי לפני שמאבדים פניות יקרות."],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
              <p className="text-lg font-bold">{title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{desc}</p>
            </div>
          ))}
        </section>

        <section className="mt-24 rounded-[2rem] bg-gradient-to-r from-sky-900 via-slate-900 to-emerald-900 px-6 py-10 text-white shadow-2xl md:px-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-300">קריאה לפעולה</p>
              <h2 className="mt-3 text-3xl font-black md:text-4xl">רוצים לראות אם זה מתאים לעסק שלכם?</h2>
              <p className="mt-4 text-base leading-8 text-slate-200">
                שלחו הודעה, בקשו הדגמה, או התחילו משיחה קצרה. המטרה בשלב הזה היא לבדוק עניין מהר, בלי להעמיס מערכת מלאה ובלי להתחייב לשרת בתשלום.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <CtaLink href={whatsappHref}>
                <MessageCircle size={18} />
                דברו איתי בוואטסאפ
              </CtaLink>
              {contactEmail ? (
                <CtaLink href={`mailto:${contactEmail}`} secondary>
                  שליחת מייל
                </CtaLink>
              ) : (
                <CtaLink href={demoUrl} secondary>
                  כניסה למערכת
                </CtaLink>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}