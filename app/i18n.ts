import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import translationEN from '../public/locales/en/agreement.json';
import translationTR from '../public/locales/tr/agreement.json';

const resources = {
  en: {
    translation: translationEN
  },
  tr: {
    translation: translationTR
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'tr', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n; 