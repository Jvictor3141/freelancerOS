import {
  BriefcaseBusiness,
  CreditCard,
  FileText,
  Home,
  Settings,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export type NavigationItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', to: '/', icon: Home },
  { label: 'Clientes', to: '/clientes', icon: Users },
  { label: 'Projetos', to: '/projetos', icon: BriefcaseBusiness },
  { label: 'Pagamentos', to: '/pagamentos', icon: CreditCard },
  { label: 'Propostas', to: '/propostas', icon: FileText },
  { label: 'Configuracoes', to: '/configuracoes', icon: Settings },
];

type NavigationListProps = {
  className?: string;
  onNavigate?: () => void;
};

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
          end={to === '/'}
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
