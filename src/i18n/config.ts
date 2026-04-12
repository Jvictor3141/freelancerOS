import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import pt from '../locales/pt.json';

export const SUPPORTED_LANGUAGES = ['pt', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lang);
}

export const LANGUAGE_LOCALE_MAP: Record<SupportedLanguage, string> = {
  pt: 'pt-BR',
  en: 'en-US',
};

export const LANGUAGE_CURRENCY_MAP: Record<SupportedLanguage, string> = {
  pt: 'BRL',
  en: 'USD',
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      pt: { translation: pt },
      en: { translation: en },
    },
    fallbackLng: 'pt',
    supportedLngs: [...SUPPORTED_LANGUAGES],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'freelanceros_lang',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
