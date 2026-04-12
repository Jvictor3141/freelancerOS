import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { isSupportedLanguage, SUPPORTED_LANGUAGES } from '../i18n/config';

/**
 * Language switcher component.
 * Persists selection to localStorage (via i18next detector config) and
 * immediately swaps the current URL path to the new language prefix
 * so the UI updates without a page reload.
 */
export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<Record<string, string>>();

  const currentLang =
    params.lang && isSupportedLanguage(params.lang)
      ? params.lang
      : (i18n.resolvedLanguage ?? 'pt');

  function switchLanguage(nextLang: string) {
    if (!isSupportedLanguage(nextLang) || nextLang === currentLang) return;

    // Persist selection — i18next detector will pick it up on next load
    void i18n.changeLanguage(nextLang);

    // Swap :lang segment in the current URL so the change is instant
    const currentPath = window.location.pathname;
    const langPattern = new RegExp(`^/(${SUPPORTED_LANGUAGES.join('|')})(/?.*)`);
    const match = langPattern.exec(currentPath);

    if (match) {
      const rest = match[2] ?? '';
      navigate(`/${nextLang}${rest}${window.location.search}`, {
        replace: true,
      });
    } else {
      navigate(`/${nextLang}/`, { replace: true });
    }
  }

  return (
    <div
      className="flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm shadow-slate-100"
      role="group"
      aria-label={t('language_switcher.label')}
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          onClick={() => switchLanguage(lang)}
          aria-pressed={currentLang === lang}
          className={`rounded-xl px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
            currentLang === lang
              ? 'bg-[#635bff] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
