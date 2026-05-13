import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    settings: "Settings",
    account: "Account",
    credits: "Credits left",
    buy_credits: "Buy credits",
    upgrade: "Upgrade account",
    appearance: "Appearance",
    dark_theme: "Dark Theme",
    language: "Language",
    logout: "Log out",
    delete_account: "Delete your account & data",
    manage_subscription: "Manage Subscription",
    customize: "Customize Outfits",
    generate: "Generate",
    home: "Home",
    edit: "AI Edit",
    images: "My Images",
    select_lang: "Select Language",
    continue: "Continue"
  },
  hi: {
    settings: "सेटिंग्स",
    account: "खाता",
    credits: "बचे हुए क्रेडिट",
    buy_credits: "क्रेडिट खरीदें",
    upgrade: "खाता अपग्रेड करें",
    appearance: "दिखावट",
    dark_theme: "डार्क थीम",
    language: "भाषा",
    logout: "लॉग आउट",
    delete_account: "अपना खाता और डेटा हटाएं",
    manage_subscription: "सदस्यता प्रबंधित करें",
    customize: "पोशाक कस्टमाइज़ करें",
    generate: "बनाएं",
    home: "होम",
    edit: "AI संपादन",
    images: "मेरी तस्वीरें",
    select_lang: "भाषा चुनें",
    continue: "जारी रखें"
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'en');

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  const t = (key) => translations[lang][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
