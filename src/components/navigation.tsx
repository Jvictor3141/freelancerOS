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
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { isSupportedLanguage } from '../i18n/config';

type NavItem = {
  labelKey: string;
  path: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { labelKey: 'navigation.dashboard', path: 'dashboard', icon: Home },
  { labelKey: 'navigation.clients', path: 'clientes', icon: Users },
  { labelKey: 'navigation.projects', path: 'projetos', icon: BriefcaseBusiness },
  { labelKey: 'navigation.payments', path: 'pagamentos', icon: CreditCard },
  { labelKey: 'navigation.proposals', path: 'propostas', icon: FileText },
  { labelKey: 'navigation.settings', path: 'configuracoes', icon: Settings },
];

function useLangPrefix(): string {
  const { lang } = useParams<{ lang?: string }>();
  return lang && isSupportedLanguage(lang) ? lang : 'pt';
}

type NavigationListProps = {
  className?: string;
  onNavigate?: () => void;
};

export function NavigationList({
  className = 'space-y-2',
  onNavigate,
}: NavigationListProps) {
  const { t } = useTranslation();
  const lang = useLangPrefix();

  return (
    <nav className={className}>
      {navItems.map(({ labelKey, path, icon: Icon }) => {
        const to = `/${lang}/${path}`;
        return (
          <NavLink
            key={path}
            to={to}
            end={path === 'dashboard'}
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
            <span className="min-w-0 truncate">{t(labelKey)}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export function BottomNavigationBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const lang = useLangPrefix();

  const leftItems = navItems.slice(0, 3);
  const rightItems = navItems.slice(3);

  function BottomLink({ item }: { item: NavItem }) {
    const to = `/${lang}/${item.path}`;
    const Icon = item.icon;
    const label = t(item.labelKey);

    return (
      <NavLink
        to={to}
        end={item.path === 'dashboard'}
        aria-label={label}
        title={label}
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

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-4 xl:hidden">
      <div className="motion-surface mx-auto grid max-w-3xl grid-cols-[repeat(3,minmax(0,1fr))_auto_repeat(3,minmax(0,1fr))] items-center gap-1 rounded-[30px] border border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-16px_40px_rgba(15,23,42,0.08)] backdrop-blur">
        {leftItems.map((item) => (
          <BottomLink key={item.path} item={item} />
        ))}

        <button
          type="button"
          aria-label={t('navigation.create_new_project')}
          title={t('navigation.create_new_project')}
          onClick={() => navigate(`/${lang}/projetos?new=1`)}
          className="inline-flex h-14 w-14 -translate-y-6 items-center justify-center rounded-[22px] bg-[#635bff] text-white shadow-[0_18px_32px_rgba(99,91,255,0.35)] transition hover:-translate-y-7 hover:brightness-105"
        >
          <Plus size={22} />
        </button>

        {rightItems.map((item) => (
          <BottomLink key={item.path} item={item} />
        ))}
      </div>
    </div>
  );
}
