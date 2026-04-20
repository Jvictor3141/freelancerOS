import { ArrowUpRight, AlertTriangle, Clock3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { DashboardCurrencyBreakdown } from '../../types/dashboard'
import { formatCurrencyCompact } from '../../utils/formatting'
import { DashboardConvertedTotal } from './DashboardConvertedTotal'
import { useLangPath } from '../../i18n/hooks/useLangPath'

type DashboardFinancialOverviewProps = {
  paymentMetrics: DashboardCurrencyBreakdown[]
}

export function DashboardFinancialOverview({
  paymentMetrics,
}: DashboardFinancialOverviewProps) {
  const { t } = useTranslation()
  const langPath = useLangPath()

  return (
    <div className="rounded-[28px] bg-[#635bff] p-4 md:p-6 text-white shadow-[0_24px_60px_rgba(99,91,255,0.28)] xl:col-span-8">
      <div className="flex h-full flex-col gap-5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-indigo-100">
            {t('dashboard.financial_label')}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t('dashboard.financial_heading')}
          </h2>
        </div>

        {paymentMetrics.length === 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-indigo-200">
              {t('dashboard.financial_empty')}
            </p>
            <Link
              to={langPath('/projetos')}
              className="w-fit rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              {t('dashboard.financial_empty_cta')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Column headers */}
            <div className="grid grid-cols-[2.5rem_1fr_1fr_1fr] gap-3 px-1 text-xs font-medium uppercase tracking-[0.14em] text-indigo-200">
              <span>{t('dashboard.financial_currency')}</span>
              <span className="text-right text-xs">{t('dashboard.financial_received')}</span>
              <span className="text-right text-xs">{t('dashboard.financial_pending')}</span>
              <span className="text-right text-xs">{t('dashboard.financial_overdue')}</span>
            </div>

            {paymentMetrics.map((row) => (
              <div
                key={row.currency}
                className="grid grid-cols-[2.5rem_1fr_1fr_1fr] gap-3 rounded-2xl bg-white/10 px-3 py-3 backdrop-blur-sm"
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  <span className="text-sm">{row.currency}</span>
                </div>

                <div className="flex items-center justify-end gap-1 text-right">
                  <ArrowUpRight size={12} className="shrink-0 text-emerald-300" />
                  <span className="text-xs sm:text-sm font-semibold">
                    {formatCurrencyCompact(row.receivedAmount, row.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-1 text-right">
                  <Clock3 size={12} className="shrink-0 text-amber-300" />
                  <span className="text-xs sm:text-sm font-semibold">
                    {formatCurrencyCompact(row.pendingAmount, row.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-1 text-right">
                  <AlertTriangle size={12} className="shrink-0 text-rose-300" />
                  <span className="text-xs sm:text-sm font-semibold">
                    {formatCurrencyCompact(row.overdueAmount, row.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <DashboardConvertedTotal paymentMetrics={paymentMetrics} />
      </div>
    </div>
  )
}
