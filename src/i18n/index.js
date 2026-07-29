import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import am from './am.json';
import om from './om.json';

const LANGUAGE_KEY = '@app_language';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (storedLang) {
        return callback(storedLang);
      }
    } catch (error) {
      console.log('Error reading language', error);
    }
    callback('en'); // Default language
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.log('Error caching language', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: {
      en: { translation: en },
      am: { translation: am },
      om: { translation: om },
    },
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;
