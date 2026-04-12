import {
  ArrowUpRight,
  CheckCircle2,
  FolderKanban,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import type { DashboardMetricSummary } from '../../types/dashboard'
import { formatDashboardCurrency } from '../../utils/dashboard'
import { DashboardMetricCard } from './DashboardMetricCard'
import { isSupportedLanguage } from '../../i18n/config'

type DashboardSummaryMetricsProps = {
  metrics: DashboardMetricSummary
}

export function DashboardSummaryMetrics({
  metrics,
}: DashboardSummaryMetricsProps) {
  const { t, i18n } = useTranslation()
  const { lang } = useParams<{ lang?: string }>()
  const currentLang = lang && isSupportedLanguage(lang) ? lang : (i18n.resolvedLanguage ?? 'pt')

  const cards = [
    {
      label: t('dashboard.metrics_clients'),
      value: metrics.totalClients,
      description: t('dashboard.metrics_clients_description'),
      icon: Users,
      iconClassName: 'bg-slate-100 text-slate-700',
    },
    {
      label: t('dashboard.metrics_active_projects'),
      value: metrics.projectsInProgress,
      description: t('dashboard.metrics_active_projects_description'),
      icon: FolderKanban,
      iconClassName: 'bg-blue-100 text-blue-700',
    },
    {
      label: t('dashboard.metrics_completed'),
      value: metrics.completedProjects,
      description: t('dashboard.metrics_completed_description'),
      icon: CheckCircle2,
      iconClassName: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: t('dashboard.metrics_average_ticket'),
      value: formatDashboardCurrency(metrics.averageTicket, currentLang),
      description: t('dashboard.metrics_average_ticket_description'),
      icon: ArrowUpRight,
      iconClassName: 'bg-violet-100 text-violet-700',
    },
  ]

  return (
    <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {cards.map((card) => (
        <DashboardMetricCard key={card.label} {...card} />
      ))}
    </section>
  )
}
