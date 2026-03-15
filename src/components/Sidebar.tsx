import { BriefcaseBusiness, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { NavigationList } from './navigation';

export function Sidebar() {
  const { user } = useAuthStore();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white/90 px-5 py-6 backdrop-blur xl:flex xl:flex-col">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#635bff] text-white shadow-lg shadow-indigo-200">
          <BriefcaseBusiness size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            FreelancerOS
          </p>
          <h1 className="text-lg font-semibold text-slate-900">
            Painel operacional
          </h1>
        </div>
      </div>

      <NavigationList className="mt-10 space-y-2" />

      <div className="motion-surface mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
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
          Seus dados ficam vinculados a essa conta e passam pelas regras de
          seguranca do Supabase.
        </p>
      </div>
    </aside>
  );
}
