import { useContext, createContext, useState, useCallback } from 'react';
import { translations } from './translations';

const I18nContext = createContext();

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('aih-locale') || 'pt';
  });

  const changeLocale = useCallback((newLocale) => {
    setLocale(newLocale);
    localStorage.setItem('aih-locale', newLocale);
  }, []);

  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[locale];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  }, [locale]);

  return (
    <I18nContext.Provider value={{ t, locale, changeLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within I18nProvider');
  return context;
}
