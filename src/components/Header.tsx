import { LogOut, Plus, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { useFeedback } from './FeedbackProvider';
import { HeaderNotificationsMenu } from './HeaderNotificationsMenu';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getToastToneForMessage } from '../lib/feedback';
import { getErrorMessage } from '../lib/supabase';
import { isSupportedLanguage, LANGUAGE_LOCALE_MAP } from '../i18n/config';
import { useAuthStore } from '../stores/useAuthStore';

export function Header() {
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang?: string }>();
  const { user, loading, logout } = useAuthStore();
  const { notify } = useFeedback();
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const currentLang = lang && isSupportedLanguage(lang) ? lang : (i18n.resolvedLanguage ?? 'pt');
  const locale = isSupportedLanguage(currentLang) ? LANGUAGE_LOCALE_MAP[currentLang] : 'pt-BR';

  const formattedDate = new Date().toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  function alert(message: string) {
    notify({
      tone: getToastToneForMessage(message),
      title: message,
    });
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!accountMenuRef.current) return;
      if (
        event.target instanceof Node &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setIsAccountMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  function handleNewProjectClick() {
    window.location.href = `/${currentLang}/projetos?new=1`;
  }

  async function handleLogout() {
    try {
      setIsAccountMenuOpen(false);
      await logout();
      window.location.href = `/${currentLang}/login?mode=sign_in`;
    } catch (error) {
      alert(getErrorMessage(error, t('header.logout_failed')));
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 px-4 py-3 sm:px-6 lg:px-8 xl:items-center">
        <div className="min-w-0">
          <div className="flex items-center xl:hidden">
            <BrandLogo variant="lockup" className="h-11 w-auto" />
          </div>
          <div className="hidden xl:block">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {t('app.name')}
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 lg:text-2xl">
              {t('app.tagline')}
            </h2>
            <p className="text-sm font-medium capitalize text-slate-500">
              {formattedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 self-start xl:self-auto">
          <div className="origin-left scale-[0.75] transition-transform md:scale-100">
            <LanguageSwitcher />
          </div>

          <HeaderNotificationsMenu />

          <div className="motion-surface hidden min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-100 xl:flex">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-[#635bff]">
              <ShieldCheck size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('header.active_session')}
              </p>
              <p className="truncate text-sm font-semibold text-slate-900 sm:max-w-52">
                {user?.email ?? t('header.authenticated_account')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { void handleLogout(); }}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-100 transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogOut size={18} />
            </button>
          </div>

          <div ref={accountMenuRef} className="relative xl:hidden">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((v) => !v)}
              aria-label={t('header.open_account_menu')}
              aria-expanded={isAccountMenuOpen}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm shadow-slate-100 transition hover:bg-slate-50 md:h-14 md:w-14"
            >
              <UserRound size={20} />
            </button>

            {isAccountMenuOpen ? (
              <div className="motion-popover absolute right-0 top-[calc(100%+0.75rem)] z-30 w-72 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_24px_50px_rgba(15,23,42,0.12)]">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-[#635bff]">
                    <ShieldCheck size={18} />
                  </span>
                  <p className="min-w-0 break-all text-sm font-semibold text-slate-900">
                    {user?.email ?? t('header.authenticated_account')}
                  </p>
                  <button
                    type="button"
                    onClick={() => { void handleLogout(); }}
                    disabled={loading}
                    className="ml-auto inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm shadow-slate-100 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleNewProjectClick}
            className="hidden items-center justify-center gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105 xl:inline-flex"
          >
            <Plus size={18} />
            {t('navigation.new_project')}
          </button>
        </div>
      </div>
    </header>
  );
}
