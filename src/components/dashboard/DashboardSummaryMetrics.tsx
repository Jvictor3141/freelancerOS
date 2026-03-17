import {
  ArrowUpRight,
  CheckCircle2,
  FolderKanban,
  Users,
} from 'lucide-react'
import {
  formatDashboardCurrency,
  type DashboardMetricSummary,
} from '../../utils/dashboard'
import { DashboardMetricCard } from './DashboardMetricCard'

type DashboardSummaryMetricsProps = {
  metrics: DashboardMetricSummary
}

export function DashboardSummaryMetrics({
  metrics,
}: DashboardSummaryMetricsProps) {
  const cards = [
    {
      label: 'Clientes',
      value: metrics.totalClients,
      description: 'Base ativa cadastrada',
      icon: Users,
      iconClassName: 'bg-slate-100 text-slate-700',
    },
    {
      label: 'Projetos ativos',
      value: metrics.projectsInProgress,
      description: 'Em andamento ou revisão',
      icon: FolderKanban,
      iconClassName: 'bg-blue-100 text-blue-700',
    },
    {
      label: 'Concluídos',
      value: metrics.completedProjects,
      description: 'Projetos finalizados',
      icon: CheckCircle2,
      iconClassName: 'bg-emerald-100 text-emerald-700',
    },
    {
      label: 'Ticket médio',
      value: formatDashboardCurrency(metrics.averageTicket),
      description: 'Valor médio por projeto',
      icon: ArrowUpRight,
      iconClassName: 'bg-violet-100 text-violet-700',
    },
  ]

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <DashboardMetricCard key={card.label} {...card} />
      ))}
    </section>
  )
}
