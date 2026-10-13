import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to GroceryStore",
      "search": "Search for products...",
      "cart": "Cart",
      "login": "Login",
      "categories": "Categories",
      "deals": "Best Deals"
    }
  },
  hi: {
    translation: {
      "welcome": "GroceryStore में आपका स्वागत है",
      "search": "उत्पाद खोजें...",
      "cart": "कार्ट",
      "login": "लॉग इन करें",
      "categories": "श्रेणियाँ",
      "deals": "बेहतरीन डील्स"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
