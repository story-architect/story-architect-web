import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonEN from './locales/en/common.json';
import dashboardEN from './locales/en/dashboard.json';
import eventsEN from './locales/en/events.json';
import insightsEN from './locales/en/insights.json';

import commonFR from './locales/fr/common.json';
import dashboardFR from './locales/fr/dashboard.json';
import eventsFR from './locales/fr/events.json';
import insightsFR from './locales/fr/insights.json';

const resources = {
  en: {
    common: commonEN,
    dashboard: dashboardEN,
    events: eventsEN,
    insights: insightsEN
  },
  fr: {
    common: commonFR,
    dashboard: dashboardFR,
    events: eventsFR,
    insights: insightsFR
  }
};

const savedLanguage = localStorage.getItem('story_architect_language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage, // use saved language
    fallbackLng: 'en',
    ns: ['common', 'dashboard', 'events', 'insights'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('story_architect_language', lng);
});

export default i18n;
