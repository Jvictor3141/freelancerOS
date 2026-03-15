import { BriefcaseBusiness, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { Header } from '../components/Header';
import { NavigationList } from '../components/navigation';
import { Sidebar } from '../components/Sidebar';
import { useAuthStore } from '../store/useAuthStore';

export function DashboardLayout({ children }: PropsWithChildren) {
  const { user } = useAuthStore();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isMobileNavOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileNavOpen]);

  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Header onOpenNavigation={() => setIsMobileNavOpen(true)} />
          <main className="px-4 py-5 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>

      {isMobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fechar navegacao"
            onClick={() => setIsMobileNavOpen(false)}
            className="absolute inset-0 bg-slate-950/45"
          />

          <div className="relative ml-auto flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#635bff] text-white shadow-lg shadow-indigo-200">
                  <BriefcaseBusiness size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    FreelancerOS
                  </p>
                  <h1 className="text-lg font-semibold text-slate-900">
                    Navegacao
                  </h1>
                </div>
              </div>

              <button
                type="button"
                aria-label="Fechar menu"
                onClick={() => setIsMobileNavOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:bg-slate-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
              <NavigationList
                className="space-y-2"
                onNavigate={() => setIsMobileNavOpen(false)}
              />

              <div className="mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 inline-flex rounded-2xl bg-white p-3 text-[#635bff] shadow-sm shadow-slate-200">
                  <ShieldCheck size={18} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Conta conectada
                </p>
                <h2 className="mt-2 break-all text-sm font-semibold text-slate-900">
                  {user?.email ?? 'Usuario autenticado'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Seus dados ficam vinculados a essa conta e passam pelas
                  regras de seguranca do Supabase.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
