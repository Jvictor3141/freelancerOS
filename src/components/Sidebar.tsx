import { useTranslation } from 'react-i18next';
import { BrandLogo } from './BrandLogo';
import { useAuthStore } from '../stores/useAuthStore';
import { NavigationList } from './navigation';

export function Sidebar() {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white/90 px-5 py-6 backdrop-blur xl:flex xl:flex-col">
      <div className="motion-surface rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <BrandLogo variant="lockup" className="h-9 w-auto" />
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {t('sidebar.operational_panel')}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {t('sidebar.description')}
        </p>
      </div>

      <NavigationList className="mt-8 space-y-2" />

      <div className="motion-surface mt-auto rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 inline-flex rounded-2xl bg-white p-3 shadow-sm shadow-slate-200">
          <BrandLogo variant="mark" className="h-5 w-5" alt="" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {t('sidebar.connected_account')}
        </p>
        <h2 className="mt-2 break-all text-sm font-semibold text-slate-900">
          {user?.email ?? t('sidebar.authenticated_user')}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {t('sidebar.data_security_note')}
        </p>
      </div>
    </aside>
  );
}