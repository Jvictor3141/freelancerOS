import { Suspense, lazy } from 'react'
import { useTranslation } from 'react-i18next'
import type { DashboardCurrencyBreakdown, DashboardRevenuePoint } from '../../types/dashboard'
import { formatCurrencyCode } from '../../utils/formatting'
import { CURRENCY_COLORS } from './DashboardRevenueChart'
import type { CurrencyCode } from '../../i18n/config'

const DashboardRevenueChart = lazy(async () => ({
  default: (await import('./DashboardRevenueChart')).DashboardRevenueChart,
}))

type DashboardRevenueSectionProps = {
  data: DashboardRevenuePoint[]
  paymentMetrics: DashboardCurrencyBreakdown[]
}

function RevenueChartFallback() {
  return <div className="h-64 animate-pulse rounded-3xl bg-slate-100 sm:h-80" />
}

export function DashboardRevenueSection({
  data,
  paymentMetrics,
}: DashboardRevenueSectionProps) {
  const { t } = useTranslation()

  const receivedByCurrency = paymentMetrics.filter((row) => row.receivedAmount > 0)

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 xl:col-span-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {t('dashboard.revenue_label')}
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            {t('dashboard.revenue_heading')}
          </h3>
        </div>

        {receivedByCurrency.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {receivedByCurrency.map((row) => (
              <div key={row.currency} className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: CURRENCY_COLORS[row.currency as CurrencyCode] }}
                  />
                  {row.currency}
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {formatCurrencyCode(row.receivedAmount, row.currency)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Suspense fallback={<RevenueChartFallback />}>
        <DashboardRevenueChart data={data} />
      </Suspense>
    </div>
  )
}
