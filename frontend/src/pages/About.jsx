import { Building2, Heart, Zap, Users, Award, Mail, Phone, MapPin, FileText } from "lucide-react";
import { useState, useEffect } from "react";

export default function About() {
  const [companyInfo, setCompanyInfo] = useState({
    name: "MyServices CRM",
    email: "info@myservices.com",
    phone: "050-123-4567",
    address: "תל אביב, ישראל"
  });

  useEffect(() => {
    const saved = localStorage.getItem("companyInfo");
    if (saved) {
      const data = JSON.parse(saved);
      setCompanyInfo({
        name: data.name || "MyServices CRM",
        email: data.email || "info@myservices.com",
        phone: data.phone || "050-123-4567",
        address: data.address || "תל אביב, ישראל"
      });
    }
  }, []);
  return (
    <div className="space-y-8 max-w-5xl mx-auto p-6" dir="rtl">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-3">🚀 MyServices CRM</h1>
        <p className="text-xl text-gray-600">מערכת ניהול לידים חכמה לנותני שירות</p>
        <p className="text-sm text-gray-500 mt-2">גרסה 1.0 | 2026</p>
      </div>

      {/* Created By */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-8">
        <div className="flex items-center gap-3 mb-4">
          <Building2 size={32} className="text-blue-600" />
          <h2 className="text-2xl font-bold">👨‍💻 מי יצר את זה?</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">יוצר האפליקציה:</p>
            <p className="text-lg font-bold">🤖 GitHub Copilot (AI Assistant)</p>
            <p className="text-sm text-gray-700 mt-1">בשיתוף פעולה עם Microsoft AI</p>
          </div>

          <div className="border-t border-blue-200 pt-4">
            <p className="text-sm text-gray-600 mb-1">תאריך יצירה:</p>
            <p className="text-lg font-bold">📅 יולי 2026</p>
          </div>

          <div className="border-t border-blue-200 pt-4">
            <p className="text-sm text-gray-600 mb-1">טכנולוגיה:</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">⚛️ React 19</span>
              <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">🎨 Tailwind CSS</span>
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">📦 Vite</span>
              <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm">📊 Recharts</span>
              <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">🔥 Firebase</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Zap size={28} className="text-yellow-500" />
          ✨ הפיצ'רים החשובים
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: "📊", title: "דשבורד חכם", desc: "KPIs וגרפים בזמן אמת" },
            { icon: "👥", title: "ניהול לידים", desc: "ניקוד, סטטוסים, וניתוח" },
            { icon: "🏗️", title: "צינור מכירות", desc: "ויזואליזציה של שלבי מכירה" },
            { icon: "🤝", title: "ניתוח לקוחות", desc: "סגמנטציה וLifetime Value" },
            { icon: "✅", title: "Kanban Board", desc: "ניהול משימות וטודו" },
            { icon: "💬", title: "WhatsApp", desc: "שליחה ישירה ללקוחות" },
            { icon: "💵", title: "חשבוניות", desc: "יצירה וניהול פשוט" },
            { icon: "📈", title: "דוחות", desc: "ניתוח מעמיק וייצוא" },
            { icon: "📱", title: "PWA Ready", desc: "אפליקציה לנייד" },
            { icon: "⚙️", title: "Customizable", desc: "הגדרות אישיות" },
            { icon: "🔄", title: "Cloud Sync", desc: "סנכרון על ענן" },
            { icon: "🔐", title: "Secure", desc: "בטוח ודחוס" },
          ].map((feature, idx) => (
            <div key={idx} className="bg-white rounded-lg border p-4 hover:shadow-lg transition">
              <p className="text-2xl mb-2">{feature.icon}</p>
              <h3 className="font-bold">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Licensing & Sales */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Award size={32} className="text-green-600" />
          <h2 className="text-2xl font-bold">💼 עבור נותני שירות</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <FileText size={20} /> 📜 רישיון השימוש
            </h3>
            <p className="text-gray-700 mb-3">
              MyServices CRM היא אפליקציה מקצועית המיועדת לנותני שירות (אנשי מקצוע).
            </p>
            <ul className="list-disc mr-6 space-y-2 text-sm text-gray-700">
              <li>✅ <strong>כל אפליקציה יכולה להיות מכך בנפרד לכל איש שירות</strong></li>
              <li>✅ רישיון בחינם לשימוש אישי</li>
              <li>✅ אפשרות למכירה לעסקים אחרים</li>
              <li>✅ שינוי הצבע/לוגו בהתאם לחברה</li>
              <li>✅ הוסטינג משלך או שלנו</li>
            </ul>
          </div>

          <div className="border-t border-green-300 pt-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Users size={20} /> 👔 עבור מי?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="font-bold mb-2">🔨 בנאים</p>
                <p className="text-sm text-gray-700">ניהול לידים של עבודות בנייה</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="font-bold mb-2">🎨 קבלנים</p>
                <p className="text-sm text-gray-700">ניהול כל סוגי העבודות</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="font-bold mb-2">🔌 חשמלאים</p>
                <p className="text-sm text-gray-700">ניהול משימות וחשבוניות</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="font-bold mb-2">🔧 טכנאים</p>
                <p className="text-sm text-gray-700">ניתוח ביצועים</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="font-bold mb-2">🚗 מכונאים</p>
                <p className="text-sm text-gray-700">עקבות עבודות חוזרות</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <p className="font-bold mb-2">💅 מעצבים</p>
                <p className="text-sm text-gray-700">ניהול פרויקטים</p>
              </div>
            </div>
          </div>

          <div className="border-t border-green-300 pt-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Zap size={20} /> 🚀 אפשרויות מכירה
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                <p className="font-bold">Option 1: רישיון בחינם</p>
                <p className="text-sm text-gray-700 mt-1">תן לכל אחד להשתמש בחינם ובנה קהילה</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                <p className="font-bold">Option 2: רישיון בתשלום</p>
                <p className="text-sm text-gray-700 mt-1">תשלום חודשי - $9, $19, $49 לפי הצורך</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                <p className="font-bold">Option 3: White Label</p>
                <p className="text-sm text-gray-700 mt-1">מכור את האפליקציה בשם שלך עם לוגו שלך</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                <p className="font-bold">Option 4: Custom</p>
                <p className="text-sm text-gray-700 mt-1">הוסף פיצ'רים חדשים לצרכים שלך</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Open Source */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-8">
        <div className="flex items-center gap-3 mb-4">
          <Heart size={28} className="text-red-500" />
          <h2 className="text-2xl font-bold">❤️ Open Source</h2>
        </div>

        <p className="text-gray-700 mb-4">
          האפליקציה הזאת נבנתה עם טכנולוגיות open source וניתנת להרחבה:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-lg border hover:shadow-lg transition">
            <p className="font-bold">⚛️ React</p>
            <p className="text-sm text-gray-600">ספרית UI מובילה</p>
          </a>
          <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-lg border hover:shadow-lg transition">
            <p className="font-bold">🎨 Tailwind CSS</p>
            <p className="text-sm text-gray-600">סטיילינג בעיצוב מודרני</p>
          </a>
          <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-lg border hover:shadow-lg transition">
            <p className="font-bold">📦 Vite</p>
            <p className="text-sm text-gray-600">בניית אפליקציה מהירה</p>
          </a>
          <a href="https://recharts.org" target="_blank" rel="noopener noreferrer" className="bg-white p-4 rounded-lg border hover:shadow-lg transition">
            <p className="font-bold">📊 Recharts</p>
            <p className="text-sm text-gray-600">ספרית תרשימים</p>
          </a>
        </div>

        <p className="text-sm text-indigo-700 bg-indigo-50 border border-indigo-200 rounded p-3">
          💡 <strong>כל הקוד זמין לשינוי והרחבה</strong> - שנה את הצבעים, הטקסט, הלוגו, והכל לפי הצרכים שלך!
        </p>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border-2 border-blue-300 p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Mail size={28} className="text-blue-600" />
          📞 צור קשר
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <Mail size={20} className="text-blue-600 mt-1" />
            <div>
              <p className="font-bold">דוא"ל</p>
              <p className="text-gray-700">{companyInfo.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Phone size={20} className="text-blue-600 mt-1" />
            <div>
              <p className="font-bold">טלפון/WhatsApp</p>
              <p className="text-gray-700">{companyInfo.phone}</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <MapPin size={20} className="text-blue-600 mt-1" />
            <div>
              <p className="font-bold">כתובת</p>
              <p className="text-gray-700">{companyInfo.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="font-bold mb-2">🎯 קבל הצעה מתואימה</p>
          <p className="text-sm text-gray-700">אם אתה איש שירות וחוזה לקנות את האפליקציה - כתוב לנו ואנחנו נעשה אתך דיל!</p>
        </div>
      </div>

      {/* Credits */}
      <div className="text-center py-6 border-t">
        <p className="text-sm text-gray-600">
          🙏 תודה שאתה משתמש ב-MyServices CRM
        </p>
        <p className="text-xs text-gray-500 mt-2">
          © 2026 MyServices CRM. Built with ❤️ by AI • All Rights Reserved
        </p>
        <p className="text-xs text-gray-400 mt-1">
          <strong>הערה:</strong> כל אפליקציה יכולה להיות מכרת בנפרד לנותני שירות עם שינוי שם ולוגו
        </p>
      </div>
    </div>
  );
}
