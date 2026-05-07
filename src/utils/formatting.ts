import { parseCalendarDate } from './dateOnly';
import {
  isSupportedLanguage,
  LANGUAGE_CURRENCY_MAP,
  LANGUAGE_LOCALE_MAP,
  CURRENCY_LOCALE_MAP,
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
 * Formats a number as currency using an explicit ISO 4217 currency code.
 * Locale is derived from the currency (BRL → pt-BR, USD → en-US, etc.).
 */
export function formatCurrencyCode(value: number, currency: string): string {
  const resolvedCurrency = currency || 'BRL';
  const locale = resolvedCurrency in CURRENCY_LOCALE_MAP
    ? CURRENCY_LOCALE_MAP[resolvedCurrency as keyof typeof CURRENCY_LOCALE_MAP]
    : 'pt-BR';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: resolvedCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Compact currency for space-constrained contexts (tables, dashboards).
 * Values < 1 000 → full precision; ≥ 1 000 → compact with 1 decimal
 * (e.g. R$ 7,2 mil | $7.2K | € 1,5 M).
 */
export function formatCurrencyCompact(value: number, currency: string): string {
  const resolvedCurrency = currency || 'BRL';
  const locale = resolvedCurrency in CURRENCY_LOCALE_MAP
    ? CURRENCY_LOCALE_MAP[resolvedCurrency as keyof typeof CURRENCY_LOCALE_MAP]
    : 'pt-BR';

  if (value < 1_000) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: resolvedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: resolvedCurrency,
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
