import {
  CheckCircle2,
  FolderKanban,
  Target,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DashboardMetricSummary } from '../../types/dashboard'
import { DashboardMetricCard } from './DashboardMetricCard'

type DashboardSummaryMetricsProps = {
  metrics: DashboardMetricSummary
}

export function DashboardSummaryMetrics({
  metrics,
}: DashboardSummaryMetricsProps) {
  const { t } = useTranslation()

  const acceptanceRateDisplay =
    metrics.proposalAcceptanceRate === 0
      ? '—'
      : `${metrics.proposalAcceptanceRate.toFixed(0)}%`

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
      label: t('dashboard.metrics_proposal_acceptance_rate'),
      value: acceptanceRateDisplay,
      description: t('dashboard.metrics_proposal_acceptance_rate_description'),
      icon: Target,
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
