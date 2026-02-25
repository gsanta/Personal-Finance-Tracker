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
          fragments: {
            header: {
              profile_link: 'Profile',
            },
          },
          booking: 'Booking',
          cancel: 'Cancel',
          clear: 'Clear',
          enter_your_email: 'Enter your email',
          enter_your_password: 'Enter your password',
          login: 'Login',
          register: 'Register',
          select_room: 'Select Room',
          save: 'Save',
          pages: {
            profile: {
              bookings_table_title: 'My Bookings',
              delete_booking_tooltip: 'Delete booking',
              title: 'My Profile',
              settings_title: 'Settings',
              change_password_title: 'Change Password',
              current_password_label: 'Current password',
              new_password_label: 'New password',
              confirm_password_label: 'Confirm password',
              change_password_button: 'Change Password',
              password_change_success: 'Password changed successfully!',
            },
          },
          validation: {
            errors: {
              ERR_TOO_FEW_CATS_PROVIDED: 'At least {{value}} names must be provided.',
            },
          },
        },
      },
      hu: {
        translation: {
          fragments: {
            header: {
              profile_link: 'Profilom',
            },
          },
          booking: 'Foglalás',
          cancel: 'Vissza',
          clear: 'Mégse',
          enter_your_email: 'Írd be az emailed',
          enter_your_password: 'Írd be a jelszavad',
          login: 'Belépés',
          register: 'Regisztráció',
          select_room: 'Válassz szobát',
          save: 'Mentés',
          pages: {
            profile: {
              bookings_table_title: 'Foglalásaim',
              delete_booking_tooltip: 'Foglalás törlése',
              title: 'Profilom',
              settings_title: 'Beállítások',
              change_password_title: 'Jelszó megváltoztatása',
              current_password_label: 'Jelenlegi jelszó',
              new_password_label: 'Új jelszó',
              confirm_password_label: 'Új jelszó megerősítése',
              change_password_button: 'Jelszó megváltoztatása',
              password_change_success: 'Jelszó sikeresen megváltoztatva!',
            },
          },
          validation: {
            errors: {
              ERR_TOO_FEW_CATS_PROVIDED: 'Legalább {{value}} nevet adj meg.',
            },
          },
        },
      },
    },
  });

export default i18n;
