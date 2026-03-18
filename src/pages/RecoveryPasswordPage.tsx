import { useEffect, useState } from 'react';
import { ArrowLeft, KeyRound, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { PasswordField } from '../components/PasswordField';
import { getErrorMessage } from '../lib/supabase';
import { updatePassword } from '../services/authService';
import { useAuthStore } from '../stores/useAuthStore';

type AuthFeedback = {
  tone: 'success' | 'error';
  message: string;
};

export function RecoveryPasswordPage() {
  const navigate = useNavigate();
  const { user, authFlow, loading, error, clearFeedback, logout } =
    useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    clearFeedback();
    setLocalError(null);
  }, [clearFeedback]);

  async function redirectToLogin(authFeedback?: AuthFeedback) {
    navigate('/login?mode=sign_in', {
      replace: true,
      state: authFeedback ? { authFeedback } : null,
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();
    setLocalError(null);

    if (!user) {
      setLocalError(
        'Esse link nao esta mais ativo. Solicite uma nova recuperacao de senha.',
      );
      return;
    }

    if (password.length < 6) {
      setLocalError('Use uma nova senha com pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('A confirmacao da nova senha nao confere.');
      return;
    }

    try {
      const { error } = await updatePassword(password);

      if (error) {
        throw error;
      }

      setPassword('');
      setConfirmPassword('');
      await logout();
      await redirectToLogin({
        tone: 'success',
        message: 'Senha redefinida com sucesso. Entre com a nova senha para continuar.',
      });
    } catch (error) {
      setLocalError(
        getErrorMessage(error, 'Nao foi possivel atualizar a senha da conta.'),
      );
    }
  }

  async function handleExitRecovery() {
    clearFeedback();
    setLocalError(null);

    try {
      if (user) {
        await logout();
      }

      await redirectToLogin();
    } catch (error) {
      setLocalError(
        getErrorMessage(
          error,
          'Nao foi possivel encerrar a sessao temporaria de recuperacao.',
        ),
      );
    }
  }

  const hasActiveSession = Boolean(user);
  const isRecoverySession = authFlow === 'recovery';
  const userEmail = user?.email ?? 'sua conta';

  return (
    <div className="motion-page min-h-screen bg-transparent px-5 py-6 text-slate-900 sm:px-8 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[36px] border border-slate-200 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur lg:grid-cols-[0.92fr_1.08fr]">
          <section className="flex items-center bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,0.98))] px-5 py-8 sm:px-8 lg:px-10">
            <div className="mx-auto w-full max-w-md">
              <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-8">
                <div className="mb-6 flex justify-center">
                  <BrandLogo variant="lockup" className="h-12 w-auto sm:h-14" />
                </div>

                {!hasActiveSession ? (
                  <div className="space-y-5">
                    <div className="inline-flex rounded-2xl bg-amber-50 p-3 text-amber-700">
                      <ShieldAlert size={20} />
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-500">
                        Link indisponivel
                      </p>
                      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                        Esse link de redefinicao nao esta ativo.
                      </h1>
                      <p className="text-sm leading-6 text-slate-500">
                        Solicite um novo email de recuperacao para gerar outra
                        sessao valida e concluir a troca da senha.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        void redirectToLogin();
                      }}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
                    >
                      Voltar para o login
                      <ArrowLeft size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-500">
                        {isRecoverySession
                          ? 'Fluxo protegido de recuperacao'
                          : 'Atualizacao de senha'}
                      </p>
                      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                        Defina sua nova senha
                      </h1>
                      <p className="text-sm leading-6 text-slate-500">
                        Use esse formulario para salvar a nova senha da conta e
                        encerrar a sessao atual com seguranca.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      Sessao vinculada a {userEmail}.
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <PasswordField
                        label="Nova senha"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Minimo de 6 caracteres"
                        autoComplete="new-password"
                      />

                      <PasswordField
                        label="Confirmar nova senha"
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        placeholder="Repita a nova senha"
                        autoComplete="new-password"
                      />

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm leading-6 text-slate-500">
                        Depois de atualizar a senha, a sessao atual sera
                        encerrada automaticamente e um novo login sera exigido.
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

                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loading ? 'Processando...' : 'Atualizar senha'}
                        <KeyRound size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          void handleExitRecovery();
                        }}
                        disabled={loading}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isRecoverySession
                          ? 'Cancelar recuperacao'
                          : 'Voltar ao login'}
                      </button>
                    </form>
                  </div>
                )}
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
                  Recuperacao segura
                </div>

                <div className="max-w-2xl space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-100/90">
                    Rota publica de redefinicao
                  </p>
                  <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                    O callback do Supabase termina sempre nesta tela
                  </h2>
                  <p className="max-w-xl text-base leading-7 text-indigo-100/90 sm:text-lg">
                    O app nao depende mais de parsing manual espalhado, hacks de
                    sessionStorage nem renderizacao fora do router para concluir
                    a troca de senha.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <article className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                  <div className="mb-4 inline-flex rounded-2xl bg-white/15 p-3 text-white">
                    <ShieldAlert size={18} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    Callback centralizado
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-indigo-100/90">
                    O link do email chega em <code>/auth/callback</code> e a
                    aplicacao redireciona para a rota publica de recuperacao.
                  </p>
                </article>

                <article className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                  <div className="mb-4 inline-flex rounded-2xl bg-white/15 p-3 text-white">
                    <KeyRound size={18} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    Encerramento apos salvar
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-indigo-100/90">
                    Assim que a nova senha e salva, a sessao atual e encerrada e
                    o login normal volta a ser exigido.
                  </p>
                </article>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


