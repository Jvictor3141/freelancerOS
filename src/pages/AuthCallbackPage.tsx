import { useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useLangNavigate } from '../i18n/hooks/useLangNavigate';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from '../components/BrandLogo';
import { Seo } from '../seo/Seo';
import { getCurrentUser } from '../services/authService';
import { useAuthStore } from '../stores/useAuthStore';

type AuthFeedback = {
  tone: 'success' | 'error';
  message: string;
};

function getHashParams() {
  if (typeof window === 'undefined') {
    return new URLSearchParams();
  }

  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;

  return new URLSearchParams(hash);
}

function getCallbackParam(
  searchParams: URLSearchParams,
  hashParams: URLSearchParams,
  key: string,
) {
  return searchParams.get(key) ?? hashParams.get(key);
}

function getSafeNextPath(rawNext: string | null) {
  if (!rawNext || !rawNext.startsWith('/') || rawNext.startsWith('//')) {
    return '/dashboard';
  }

  return rawNext;
}

export function AuthCallbackPage() {
  const { t } = useTranslation();
  const navigate = useLangNavigate();
  const [searchParams] = useSearchParams();
  const { initialized, user, authFlow } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      return;
    }

    let isActive = true;

    async function resolveCallback() {
      const hashParams = getHashParams();
      const next = getSafeNextPath(searchParams.get('next'));
      const callbackType = getCallbackParam(searchParams, hashParams, 'type');
      const errorDescription = getCallbackParam(
        searchParams,
        hashParams,
        'error_description',
      );
      const isRecoveryFlow =
        authFlow === 'recovery' ||
        callbackType === 'recovery' ||
        next === '/redefinir-senha';

      const authFeedback: AuthFeedback = errorDescription
        ? {
            tone: 'error',
            message: errorDescription,
          }
        : {
            tone: 'success',
            message: t('auth.callback_success'),
          };

      if (errorDescription) {
        navigate('/login?mode=sign_in', {
          replace: true,
          state: { authFeedback },
        });
        return;
      }

      // getUser() faz uma chamada de rede ao Supabase para validar o token —
      // ao contrario de getSession() que apenas le o storage local sem verificacao.
      const { data, error } = await getCurrentUser();

      if (!isActive) {
        return;
      }

      if (error) {
        navigate('/login?mode=sign_in', {
          replace: true,
          state: {
            authFeedback: {
              tone: 'error',
              message: t('auth.callback_session_error'),
            },
          },
        });
        return;
      }

      const sessionUser = data.user ?? user;

      if (isRecoveryFlow) {
        navigate('/redefinir-senha?flow=recovery', { replace: true });
        return;
      }

      if (sessionUser) {
        navigate(next, { replace: true });
        return;
      }

      navigate('/login?mode=sign_in', {
        replace: true,
        state: { authFeedback },
      });
    }

    void resolveCallback();

    return () => {
      isActive = false;
    };
  }, [authFlow, initialized, navigate, searchParams, user, t]);

  return (
    <>
      <Seo
        title={t('auth.callback_seo_title')}
        description={t('auth.callback_seo_description')}
        robots="noindex, follow"
        canonical="/auth/callback"
      />
      <div className="min-h-screen bg-transparent px-5 py-6 text-slate-900 sm:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center">
          <div className="motion-surface rounded-4xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="flex items-center gap-3">
              <BrandLogo variant="lockup" className="h-8 w-auto" />
              <LoaderCircle className="h-5 w-5 animate-spin text-[#635bff]" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              {t('auth.callback_heading')}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {t('auth.callback_description')}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

