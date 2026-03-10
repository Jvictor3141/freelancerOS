import { BriefcaseBusiness, CreditCard, FileText, Home, Settings, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/', icon: Home },
  { label: 'Clientes', to: '/clientes', icon: Users },
  { label: 'Projetos', to: '/projetos', icon: BriefcaseBusiness },
  { label: 'Pagamentos', to: '/pagamentos', icon: CreditCard },
  { label: 'Propostas', to: '/propostas', icon: FileText },
  { label: 'Configurações', to: '/configuracoes', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-slate-200 bg-white/90 px-5 py-6 backdrop-blur xl:block">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#635bff] text-white shadow-lg shadow-indigo-200">
          <BriefcaseBusiness size={20} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">FreelancerOS</p>
          <h1 className="text-lg font-semibold text-slate-900">Painel operacional</h1>
        </div>
      </div>

      <nav className="mt-10 space-y-2">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#635bff] text-white shadow-md shadow-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Resumo rápido</p>
        <h2 className="mt-2 text-sm font-semibold text-slate-900">Seu mês está saudável</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Você já bateu 78% da meta mensal e só tem 2 cobranças que precisam de atenção.
        </p>
      </div>
    </aside>
  );
}
