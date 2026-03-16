import {
  BriefcaseBusiness,
  CreditCard,
  FileText,
  Home,
  Plus,
  Settings,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

export type NavigationItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: Home },
  { label: 'Clientes', to: '/clientes', icon: Users },
  { label: 'Projetos', to: '/projetos', icon: BriefcaseBusiness },
  { label: 'Pagamentos', to: '/pagamentos', icon: CreditCard },
  { label: 'Propostas', to: '/propostas', icon: FileText },
  { label: 'Configurações', to: '/configuracoes', icon: Settings },
];

type NavigationListProps = {
  className?: string;
  onNavigate?: () => void;
};

type BottomNavigationLinkProps = {
  item: NavigationItem;
};

function BottomNavigationLink({ item }: BottomNavigationLinkProps) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === '/dashboard'}
      aria-label={item.label}
      title={item.label}
      className={({ isActive }) =>
        `mx-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl transition-all ${
          isActive
            ? 'bg-[#635bff] text-white shadow-lg shadow-indigo-200'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <Icon size={18} />
    </NavLink>
  );
}

export function NavigationList({
  className = 'space-y-2',
  onNavigate,
}: NavigationListProps) {
  return (
    <nav className={className}>
      {navigationItems.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/dashboard'}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
              isActive
                ? 'bg-[#635bff] text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`
          }
        >
          <Icon size={18} />
          <span className="min-w-0 truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function BottomNavigationBar() {
  const navigate = useNavigate();
  const leftItems = navigationItems.slice(0, 3);
  const rightItems = navigationItems.slice(3);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-4 xl:hidden">
      <div className="motion-surface mx-auto grid max-w-3xl grid-cols-[repeat(3,minmax(0,1fr))_auto_repeat(3,minmax(0,1fr))] items-center gap-1 rounded-[30px] border border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-16px_40px_rgba(15,23,42,0.08)] backdrop-blur">
        {leftItems.map((item) => (
          <BottomNavigationLink key={item.to} item={item} />
        ))}

        <button
          type="button"
          aria-label="Criar novo projeto"
          title="Criar novo projeto"
          onClick={() => navigate('/projetos?new=1')}
          className="inline-flex h-14 w-14 -translate-y-6 items-center justify-center rounded-[22px] bg-[#635bff] text-white shadow-[0_18px_32px_rgba(99,91,255,0.35)] transition hover:-translate-y-7 hover:brightness-105"
        >
          <Plus size={22} />
        </button>

        {rightItems.map((item) => (
          <BottomNavigationLink key={item.to} item={item} />
        ))}
      </div>
    </div>
  );
}
