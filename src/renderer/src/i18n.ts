import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Spanish modules
import esCommon from './languages/es/common.json';
import esHome from './languages/es/home.json';
import esNavbar from './languages/es/navbar.json';
import esAuth from './languages/es/auth.json';
import esGames from './languages/es/games.json';
import esFooter from './languages/es/footer.json';
import esProfile from './languages/es/profile.json';
import esImageUpload from './languages/es/imageUpload.json';
import esVideoUpload from './languages/es/videoUpload.json';
import esAdmin from './languages/es/admin.json';
import esReport from './languages/es/report.json';

// English modules
import enCommon from './languages/en/common.json';
import enHome from './languages/en/home.json';
import enNavbar from './languages/en/navbar.json';
import enAuth from './languages/en/auth.json';
import enGames from './languages/en/games.json';
import enFooter from './languages/en/footer.json';
import enProfile from './languages/es/profile.json';
import enImageUpload from './languages/en/imageUpload.json';
import enVideoUpload from './languages/en/videoUpload.json';
import enAdmin from './languages/en/admin.json';
import enReport from './languages/en/report.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: {
        common: esCommon,
        home: esHome,
        navbar: esNavbar,
        auth: esAuth,
        games: esGames,
        footer: esFooter,
        profile: esProfile,
        imageUpload: esImageUpload,
        videoUpload: esVideoUpload,
        admin: esAdmin,
        report: esReport
      },
      en: {
        common: enCommon,
        home: enHome,
        navbar: enNavbar,
        auth: enAuth,
        games: enGames,
        footer: enFooter,
        profile: enProfile,
        imageUpload: enImageUpload,
        videoUpload: enVideoUpload,
        admin: enAdmin,
        report: enReport
      }
    },
    fallbackLng: 'es',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
