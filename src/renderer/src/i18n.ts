import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Spanish modules
import esCommon from './languages/es/common.json';
import esHome from './languages/es/home.json';
import esNavbar from './languages/es/navbar.json';

// English modules
import enCommon from './languages/en/common.json';
import enHome from './languages/en/home.json';
import enNavbar from './languages/en/navbar.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        common: esCommon,
        home: esHome,
        navbar: esNavbar,
      },
      en: {
        common: enCommon,
        home: enHome,
        navbar: enNavbar,
      }
    },
    fallbackLng: 'es',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
