"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/utils/translations';

// 1. Context create karein
const LanguageContext = createContext();

// 2. Provider Component banayein
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('HI'); // Default Hindi rakhenge

  // LocalStorage se language uthane ka logic (Optional, taaki refresh pe yaad rakhe)
  useEffect(() => {
    const savedLang = localStorage.getItem('siteLang');
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  // Language change function
  const cycleLanguage = () => {
    setLanguage((prev) => {
      const nextLang = prev === 'HI' ? 'EN' : prev === 'EN' ? 'HING' : 'HI';
      localStorage.setItem('siteLang', nextLang); // Save preference
      return nextLang;
    });
  };

  // Translation helper function: t('hero_title')
  const t = (key) => {
    return translations[language][key] || key; // Agar key na mile to key hi dikha do
  };

  return (
    <LanguageContext.Provider value={{ language, cycleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// 3. Custom Hook (Easy access ke liye)
export function useLanguage() {
  return useContext(LanguageContext);
}