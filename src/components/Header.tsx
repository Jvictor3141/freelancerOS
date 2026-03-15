import { LogOut, Plus, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

export function Header() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuthStore();
  const formattedDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  function handleNewProjectClick() {
    navigate('/projetos?new=1');
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      alert(getErrorMessage(error, 'Nao foi possivel encerrar a sessao.'));
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0 lg:flex-1">
          <p className="text-sm font-medium capitalize text-slate-500">
            {formattedDate}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 lg:text-2xl">
            Controle tudo sem virar refem de planilha
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Clientes, projetos e pagamentos em um fluxo so.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:shrink-0">
          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-100">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-[#635bff]">
              <ShieldCheck size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Sessao ativa
              </p>
              <p className="truncate text-sm font-semibold text-slate-900 sm:max-w-52">
                {user?.email ?? 'Conta autenticada'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                void handleLogout();
              }}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-100 transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LogOut size={18} />
            </button>
          </div>

          <button
            type="button"
            onClick={handleNewProjectClick}
            className="hidden items-center justify-center gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105 xl:inline-flex"
          >
            <Plus size={18} />
            Novo projeto
          </button>

        </div>
      </div>
    </header>
  );
}
