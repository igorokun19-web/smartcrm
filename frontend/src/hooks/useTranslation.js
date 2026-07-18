import { useLanguage } from "../context/LanguageContext";

/**
 * Custom hook שמחבר את useLanguage עם useEffect
 * ומשנה את dir של כל הדף בהתאם לשפה
 */
export function useTranslation() {
  const { language, setLanguage, t } = useLanguage();

  // עדכן את dir כשמשתנה השפה
  const updatePageDirection = () => {
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
  };

  if (typeof document !== "undefined") {
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
  }

  return { t, language, setLanguage };
}

/**
 * Object שמכיל את כל התרגומים הדינאמיים עבור values שמשתנים
 */
export const getTranslatedValues = (t, language) => ({
  statuses: {
    New: t("leads.new"),
    Contacted: t("leads.contacted"),
    Quoted: t("leads.quoted"),
    Won: t("leads.won"),
    Lost: t("leads.lost"),
  },
  priorities: {
    High: t("leads.high"),
    Medium: t("leads.medium"),
    Low: t("leads.low"),
  },
  invoiceStatuses: {
    Draft: t("invoices.draft"),
    Sent: t("invoices.sent"),
    Paid: t("invoices.paid"),
    Overdue: t("invoices.overdue"),
  },
  segments: {
    VIP: t("customers.vip"),
    Active: t("customers.active"),
    AtRisk: t("customers.atRisk"),
    Inactive: t("customers.inactive"),
  },
});
