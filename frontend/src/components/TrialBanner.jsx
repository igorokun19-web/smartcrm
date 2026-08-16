import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function TrialBanner() {
  const { billing, billingLoading } = useAuth();
  const { language } = useLanguage();

  if (billingLoading || !billing) {
    return null;
  }

  if (billing.subscriptionStatus === "active") {
    return null;
  }

  const isHebrew = language === "he";
  const isRussian = language === "ru";
  const daysLeft = Number.isFinite(billing.daysLeft) ? billing.daysLeft : 0;

  const isTrialing = billing.subscriptionStatus === "trialing";
  const isPastDue = billing.subscriptionStatus === "past_due";
  const isCanceled = billing.subscriptionStatus === "canceled";

  let title, message, btnLabel;

  if (isHebrew) {
    title   = "סטטוס מנוי";
    message = "עדכן תוכנית כדי להמשיך להשתמש ללא הפרעות.";
    btnLabel = "ניהול מנוי";
    if (isTrialing)  { title = "תקופת ניסיון פעילה"; message = `נותרו ${daysLeft} ימים לניסיון שלך.`; }
    if (isPastDue)   { title = "נדרשת פעולה בחיוב"; message = "תקופת הניסיון הסתיימה. יש לעבור לתוכנית בתשלום."; }
    if (isCanceled)  { title = "המנוי בוטל"; message = "המנוי בוטל מיידית. ניתן להפעיל מחדש דרך עמוד ההגדרות."; }
  } else if (isRussian) {
    title   = "Статус подписки";
    message = "Обновите план, чтобы продолжить пользоваться без ограничений.";
    btnLabel = "Управление подпиской";
    if (isTrialing)  { title = "Пробный период активен"; message = `Осталось ${daysLeft} ${daysLeft === 1 ? "день" : daysLeft < 5 ? "дня" : "дней"} пробного периода.`; }
    if (isPastDue)   { title = "Требуется действие по оплате"; message = "Пробный период завершён. Перейдите на платный план."; }
    if (isCanceled)  { title = "Подписка отменена"; message = "Подписка отменена. Вы можете возобновить её в настройках."; }
  } else {
    title   = "Subscription Status";
    message = "Upgrade your plan to continue without interruptions.";
    btnLabel = "Manage Subscription";
    if (isTrialing)  { title = "Trial Active"; message = `${daysLeft} trial day${daysLeft !== 1 ? "s" : ""} remaining.`; }
    if (isPastDue)   { title = "Billing Action Required"; message = "Your trial has ended. Upgrade to keep using the app."; }
    if (isCanceled)  { title = "Subscription Canceled"; message = "Your subscription was canceled. You can reactivate it in Settings."; }
  }

  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm">{message}</p>
        </div>

        <Link
          to="/settings"
          className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
        >
          {isHebrew ? "ניהול מנוי" : isRussian ? "Управление подпиской" : "Manage Subscription"}
        </Link>
      </div>
    </div>
  );
}
