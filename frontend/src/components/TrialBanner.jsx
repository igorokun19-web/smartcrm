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
  const daysLeft = Number.isFinite(billing.daysLeft) ? billing.daysLeft : 0;

  const isTrialing = billing.subscriptionStatus === "trialing";
  const isPastDue = billing.subscriptionStatus === "past_due";
  const isCanceled = billing.subscriptionStatus === "canceled";

  let title = isHebrew ? "סטטוס מנוי" : "Subscription Status";
  let message = isHebrew ? "עדכן תוכנית כדי להמשיך להשתמש ללא הפרעות." : "Upgrade your plan to continue without interruptions.";

  if (isTrialing) {
    title = isHebrew ? "תקופת ניסיון פעילה" : "Trial Active";
    message = isHebrew
      ? `נותרו ${daysLeft} ימים לניסיון שלך.`
      : `${daysLeft} trial days left.`;
  }

  if (isPastDue) {
    title = isHebrew ? "נדרשת פעולה בחיוב" : "Billing Action Required";
    message = isHebrew
      ? "תקופת הניסיון הסתיימה. יש לעבור לתוכנית בתשלום."
      : "Trial ended. Upgrade to a paid plan.";
  }

  if (isCanceled) {
    title = isHebrew ? "המנוי בוטל" : "Subscription Canceled";
    message = isHebrew
      ? "המנוי בוטל מיידית. ניתן להפעיל מחדש דרך עמוד ההגדרות."
      : "Subscription was canceled immediately. You can reactivate from Settings.";
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
          {isHebrew ? "ניהול מנוי" : "Manage Subscription"}
        </Link>
      </div>
    </div>
  );
}
