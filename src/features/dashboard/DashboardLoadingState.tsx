import { useTranslation } from 'react-i18next';

export function DashboardLoadingState() {
  const { t } = useTranslation();

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-100">
      <p className="text-sm font-medium text-slate-500">{t('navigation.dashboard')}</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
        {t('common.loading_db')}
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        {t('dashboard.loading_description')}
      </p>
    </section>
  )
}
