import { Suspense, lazy } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { DashboardCurrencyBreakdown, DashboardRevenuePoint } from '../../types/dashboard'
import { formatCurrencyCode } from '../../utils/formatting'
import { CURRENCY_COLORS } from './dashboardRevenueColors'
import type { CurrencyCode } from '../../i18n/config'
import { useLangPath } from '../../i18n/hooks/useLangPath'

const DashboardRevenueChart = lazy(async () => ({
  default: (await import('./DashboardRevenueChart')).DashboardRevenueChart,
}))

type Trend =
  | { type: 'up'; pct: number }
  | { type: 'down'; pct: number }
  | { type: 'flat' }
  | { type: 'new' }
  | { type: 'none' }

function calcRevenueTrend(data: DashboardRevenuePoint[], currency: CurrencyCode): Trend {
  const now = new Date()
  const currYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevYM = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`

  const curr = data.find((p) => p.currency === currency && p.month.startsWith(currYM))?.revenue ?? 0
  const prev = data.find((p) => p.currency === currency && p.month.startsWith(prevYM))?.revenue ?? 0

  if (curr === 0 && prev === 0) return { type: 'none' }
  if (prev === 0) return { type: 'new' }

  const pct = Math.round(((curr - prev) / prev) * 100)
  if (pct === 0) return { type: 'flat' }
  return { type: pct > 0 ? 'up' : 'down', pct: Math.abs(pct) }
}

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
  const langPath = useLangPath()

  const receivedByCurrency = paymentMetrics.filter((row) => row.receivedAmount > 0)
  const hasData = data.length > 0

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
            {receivedByCurrency.map((row) => {
              const trend = calcRevenueTrend(data, row.currency as CurrencyCode)
              return (
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
                  {trend.type !== 'none' && (
                    <p
                      className={`mt-1 text-[11px] font-medium ${
                        trend.type === 'up'
                          ? 'text-emerald-600'
                          : trend.type === 'down'
                            ? 'text-rose-500'
                            : 'text-slate-400'
                      }`}
                    >
                      {trend.type === 'up'
                        ? t('dashboard.revenue_trend_up', { pct: trend.pct })
                        : trend.type === 'down'
                          ? t('dashboard.revenue_trend_down', { pct: trend.pct })
                          : trend.type === 'new'
                            ? t('dashboard.revenue_trend_new')
                            : t('dashboard.revenue_trend_flat')}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {hasData ? (
        <Suspense fallback={<RevenueChartFallback />}>
          <DashboardRevenueChart data={data} />
        </Suspense>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50 sm:h-80">
          <p className="text-sm text-slate-500">{t('dashboard.revenue_empty')}</p>
          <Link
            to={langPath('/pagamentos')}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {t('dashboard.revenue_empty_cta')}
          </Link>
        </div>
      )}
    </div>
  )
}
