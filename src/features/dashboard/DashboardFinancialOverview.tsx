import { AlertTriangle, ArrowUpRight, Clock3 } from 'lucide-react'
import type { DashboardPaymentMetrics } from '../../types/dashboard'
import { formatDashboardCurrency } from '../../utils/dashboard'
import { DashboardFinancialStatCard } from './DashboardFinancialStatCard'

type DashboardFinancialOverviewProps = {
  paymentMetrics: DashboardPaymentMetrics
}

export function DashboardFinancialOverview({
  paymentMetrics,
}: DashboardFinancialOverviewProps) {
  const cards = [
    {
      label: 'Recebido',
      value: formatDashboardCurrency(paymentMetrics.receivedAmount),
      icon: ArrowUpRight,
    },
    {
      label: 'Pendente',
      value: formatDashboardCurrency(paymentMetrics.pendingAmount),
      icon: Clock3,
    },
    {
      label: 'Atrasado',
      value: formatDashboardCurrency(paymentMetrics.overdueAmount),
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="rounded-[28px] bg-[#635bff] p-3 md:p-6 text-white shadow-[0_24px_60px_rgba(99,91,255,0.28)] xl:col-span-8">
      <div className="flex h-full flex-col justify-between gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-indigo-100">
            Visão financeira
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Entradas de dinheiro e saúde do negócio
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {cards.map((card) => (
            <DashboardFinancialStatCard key={card.label} {...card} />
          ))}
        </div>
      </div>
    </div>
  )
}
