import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector) // optional
  .use(initReactI18next)
  .init({
    fallbackLng: 'hu',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // react already escapes
    },

    resources: {
      en: {
        translation: {
          booking: 'Booking',
          cancel: 'Cancel',
          enter_your_email: 'Enter your email',
          enter_your_password: 'Enter your password',
          login: 'Login',
          register: 'Register',
          save: 'Save',
        },
      },
      hu: {
        translation: {
          booking: 'Foglalás',
          cancel: 'Vissza',
          enter_your_email: 'Írd be az emailed',
          enter_your_password: 'Írd be a jelszavad',
          login: 'Belépés',
          register: 'Regisztráció',
          save: 'Mentés',
        },
      },
    },
  });

export default i18n;
