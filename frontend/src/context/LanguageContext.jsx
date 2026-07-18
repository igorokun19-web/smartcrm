import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../data/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("language");
    return saved || "he"; // ברירת מחדל: עברית
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    // שנה את כיוון הטקסט בעברית
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
  }, [language]);

  const t = (key) => {
    const keys = key.split(".");
    let value = translations[language] || translations.he;

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key; // החזר את ה-key אם לא נמצא
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
