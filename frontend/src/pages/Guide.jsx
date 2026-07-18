import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, MessageCircle, TrendingUp, Users, BarChart3, CheckCircle, FileText, Settings, Zap } from "lucide-react";

export default function Guide() {
  const [expandedSection, setExpandedSection] = useState("dashboard");

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    {
      id: "dashboard",
      title: "📊 דשבורד",
      icon: TrendingUp,
      description: "תצוגה כללית של המערכת",
      content: `
        <div class="space-y-4">
          <p>הדשבורד הוא לב המערכת - כאן אתה רואה בבט חטף את כל הנתונים החשובים:</p>
          
          <h4 class="font-bold text-lg mt-3">📈 KPI Cards (4 כרטיסים):</h4>
          <ul class="list-disc mr-6 space-y-2">
            <li><strong>סה״כ לידים</strong> - מספר כל הלידים במערכת</li>
            <li><strong>עסקאות סגורות</strong> - כמה לידים סיימו כ"Won"</li>
            <li><strong>הצעות מחיר</strong> - כמה לידים בשלב "Quoted"</li>
            <li><strong>משימות פתוחות</strong> - משימות שעדיין לא סיימו</li>
          </ul>

          <h4 class="font-bold text-lg mt-3">📉 גרפים:</h4>
          <ul class="list-disc mr-6 space-y-2">
            <li><strong>טרנד לידים (7 ימים)</strong> - ראה כמה לידים נוצרו כל יום</li>
            <li><strong>התפלגות סטטוסים</strong> - ראה כם לידים בכל סטטוס</li>
          </ul>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p class="text-sm"><strong>💡 טיפ:</strong> בדוק את הדשבורד כל בוקר כדי לדעת מה המצב שלך</p>
          </div>
        </div>
      `
    },
    {
      id: "leads",
      title: "👥 ניהול לידים (Leads)",
      icon: Users,
      description: "הוסף וערוך לידים חדשים",
      content: `
        <div class="space-y-4">
          <h4 class="font-bold text-lg">➕ הוספת ליד חדש:</h4>
          <ol class="list-decimal mr-6 space-y-2">
            <li>מלא את השם</li>
            <li>הוסף מס' טלפון</li>
            <li>כתוב הודעה ראשונית (בקשה, סוג שירות, וכו')</li>
            <li>לחץ "הוסף ליד" - ה-ליד יופיע בטבלה</li>
          </ol>

          <h4 class="font-bold text-lg mt-4">🔍 חיפוש וסינון:</h4>
          <ul class="list-disc mr-6 space-y-2">
            <li><strong>חיפוש</strong> - חפש לפי שם, טלפון או הודעה</li>
            <li><strong>סנן לפי סטטוס</strong> - ראה רק לידים בסטטוס מסוים</li>
            <li><strong>מיין</strong> - סדר לפי שם, תאריך, סטטוס</li>
          </ul>

          <h4 class="font-bold text-lg mt-4">📱 סטטוסים:</h4>
          <ul class="list-disc mr-6 space-y-2">
            <li><span class="text-blue-600">🔵 חדש</span> - ליד בשלב ראשון</li>
            <li><span class="text-purple-600">🟣 נוצר קשר</span> - כבר דברנו איתו</li>
            <li><span class="text-pink-600">🟡 הצעת מחיר</span> - שלחנו הצעה</li>
            <li><span class="text-green-600">🟢 נסגר בהצלחה</span> - הלקוח קנה!</li>
            <li><span class="text-red-600">🔴 אבוד</span> - הליד לא יתממש</li>
          </ul>

          <h4 class="font-bold text-lg mt-4">💬 WhatsApp Integration:</h4>
          <p>לחץ על הכפתור הירוק 💚 ליד כל ליד ישלח הודעה ישירה ב-WhatsApp!</p>

          <h4 class="font-bold text-lg mt-4">📝 פרטים מורחבים:</h4>
          <ul class="list-disc mr-6 space-y-2">
            <li><strong>הערות</strong> - הוסף הערות חופשיות</li>
            <li><strong>משימות</strong> - צור משימות תזכורת</li>
            <li><strong>פעילות</strong> - ראה היסטוריה של כל הפעולות</li>
          </ul>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p class="text-sm"><strong>💡 טיפ:</strong> ניקוד הלידים (0-100 pts) מראה כמה קרוב הליד למכירה. ניקוד גבוה = ליד "חם"</p>
          </div>
        </div>
      `
    },
    {
      id: "pipeline",
      title: "🏗️ צינור מכירות (Pipeline)",
      icon: BarChart3,
      description: "חזויה עסקאות לפי שלבים",
      content: `
        <div class="space-y-4">
          <p>צפה בכל הלידים מסודרים לפי שלבי מכירה</p>

          <h4 class="font-bold text-lg mt-3">5 עמודות Pipeline:</h4>
          <div class="space-y-3">
            <div class="border-l-4 border-yellow-500 pl-3">
              <strong>חדש (New)</strong> - לידים שהוזנו עתה
            </div>
            <div class="border-l-4 border-purple-500 pl-3">
              <strong>נוצר קשר (Contacted)</strong> - כבר יצרנו קשר
            </div>
            <div class="border-l-4 border-blue-500 pl-3">
              <strong>הצעת מחיר (Quoted)</strong> - שלחנו הצעה
            </div>
            <div class="border-l-4 border-green-500 pl-3">
              <strong>נסגר (Won)</strong> - עסקה סגורה! 🎉
            </div>
            <div class="border-l-4 border-red-500 pl-3">
              <strong>אבוד (Lost)</strong> - הליד לא יתממש
            </div>
          </div>

          <h4 class="font-bold text-lg mt-4">📊 ניקוד לידים:</h4>
          <p>כל ליד מציג ניקוד 0-100 pts ואיכות (Excellent/Good/Fair/Low):</p>
          <ul class="list-disc mr-6 space-y-1 mt-2 text-sm">
            <li>90+ ⭐ Excellent</li>
            <li>75+ ⭐ Good</li>
            <li>50+ ⭐ Fair</li>
            <li>25+ ⭐ Low</li>
            <li>&lt;25 ⭐ Very Low</li>
          </ul>

          <h4 class="font-bold text-lg mt-4">🎯 המלצות AI:</h4>
          <p>לחץ על ליד לראות המלצות חכמות:</p>
          <ul class="list-disc mr-6 space-y-1 mt-2 text-sm">
            <li>"צרו קשר חדש" - לליד חם שלא התקשרנו אליו</li>
            <li>"שלחו הצעת מחיר" - לליד בשלב הבא</li>
            <li>"עקבו אחרי ההצעה" - לליד שחיכה הרבה זמן</li>
          </ul>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p class="text-sm"><strong>💡 טיפ:</strong> ניקוד לידים מחושב אוטומטית לפי: סטטוס, מס' משימות, הערות, פעילות וזמן</p>
          </div>
        </div>
      `
    },
    {
      id: "customers",
      title: "🤝 ניתוח לקוחות (Customers)",
      icon: Users,
      description: "ניתוח וסגמנטציה של לקוחות",
      content: `
        <div class="space-y-4">
          <p>כאן אתה רואה לקוחות מנוהלים וניתוח מעמיק על כל אחד</p>

          <h4 class="font-bold text-lg mt-3">👑 סגמנטציה (4 קבוצות):</h4>
          <div class="space-y-2">
            <div class="bg-purple-50 border border-purple-200 rounded p-2">
              <strong>👑 VIP</strong> - לקוחות שכבר קנו (סטטוס Won)
            </div>
            <div class="bg-green-50 border border-green-200 rounded p-2">
              <strong>⚡ פעילים</strong> - לקוחות בתהליך עם הרבה אינטראקציה
            </div>
            <div class="bg-orange-50 border border-orange-200 rounded p-2">
              <strong>⚠️ בסכנה</strong> - לקוחות שלא עדכנו הרבה זמן
            </div>
            <div class="bg-gray-50 border border-gray-200 rounded p-2">
              <strong>😴 לא פעילים</strong> - לקוחות ישנים שלא דברנו איתם
            </div>
          </div>

          <h4 class="font-bold text-lg mt-4">💰 Lifetime Value (LTV):</h4>
          <p>אומדן כמה כסף כל לקוח יביא לך בסך הכל:</p>
          <ul class="list-disc mr-6 space-y-1 mt-2 text-sm">
            <li><strong>Won לקוחות:</strong> 3x בסיס</li>
            <li><strong>+200₪</strong> לכל משימה</li>
            <li><strong>+100₪</strong> לכל הערה</li>
          </ul>

          <h4 class="font-bold text-lg mt-4">🔧 פעולות:</h4>
          <ul class="list-disc mr-6 space-y-2">
            <li>לחץ 💚 WhatsApp לשליחת הודעה ישירה</li>
            <li>לחץ חץ למטה לראות פרטים מלאים</li>
            <li>ראה משימות, הערות ופעילות של כל לקוח</li>
          </ul>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p class="text-sm"><strong>💡 טיפ:</strong> פקד את ה-VIP שלך כי הם הלקוחות הכי חשובים!</p>
          </div>
        </div>
      `
    },
    {
      id: "tasks",
      title: "✅ ניהול משימות (Tasks)",
      icon: CheckCircle,
      description: "Kanban board לניהול משימות",
      content: `
        <div class="space-y-4">
          <p>לוח Kanban של 5 עמודות לניהול משימות יומיות</p>

          <h4 class="font-bold text-lg mt-3">5 עמודות:</h4>
          <div class="space-y-2">
            <div class="border-l-4 border-red-500 pl-3">
              <strong>🔴 Overdue (איחור)</strong> - משימות שהגיע הזמן שלהן
            </div>
            <div class="border-l-4 border-yellow-500 pl-3">
              <strong>🟡 Today (היום)</strong> - משימות להיום
            </div>
            <div class="border-l-4 border-blue-500 pl-3">
              <strong>🔵 Upcoming (קרוב)</strong> - משימות של מחר/שבוע הבא
            </div>
            <div class="border-l-4 border-gray-500 pl-3">
              <strong>⚪ No Date (ללא תאריך)</strong> - משימות ללא תאריך
            </div>
            <div class="border-l-4 border-green-500 pl-3">
              <strong>✅ Completed (הושלמו)</strong> - משימות שסיימנו
            </div>
          </div>

          <h4 class="font-bold text-lg mt-4">🎯 עדיפויות:</h4>
          <ul class="list-disc mr-6 space-y-1 mt-2 text-sm">
            <li><span class="text-red-600">🔴 High</span> - דחוף!</li>
            <li><span class="text-yellow-600">🟡 Medium</span> - רגיל</li>
            <li><span class="text-green-600">🟢 Low</span> - יכול לחכות</li>
          </ul>

          <h4 class="font-bold text-lg mt-4">🎨 כרטיס משימה מציג:</h4>
          <ul class="list-disc mr-6 space-y-1 mt-2 text-sm">
            <li>שם המשימה</li>
            <li>שם הליד שקשור אליו</li>
            <li>תאריך יעד</li>
            <li>דרגת עדיפות</li>
            <li>כפתור סטטוס (Complete/Reopen)</li>
          </ul>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p class="text-sm"><strong>💡 טיפ:</strong> העבר משימות בין עמודות לעדכון הסטטוס שלהן</p>
          </div>
        </div>
      `
    },
    {
      id: "services",
      title: "📦 ניהול שירותים (Services)",
      icon: Zap,
      description: "קטלוג שירותים והכנסות",
      content: `
        <div class="space-y-4">
          <p>ניהול כל השירותים/מוצרים שאתה מוכר</p>

          <h4 class="font-bold text-lg mt-3">➕ הוספת שירות:</h4>
          <ol class="list-decimal mr-6 space-y-2">
            <li>שם שירות (צביעה, אינסטלציה, וכו')</li>
            <li>תיאור קצר</li>
            <li>קטגוריה (מראש מסדר)</li>
            <li>משך זמן (שעות/ימים)</li>
            <li>מחיר בשקל</li>
            <li>שולי רווח (% הרווח שלך)</li>
          </ol>

          <h4 class="font-bold text-lg mt-4">📊 ניתוח הכנסות:</h4>
          <ul class="list-disc mr-6 space-y-2">
            <li><strong>סה״כ הכנסות</strong> - מס' שירותים × מחיר ממוצע</li>
            <li><strong>שירות יקר ביותר</strong> - שירות עם המחיר הגבוה ביותר</li>
            <li><strong>שירות זול ביותר</strong> - שירות עם המחיר הנמוך ביותר</li>
            <li><strong>התפלגות קטגוריות</strong> - ראה איזו קטגוריה הכי פופולרית</li>
          </ul>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p class="text-sm"><strong>💡 טיפ:</strong> שירותים עוזרים לך לעקוב אחרי הכנסות וביצועים לפי סוג שירות</p>
          </div>
        </div>
      `
    },
    {
      id: "invoices",
      title: "💵 חשבוניות (Invoices)",
      icon: FileText,
      description: "יצירה וניהול חשבוניות",
      content: `
        <div class="space-y-4">
          <p>יצור חשבוניות, עקוב אחרי תשלומים, וייצא PDF</p>

          <h4 class="font-bold text-lg mt-3">➕ יצירת חשבונית:</h4>
          <ol class="list-decimal mr-6 space-y-2">
            <li>בחר ליד מהרשימה</li>
            <li>הזן סכום (בשקלים)</li>
            <li>בחר שיעור מס (ברירת מחדל 17% VAT)</li>
            <li>סטטוס התחלתי: Draft (טיוטה)</li>
            <li>לחץ "צור חשבונית"</li>
          </ol>

          <h4 class="font-bold text-lg mt-4">📊 סטטוסים:</h4>
          <div class="space-y-2">
            <div>📝 <strong>Draft</strong> - טיוטה שלא שלחנו</div>
            <div>✉️ <strong>Sent</strong> - שלחנו ללקוח</div>
            <div>✅ <strong>Paid</strong> - התשלום כבא</div>
            <div>⚠️ <strong>Overdue</strong> - איחור בתשלום</div>
          </div>

          <h4 class="font-bold text-lg mt-4">💬 WhatsApp Integration:</h4>
          <p>לחץ כפתור ירוק ✉️ לשליחת החשבונית ישירה ב-WhatsApp!</p>

          <h4 class="font-bold text-lg mt-4">📥 הורדה:</h4>
          <ul class="list-disc mr-6 space-y-2">
            <li>לחץ "הורד PDF" לקבלת קובץ הדפסה</li>
            <li>מוכן להדפסה או שליחה בדוא"ל</li>
          </ul>

          <h4 class="font-bold text-lg mt-4">📈 ניתוח:</h4>
          <ul class="list-disc mr-6 space-y-2">
            <li>סה״כ הכנסות מכל החשבוניות</li>
            <li>סכום שקיבלנו (Paid)</li>
            <li>סכום מס (VAT)</li>
            <li>תרשים לפי סטטוס תשלום</li>
          </ul>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p class="text-sm"><strong>💡 טיפ:</strong> מס (VAT) מחושב אוטומטי - 17% בדיוק מהסכום</p>
          </div>
        </div>
      `
    },
    {
      id: "reports",
      title: "📈 דוחות (Reports)",
      icon: BarChart3,
      description: "דוחות מעמיקים וייצוא נתונים",
      content: `
        <div class="space-y-4">
          <p>תיקיות דוחות מפורטות וייצוא למחשב</p>

          <h4 class="font-bold text-lg mt-3">3 סוגי דוחות:</h4>
          
          <div class="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
            <strong>📊 Summary (תקציר)</strong>
            <ul class="list-disc mr-6 space-y-1 mt-2 text-sm">
              <li>סה״כ לידים</li>
              <li>לידים שנסגרו (Won)</li>
              <li>לידים עם הצעה (Quoted)</li>
              <li>לידים חדשים השנה</li>
              <li>לידים אבודים</li>
            </ul>
          </div>

          <div class="bg-green-50 border border-green-200 rounded p-3 mt-2">
            <strong>⚡ Activity (פעילות)</strong>
            <ul class="list-disc mr-6 space-y-1 mt-2 text-sm">
              <li>סה״כ משימות</li>
              <li>משימות שהושלמו</li>
              <li>משימות פתוחות</li>
              <li>סה״כ הערות</li>
            </ul>
          </div>

          <div class="bg-purple-50 border border-purple-200 rounded p-3 mt-2">
            <strong>⭐ Quality (איכות)</strong>
            <ul class="list-disc mr-6 space-y-1 mt-2 text-sm">
              <li>ממוצע ניקוד לידים</li>
              <li>שיעור הצלחה (Won/Total)</li>
              <li>לידים איכותיים (70+ pts)</li>
            </ul>
          </div>

          <h4 class="font-bold text-lg mt-4">📥 ייצוא נתונים:</h4>
          <ul class="list-disc mr-6 space-y-2">
            <li><strong>JSON</strong> - לבסיס נתונים או שיבוט</li>
            <li><strong>CSV</strong> - לאקסל/גוגל שיטส</li>
            <li><strong>XLSX</strong> - ישירות לאקסל</li>
          </ul>

          <h4 class="font-bold text-lg mt-4">📊 טבלה מלאה:</h4>
          <p>כל דוח מציג טבלה של כל הלידים עם:</p>
          <ul class="list-disc mr-6 space-y-1 mt-2 text-sm">
            <li>שם</li>
            <li>טלפון</li>
            <li>סטטוס</li>
            <li>ניקוד</li>
            <li>משימות</li>
            <li>הערות</li>
            <li>תאריך</li>
          </ul>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p class="text-sm"><strong>💡 טיפ:</strong> ייצא דוחות כל חודש לניתוח עמוק של הביצועים שלך</p>
          </div>
        </div>
      `
    },
    {
      id: "settings",
      title: "⚙️ הגדרות (Settings)",
      icon: Settings,
      description: "הגדרות ודמויי חברה",
      content: `
        <div class="space-y-4">
          <p>עדכן את פרטי החברה שלך וקבל גישה לגיבוי</p>

          <h4 class="font-bold text-lg mt-3">📋 נתוני החברה:</h4>
          <ul class="list-disc mr-6 space-y-2">
            <li><strong>שם החברה</strong> - שם רשמי</li>
            <li><strong>דוא"ל</strong> - אימייל ליצירת קשר</li>
            <li><strong>טלפון</strong> - מס' טלפון עיקרי</li>
            <li><strong>טלפון WhatsApp</strong> - מס' WhatsApp (בחינם למהלכים ישראליים)</li>
            <li><strong>כתובת</strong> - כתובת משרד/עבודה</li>
          </ul>

          <h4 class="font-bold text-lg mt-4">💾 Backup וייצוא:</h4>
          <ul class="list-disc mr-6 space-y-2">
            <li>לחץ "גיבוי קובץ" לבאקאפ של כל הנתונים</li>
            <li>ייצוא כ-JSON למחשב שלך</li>
            <li>שמור בקובץ בטוח!</li>
          </ul>

          <h4 class="font-bold text-lg mt-4">📊 סטטיסטיקות מהירות:</h4>
          <ul class="list-disc mr-6 space-y-2">
            <li>סה״כ לידים במערכת</li>
            <li>לידים פעילים כרגע</li>
            <li>עסקאות סגורות בהצלחה</li>
          </ul>

          <h4 class="font-bold text-lg mt-4">ℹ️ אודות:</h4>
          <ul class="list-disc mr-6 space-y-2">
            <li>שם האפליקציה: MyServices CRM</li>
            <li>גרסה: Pro</li>
            <li>כל הפיצ'רים זמינים</li>
          </ul>

          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p class="text-sm"><strong>💡 טיפ:</strong> עדכן את נתוני WhatsApp שלך כדי שההודעות יגיעו עם מס' הטלפון הנכון!</p>
          </div>
        </div>
      `
    },
    {
      id: "whatsapp",
      title: "💬 WhatsApp Integration",
      icon: MessageCircle,
      description: "שליחת הודעות ישירות",
      content: `
        <div class="space-y-4">
          <p>WhatsApp מוטמע בכל דף - שלח הודעות ישירות ללקוחותיך!</p>

          <h4 class="font-bold text-lg mt-3">🎯 איפה יש כפתור WhatsApp:</h4>
          <div class="space-y-3 mt-2">
            <div class="bg-green-50 border border-green-200 rounded p-3">
              <strong>Leads</strong> - בטבלה, בעמודת "פעולות" (כפתור ירוק 💚)
            </div>
            <div class="bg-green-50 border border-green-200 rounded p-3">
              <strong>Customers</strong> - בקרטיס הלקוח (כפתור ירוק 💚)
            </div>
            <div class="bg-green-50 border border-green-200 rounded p-3">
              <strong>Pipeline</strong> - בתוך פרטי הליד (כפתור גדול "WhatsApp")
            </div>
            <div class="bg-green-50 border border-green-200 rounded p-3">
              <strong>Invoices</strong> - בטבלה (שלח חשבונית ישירה!)
            </div>
          </div>

          <h4 class="font-bold text-lg mt-4">🚀 איך משתמשים:</h4>
          <ol class="list-decimal mr-6 space-y-2">
            <li>לחץ על כפתור ירוק 💚</li>
            <li>WhatsApp יפתח באופן ישיר</li>
            <li>הודעה כבר הכנה! (שם הליד וסוג הודעה)</li>
            <li>עריכה ושליחה</li>
          </ol>

          <h4 class="font-bold text-lg mt-4">📱 דוגמאות הודעות:</h4>
          <div class="bg-gray-50 border border-gray-300 rounded p-3 mt-2 text-sm font-mono">
            <p class="mb-2">👤 <strong>Leads:</strong></p>
            <p class="text-xs text-gray-700 mb-3">"שלום דוד! זהו הודעה מ-MyServices CRM"</p>
            
            <p class="mb-2">💵 <strong>Invoices:</strong></p>
            <p class="text-xs text-gray-700 mb-3">"שלום דוד! חשבונית INV-000123 בסכום ₪500 מחכה לך"</p>
          </div>

          <h4 class="font-bold text-lg mt-4">⚠️ דקדוקים חשובים:</h4>
          <ul class="list-disc mr-6 space-y-2">
            <li>💚 <strong>דק וגרעין</strong> - לחץ על כפתור ירוק בלבד</li>
            <li>📱 <strong>צריך WhatsApp</strong> - בנייד עם WhatsApp מותקן</li>
            <li>☑️ <strong>מס' טלפון חייב</strong> - אם אין מס', הכפתור לא יעבוד</li>
            <li>🌍 <strong>תו 972</strong> - מספרים ישראליים מתחילים ב-972</li>
          </ul>

          <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
            <p class="text-sm"><strong>💡 טיפ:</strong> שליחת הודעות WhatsApp ישירה מהמערכת חוסכת זמן וממרמזת מקצוענות!</p>
          </div>
        </div>
      `
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <BookOpen size={40} className="text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">📖 מדריך השימוש</h1>
        </div>
        <p className="text-lg text-gray-600">הסבר מפורט על כל הפיצ'רים ב-MyServices CRM</p>
      </div>

      {/* Demo Video Section */}
      <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-300 p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">📚</span>
          <h2 className="text-2xl font-bold text-gray-900">איך להשתמש ב-MyServices CRM</h2>
        </div>
        
        <div className="space-y-3">
          <p className="text-gray-700 font-semibold">
            ✅ בחר נושא מהטבלה למטה כדי ללמוד איך להשתמש בכל פיצ'ר
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <p className="font-bold text-sm mb-1">📊 נהל לידים</p>
              <p className="text-xs text-gray-600">הוסף, עקוב וסגור עסקאות בקלות</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <p className="font-bold text-sm mb-1">💼 ארגן לקוחות</p>
              <p className="text-xs text-gray-600">שמור נתוני לקוח במקום אחד בטוח</p>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-green-200">
              <p className="font-bold text-sm mb-1">💬 WhatsApp ישירה</p>
              <p className="text-xs text-gray-600">שלח הודעות ללקוחות בלחיצה אחת</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 italic">
            💡 <strong>עצה:</strong> אחרי שתצפה בסרטו, בחר נושא מטבלת התפריט למטה כדי ללמוד בפרטים
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {sections.map((section) => {
          const IconComponent = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => toggleSection(section.id)}
              className={`p-4 rounded-lg text-right transition ${
                expandedSection === section.id
                  ? "bg-blue-100 border-2 border-blue-500"
                  : "bg-white border border-gray-200 hover:border-blue-300"
              }`}
            >
              <IconComponent size={24} className="mb-2 text-blue-600" />
              <p className="font-bold text-sm">{section.title}</p>
            </button>
          );
        })}
      </div>

      {/* Content Sections */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3 flex-1 text-right">
                <div>
                  <h3 className="font-bold text-lg">{section.title}</h3>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>
              </div>
              {expandedSection === section.id ? (
                <ChevronUp size={20} className="text-blue-600" />
              ) : (
                <ChevronDown size={20} className="text-gray-400" />
              )}
            </button>

            {expandedSection === section.id && (
              <div className="border-t p-6 bg-gray-50 text-gray-800">
                <div
                  dangerouslySetInnerHTML={{ __html: section.content }}
                  className="prose prose-sm max-w-none"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-right">
        <h3 className="font-bold text-lg mb-3">❓ עוד שאלות?</h3>
        <p className="text-sm text-gray-700 mb-3">אם משהו לא ברור, בואו נדבר!</p>
        <ul className="text-sm space-y-2 mb-4">
          <li>📧 <strong>דוא"ל:</strong> info@myservices.com</li>
          <li>📱 <strong>WhatsApp:</strong> 050-123-4567</li>
          <li>💬 <strong>צ'אט:</strong> צור קשר מהעמוד ההגדרות</li>
        </ul>
      </div>

      {/* Version Info */}
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>MyServices CRM Pro | v1.0 | מדריך מלא</p>
      </div>
    </div>
  );
}
