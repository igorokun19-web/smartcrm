/**
 * Translation Keys Mapping
 * Maps common Hebrew labels to translation keys
 */
export const labelToKeyMap = {
  "חדש": "leads.new",
  "נוצר קשר": "leads.contacted",
  "הצעת מחיר": "leads.quoted",
  "נסגר בהצלחה": "leads.won",
  "אבוד": "leads.lost",
  "גבוה": "leads.high",
  "בינוני": "leads.medium",
  "נמוך": "leads.low",
  "הוסף ליד": "leads.addLead",
  "ערוך": "leads.edit",
  "מחק": "leads.delete",
  "שנור": "leads.search",
  "סטטוס": "leads.status",
  "הערות": "leads.notes",
  "משימות": "leads.tasks",
  "פעילות": "leads.activity",
};

/**
 * Get translated value from t() function
 * Falls back to English label if translation not found
 */
export function getTranslatedLabel(heLabel, t, fallback = heLabel) {
  const key = labelToKeyMap[heLabel];
  if (key) {
    return t(key) || heLabel;
  }
  return fallback;
}
