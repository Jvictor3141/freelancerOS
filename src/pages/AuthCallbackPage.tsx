import { useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { Seo } from '../seo/Seo';
import { getSession } from '../services/authService';
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
  const navigate = useNavigate();
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
            message: 'Link processado com sucesso. Faca login para continuar.',
          };

      if (errorDescription) {
        navigate('/login?mode=sign_in', {
          replace: true,
          state: { authFeedback },
        });
        return;
      }

      const { data, error } = await getSession();

      if (!isActive) {
        return;
      }

      if (error) {
        navigate('/login?mode=sign_in', {
          replace: true,
          state: {
            authFeedback: {
              tone: 'error',
              message: 'Nao foi possivel validar a sessao retornada pelo Supabase.',
            },
          },
        });
        return;
      }

      const sessionUser = data.session?.user ?? user;

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
  }, [authFlow, initialized, navigate, searchParams, user]);

  return (
    <>
      <Seo
        title="Autenticando | FreelancerOS"
        description="Processando o retorno de autenticacao e encaminhando voce para a rota correta."
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
              Validando autenticacao
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Processando o retorno do Supabase e encaminhando voce para a rota
              correta.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

