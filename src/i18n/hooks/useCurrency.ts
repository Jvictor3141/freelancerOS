import { useTranslation } from 'react-i18next';
import {
  isSupportedLanguage,
  LANGUAGE_CURRENCY_MAP,
  LANGUAGE_LOCALE_MAP,
} from '../config';

const formatterCache = new Map<string, Intl.NumberFormat>();
const dateFormatterCache = new Map<string, Intl.DateTimeFormat>();

function getCurrencyFormatter(lang: string): Intl.NumberFormat {
  const cached = formatterCache.get(lang);
  if (cached) return cached;

  const resolvedLang = isSupportedLanguage(lang) ? lang : 'pt';
  const locale = LANGUAGE_LOCALE_MAP[resolvedLang];
  const currency = LANGUAGE_CURRENCY_MAP[resolvedLang];

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  formatterCache.set(lang, formatter);
  return formatter;
}

function getDateFormatter(lang: string): Intl.DateTimeFormat {
  const cached = dateFormatterCache.get(lang);
  if (cached) return cached;

  const resolvedLang = isSupportedLanguage(lang) ? lang : 'pt';
  const locale = LANGUAGE_LOCALE_MAP[resolvedLang];

  const formatter = new Intl.DateTimeFormat(locale);
  dateFormatterCache.set(lang, formatter);
  return formatter;
}

/**
 * Provides locale-aware formatting utilities based on the active i18next language.
 *
 * - formatCurrency: formats a number as currency (BRL for pt, USD for en)
 * - formatDate: formats a Date or ISO string per locale
 */
export function useCurrency() {
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language;

  return {
    formatCurrency: (value: number): string =>
      getCurrencyFormatter(lang).format(value),
    formatDate: (value: Date | string | null | undefined): string => {
      if (!value) return '-';
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) return '-';
      return getDateFormatter(lang).format(date);
    },
  };
}
