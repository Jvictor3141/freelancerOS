import { LogOut, Plus, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';

export function Header() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuthStore();
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const formattedDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!accountMenuRef.current) {
        return;
      }

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
    navigate('/projetos?new=1');
  }

  async function handleLogout() {
    try {
      setIsAccountMenuOpen(false);
      await logout();
    } catch (error) {
      alert(getErrorMessage(error, 'Nao foi possivel encerrar a sessao.'));
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 px-4 py-3 sm:px-6 lg:px-8 xl:items-center">
        <div className="min-w-0">
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 lg:text-2xl">
            Controle tudo sem virar refem de planilha
          </h2>
          <p className="text-sm font-medium capitalize text-slate-500">
            {formattedDate}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 self-start xl:self-auto">
          <div className="motion-surface hidden min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-100 xl:flex">
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

          <div ref={accountMenuRef} className="relative xl:hidden">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((currentValue) => !currentValue)}
              aria-label="Abrir menu da conta"
              aria-expanded={isAccountMenuOpen}
              className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm shadow-slate-100 transition hover:bg-slate-50"
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
                    {user?.email ?? 'Conta autenticada'}
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      void handleLogout();
                    }}
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
            Novo projeto
          </button>

        </div>
      </div>
    </header>
  );
}
