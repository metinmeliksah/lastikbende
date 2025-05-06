import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import trTranslation from './locales/tr/translation.json';
import enTranslation from './locales/en/translation.json';
import theme from './theme';
import MembershipAgreement from './pages/sozlesmeler/uyelik-sozlesmesi';

// Initialize i18next
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

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/sozlesmeler/uyelik-sozlesmesi" element={<MembershipAgreement />} />
            {/* Diğer rotalar buraya eklenebilir */}
          </Routes>
        </Router>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App; 