import { LogOut, Plus, Search, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

export function Header() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuthStore();
  const dataToday = new Date();

  const formattedDate = dataToday.toLocaleDateString('pt-BR', {
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
      <div className="flex flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{formattedDate}</p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            Controle tudo sem virar refem de planilha
          </h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 shadow-sm shadow-slate-100">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar cliente, projeto ou pagamento"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 sm:w-72"
            />
          </label>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-100">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-[#635bff]">
              <ShieldCheck size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Sessao ativa
              </p>
              <p className="truncate text-sm font-semibold text-slate-900 sm:max-w-48">
                {user?.email ?? 'Conta autenticada'}
              </p>
            </div>
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
            Sair
          </button>

          <button
            type="button"
            onClick={handleNewProjectClick}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
          >
            <Plus size={18} />
            Novo projeto
          </button>
        </div>
      </div>
    </header>
  );
}
