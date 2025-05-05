'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import trTranslation from '../locales/tr/translation.json';
import enTranslation from '../locales/en/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: trTranslation },
      en: { translation: enTranslation },
    },
    lng: 'tr',
    fallbackLng: 'tr',
    interpolation: { escapeValue: false },
  });

export default i18n; 