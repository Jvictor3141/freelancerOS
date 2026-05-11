import { parseCalendarDate } from './dateOnly';
import {
  LANGUAGE_CURRENCY_MAP,
  LANGUAGE_LOCALE_MAP,
  CURRENCY_LOCALE_MAP,
  type CurrencyCode,
  type SupportedLanguage,
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
export function formatCurrency(value: number, lang: SupportedLanguage = 'pt'): string {
  const locale = LANGUAGE_LOCALE_MAP[lang];
  const currency = LANGUAGE_CURRENCY_MAP[lang];

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Formats a number as currency using an explicit ISO 4217 currency code.
 * Locale is derived from the currency (BRL → pt-BR, USD → en-US, etc.).
 */
export function formatCurrencyCode(value: number, currency: CurrencyCode): string {
  const locale = CURRENCY_LOCALE_MAP[currency];

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Compact currency for space-constrained contexts (tables, dashboards).
 * Values < 1 000 → full precision; ≥ 1 000 → compact with 1 decimal
 * (e.g. R$ 7,2 mil | $7.2K | € 1,5 M).
 */
export function formatCurrencyCompact(value: number, currency: CurrencyCode): string {
  const locale = CURRENCY_LOCALE_MAP[currency];

  if (value < 1_000) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Formats a date using the given i18n language.
 * Defaults to pt-BR when no lang is supplied.
 */
export function formatDate(
  value: string | Date | null | undefined,
  lang: SupportedLanguage = 'pt',
): string {
  const date = toValidDate(value);
  if (!date) return '-';

  return new Intl.DateTimeFormat(LANGUAGE_LOCALE_MAP[lang]).format(date);
}

/**
 * Formats a date+time using the given i18n language.
 */
export function formatDateTime(
  value: string | Date | null | undefined,
  lang: SupportedLanguage = 'pt',
): string {
  const date = toValidDate(value);
  if (!date) return '-';

  return new Intl.DateTimeFormat(LANGUAGE_LOCALE_MAP[lang], {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
