import { Suspense, lazy } from 'react'
import type { DashboardRevenuePoint } from '../../types/dashboard'
import { formatDashboardCurrency } from '../../utils/dashboard'

const DashboardRevenueChart = lazy(async () => ({
  default: (await import('./DashboardRevenueChart')).DashboardRevenueChart,
}))

type DashboardRevenueSectionProps = {
  data: DashboardRevenuePoint[]
  totalReceived: number
}

function RevenueChartFallback() {
  return <div className="h-64 animate-pulse rounded-3xl bg-slate-100 sm:h-80" />
}

export function DashboardRevenueSection({
  data,
  totalReceived,
}: DashboardRevenueSectionProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 xl:col-span-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Entradas de dinheiro
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Recebimentos dos Últimos 6 meses
          </h3>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
            Total recebido
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-950">
            {formatDashboardCurrency(totalReceived)}
          </p>
        </div>
      </div>

      <Suspense fallback={<RevenueChartFallback />}>
        <DashboardRevenueChart data={data} />
      </Suspense>
    </div>
  )
}
