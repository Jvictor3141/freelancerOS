import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { isSupportedLanguage, type SupportedLanguage } from '../config';

/**
 * Returns the current active language derived from the URL :lang param.
 * Falls back to i18next's resolved language if the param is absent or invalid.
 */
export function useLang(): SupportedLanguage {
  const { lang } = useParams<{ lang?: string }>();
  const { i18n } = useTranslation();

  if (lang && isSupportedLanguage(lang)) {
    return lang;
  }

  const resolved = i18n.resolvedLanguage ?? i18n.language;

  return isSupportedLanguage(resolved) ? resolved : 'pt';
}
