import { useState, useEffect, useCallback } from 'react';
import { translations, languages, detectLanguage } from './translations';

const STORAGE_KEY = 'egg-calculator-lang';

export function useTranslation() {
  // Initialize from localStorage or detect from browser
  const [lang, setLang] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && translations[stored]) {
        return stored;
      }
    }
    return detectLanguage();
  });

  // Persist language choice
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  // Translation function
  const t = useCallback((key) => {
    const strings = translations[lang] || translations.en;
    return strings[key] || translations.en[key] || key;
  }, [lang]);

  // Change language
  const setLanguage = useCallback((newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
    }
  }, []);

  return {
    t,
    lang,
    setLanguage,
    languages,
  };
}
