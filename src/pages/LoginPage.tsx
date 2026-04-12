import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BriefcaseBusiness,
  FolderKanban,
  Mail,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from '../components/BrandLogo';
import { PasswordField } from '../components/PasswordField';
import { getErrorMessage } from '../lib/supabase';
import { Seo } from '../seo/Seo';
import { requestPasswordReset } from '../services/authService';
import { useAuthStore } from '../stores/useAuthStore';
import { getRecord } from '../utils/typeGuards';

type AuthMode = 'sign_in' | 'sign_up';

type AuthFeedback = {
  tone: 'success' | 'error';
  message: string;
};

function getRouteAuthFeedback(state: unknown): AuthFeedback | null {
  const stateRecord = getRecord(state);
  const feedbackRecord = getRecord(stateRecord?.authFeedback);

  if (
    !feedbackRecord ||
    (feedbackRecord.tone !== 'success' && feedbackRecord.tone !== 'error') ||
    typeof feedbackRecord.message !== 'string'
  ) {
    return null;
  }

  return {
    tone: feedbackRecord.tone,
    message: feedbackRecord.message,
  };
}

function getAuthModeFromSearchParams(searchParams: URLSearchParams): AuthMode {
  return searchParams.get('mode') === 'sign_up' ? 'sign_up' : 'sign_in';
}

export function LoginPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { loading, error, notice, signIn, signUp, clearFeedback } =
    useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = getAuthModeFromSearchParams(searchParams);
  const routeFeedback = getRouteAuthFeedback(location.state);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [passwordResetFeedback, setPasswordResetFeedback] = useState<{
    tone: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isPasswordResetSubmitting, setPasswordResetSubmitting] =
    useState(false);

  const highlights = [
    {
      title: t('auth.highlight_flow_title'),
      description: t('auth.highlight_flow_description'),
      icon: BriefcaseBusiness,
    },
    {
      title: t('auth.highlight_access_title'),
      description: t('auth.highlight_access_description'),
      icon: ShieldCheck,
    },
    {
      title: t('auth.highlight_financial_title'),
      description: t('auth.highlight_financial_description'),
      icon: Wallet,
    },
  ];

  useEffect(() => {
    clearFeedback();
    setLocalError(null);
    setPasswordResetFeedback(null);
  }, [mode, clearFeedback]);

  function handleModeChange(nextMode: AuthMode) {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('mode', nextMode);
    setSearchParams(nextSearchParams, { replace: true });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();
    setLocalError(null);

    if (!email.trim() || !password.trim()) {
      setLocalError(t('auth.error_email_password_required'));
      return;
    }

    if (mode === 'sign_up') {
      if (password.length < 8) {
        setLocalError(t('auth.error_password_min_length'));
        return;
      }

      if (password !== confirmPassword) {
        setLocalError(t('auth.error_password_mismatch'));
        return;
      }
    }

    try {
      if (mode === 'sign_in') {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }
    } catch {
      return;
    }
  }

  async function handlePasswordReset() {
    clearFeedback();
    setLocalError(null);
    setPasswordResetFeedback(null);

    if (!email.trim()) {
      setPasswordResetFeedback({
        tone: 'error',
        message: t('auth.error_email_required_for_recovery'),
      });
      return;
    }

    setPasswordResetSubmitting(true);

    try {
      const { error } = await requestPasswordReset(email.trim());

      if (error) {
        throw error;
      }

      setPasswordResetFeedback({
        tone: 'success',
        message: t('auth.recovery_link_sent', { email: email.trim() }),
      });
    } catch (error) {
      setPasswordResetFeedback({
        tone: 'error',
        message: getErrorMessage(
          error,
          t('auth.error_recovery_link_failed'),
        ),
      });
    } finally {
      setPasswordResetSubmitting(false);
    }
  }

  return (
    <>
      <Seo
        title={
          mode === 'sign_in'
            ? t('auth.seo_sign_in_title')
            : t('auth.seo_sign_up_title')
        }
        description={
          mode === 'sign_in'
            ? t('auth.seo_sign_in_description')
            : t('auth.seo_sign_up_description')
        }
        robots="noindex, follow"
        canonical="/login"
      />
      <div className="motion-page min-h-screen bg-transparent px-5 py-6 text-slate-900 sm:px-8 lg:px-10">
        <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl overflow-hidden rounded-[36px] border border-slate-200 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur xl:grid-cols-[0.92fr_1.08fr]">
        <section className="flex items-center bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,0.98))] px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-md">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-8">
              <div className="mb-4">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  {t('auth.see_presentation')}
                </Link>
              </div>

              <div className="mb-6 flex justify-center">
                <BrandLogo variant="lockup" className="h-12 w-auto sm:h-14" />
              </div>

              <div className="min-h-35">
                <div key={`auth-copy-${mode}`} className="motion-swap space-y-3">
                  <p className="text-sm font-medium text-slate-500">
                    {mode === 'sign_in' ? t('auth.access_label') : t('auth.register_label')}
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
                    {mode === 'sign_in'
                      ? t('auth.sign_in_heading')
                      : t('auth.sign_up_heading')}
                  </h2>
                  <p className="text-sm leading-6 text-slate-500">
                    {mode === 'sign_in'
                      ? t('auth.sign_in_copy')
                      : t('auth.sign_up_copy')}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => handleModeChange('sign_in')}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    mode === 'sign_in'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  {t('auth.sign_in_tab')}
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('sign_up')}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    mode === 'sign_up'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  {t('auth.sign_up_tab')}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    {t('auth.email_label')}
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t('auth.email_placeholder')}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#635bff] focus:bg-white"
                  />
                </label>

                <PasswordField
                  label={t('auth.password_label')}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={t('auth.password_placeholder')}
                  autoComplete={
                    mode === 'sign_in' ? 'current-password' : 'new-password'
                  }
                  hint={
                    mode === 'sign_up'
                      ? t('auth.password_hint')
                      : undefined
                  }
                />

                <div className="min-h-31">
                  <div key={`auth-slot-${mode}`} className="motion-swap">
                    {mode === 'sign_up' ? (
                      <PasswordField
                        label={t('auth.confirm_password_label')}
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder={t('auth.confirm_password_placeholder')}
                        autoComplete="new-password"
                      />
                    ) : (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {t('auth.forgot_password_title')}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-500">
                              {t('auth.forgot_password_description')}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              void handlePasswordReset();
                            }}
                            disabled={isPasswordResetSubmitting}
                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm shadow-slate-100 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                            aria-label={t('auth.send_recovery_link')}
                            title={t('auth.send_recovery_link')}
                          >
                            <Mail size={16} />
                          </button>
                        </div>

                        {passwordResetFeedback ? (
                          <div
                            className={`mt-3 rounded-2xl px-3 py-2 text-sm ${
                              passwordResetFeedback.tone === 'success'
                                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border border-rose-200 bg-rose-50 text-rose-700'
                            }`}
                          >
                            {passwordResetFeedback.message}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>

                {localError ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {localError}
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                ) : null}

                {notice ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {notice}
                  </div>
                ) : null}

                {routeFeedback ? (
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      routeFeedback.tone === 'success'
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {routeFeedback.message}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span
                    key={`submit-copy-${mode}-${loading ? 'loading' : 'idle'}`}
                    className="motion-swap inline-flex items-center gap-2"
                  >
                    {loading
                      ? t('common.processing')
                      : mode === 'sign_in'
                        ? t('auth.submit_sign_in')
                        : t('auth.submit_sign_up')}
                    <ArrowRight size={16} />
                  </span>
                </button>
              </form>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 inline-flex rounded-2xl bg-white p-3 text-[#635bff] shadow-sm shadow-slate-200">
                  <FolderKanban size={18} />
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {t('auth.panel_binding_title')}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {t('auth.panel_binding_description')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#635bff] px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.24),transparent_32%)]" />

          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-lg shadow-indigo-950/20">
                  <BrandLogo variant="mark" className="h-5 w-5" alt="" />
                </span>
                FreelancerOS
              </div>

              <div className="max-w-2xl space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-100/90">
                  {t('auth.hero_badge')}
                </p>
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  {t('auth.hero_heading')}
                </h1>
                <p className="max-w-xl text-base leading-7 text-indigo-100/90 sm:text-lg">
                  {t('auth.hero_description')}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {highlights.map(({ title, description, icon: Icon }) => (
                <article
                  key={title}
                  className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-white/15 p-3 text-white">
                    <Icon size={18} />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-indigo-100/90">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
        </div>
      </div>
    </>
  );
}
