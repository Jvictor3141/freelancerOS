import { useEffect, useState } from 'react';
import { ArrowLeft, KeyRound, ShieldAlert } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { getErrorMessage } from '../lib/supabase';
import { updatePassword } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';

export function RecoveryPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    loading,
    error,
    notice,
    isRecoveryMode,
    clearFeedback,
    completePasswordRecovery,
    cancelPasswordRecovery,
  } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    clearFeedback();
    setLocalError(null);
  }, [clearFeedback]);

  useEffect(() => {
    if (isRecoveryMode && location.pathname !== '/redefinir-senha') {
      navigate('/redefinir-senha', { replace: true });
    }
  }, [isRecoveryMode, location.pathname, navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();
    setLocalError(null);

    if (!isRecoveryMode) {
      setLocalError(
        'Esse link não está mais ativo. Solicite uma nova recuperação de senha.',
      );
      return;
    }

    if (password.length < 6) {
      setLocalError('Use uma nova senha com pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('A confirmação da nova senha não confere.');
      return;
    }

    try {
      const { error } = await updatePassword(password);

      if (error) {
        throw error;
      }

      setPassword('');
      setConfirmPassword('');
      await completePasswordRecovery();
    } catch (error) {
      setLocalError(
        getErrorMessage(error, 'Não foi possível atualizar a senha da conta.'),
      );
    }
  }

  async function handleCancelRecovery() {
    clearFeedback();
    setLocalError(null);

    try {
      await cancelPasswordRecovery();
    } catch (error) {
      setLocalError(
        getErrorMessage(
          error,
          'Não foi possível sair do fluxo de recuperação.',
        ),
      );
    }
  }

  const isInvalidRecoveryState = !isRecoveryMode || !user;

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

                {isInvalidRecoveryState ? (
                  <div className="space-y-5">
                    <div className="inline-flex rounded-2xl bg-amber-50 p-3 text-amber-700">
                      <ShieldAlert size={20} />
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-500">
                        Recuperação indisponível
                      </p>
                      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                        Link inválido ou expirado
                      </h1>
                      <p className="text-sm leading-6 text-slate-500">
                        Para proteger a conta, o acesso ao painel não é liberado
                        por esse link. Solicite uma nova recuperação pela tela
                        de login.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate('/login?mode=sign_in', { replace: true })
                      }
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
                        Fluxo protegido de recuperação
                      </p>
                      <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                        Defina sua nova senha
                      </h1>
                      <p className="text-sm leading-6 text-slate-500">
                        Essa sessão temporária existe apenas para redefinir a
                        senha. O painel continua bloqueado até a conclusão do
                        processo.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                      Sessão de recuperação vinculada a {user.email}.
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                          Nova senha
                        </span>
                        <input
                          type="password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="Mínimo de 6 caracteres"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#635bff] focus:bg-white"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                          Confirmar nova senha
                        </span>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(event) =>
                            setConfirmPassword(event.target.value)
                          }
                          placeholder="Repita a nova senha"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#635bff] focus:bg-white"
                        />
                      </label>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm leading-6 text-slate-500">
                        Depois de atualizar a senha, a sessão temporária será
                        encerrada automaticamente e um novo login será exigido.
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
                          void handleCancelRecovery();
                        }}
                        disabled={loading}
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Cancelar recuperação
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
                  Recuperação segura
                </div>

                <div className="max-w-2xl space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-100/90">
                    Acesso isolado
                  </p>
                  <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                    A redefinição acontece fora do painel principal
                  </h2>
                  <p className="max-w-xl text-base leading-7 text-indigo-100/90 sm:text-lg">
                    Mesmo com o link válido, essa sessão temporária não libera
                    clientes, projetos, pagamentos ou configurações até a senha
                    ser trocada e o login normal ser feito de novo.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <article className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                  <div className="mb-4 inline-flex rounded-2xl bg-white/15 p-3 text-white">
                    <ShieldAlert size={18} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    Painel bloqueado durante o recovery
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-indigo-100/90">
                    A sessão do link não serve como login normal. Ela existe
                    apenas para concluir a troca da senha.
                  </p>
                </article>

                <article className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
                  <div className="mb-4 inline-flex rounded-2xl bg-white/15 p-3 text-white">
                    <KeyRound size={18} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    Encerramento obrigatório ao finalizar
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-indigo-100/90">
                    Assim que a nova senha é salva, a sessão temporária é
                    encerrada e o sistema volta a exigir login padrão.
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
