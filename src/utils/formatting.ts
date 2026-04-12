import { parseCalendarDate } from './dateOnly';
import {
  isSupportedLanguage,
  LANGUAGE_CURRENCY_MAP,
  LANGUAGE_LOCALE_MAP,
} from '../i18n/config';

const ISO_DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toValidDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;

  const date =
    value instanceof Date
      ? value
      : ISO_DATE_ONLY_PATTERN.test(value)
        ? parseCalendarDate(value)
        : new Date(value);

  if (!date) return null;
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Formats a number as currency using the given i18n language.
 * Defaults to pt-BR / BRL when no lang is supplied.
 */
export function formatCurrency(value: number, lang = 'pt'): string {
  const resolvedLang = isSupportedLanguage(lang) ? lang : 'pt';
  const locale = LANGUAGE_LOCALE_MAP[resolvedLang];
  const currency = LANGUAGE_CURRENCY_MAP[resolvedLang];

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a date using the given i18n language.
 * Defaults to pt-BR when no lang is supplied.
 */
export function formatDate(
  value: string | Date | null | undefined,
  lang = 'pt',
): string {
  const date = toValidDate(value);
  if (!date) return '-';

  const resolvedLang = isSupportedLanguage(lang) ? lang : 'pt';
  const locale = LANGUAGE_LOCALE_MAP[resolvedLang];
  return new Intl.DateTimeFormat(locale).format(date);
}

/**
 * Formats a date+time using the given i18n language.
 */
export function formatDateTime(
  value: string | Date | null | undefined,
  lang = 'pt',
): string {
  const date = toValidDate(value);
  if (!date) return '-';

  const resolvedLang = isSupportedLanguage(lang) ? lang : 'pt';
  const locale = LANGUAGE_LOCALE_MAP[resolvedLang];
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
