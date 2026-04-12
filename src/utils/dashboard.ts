import { formatCurrency, formatDate } from './formatting';

/**
 * Formats a currency value for dashboard display.
 * Pass the active language from useTranslation() i18n.language.
 */
export function formatDashboardCurrency(value: number, lang = 'pt'): string {
  return formatCurrency(value, lang);
}

/**
 * Formats a date for dashboard display.
 */
export function formatDashboardDate(
  value: string,
  lang = 'pt',
): string {
  return formatDate(value, lang);
}
