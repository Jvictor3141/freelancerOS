import { AlertTriangle, ArrowUpRight, Clock3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DashboardPaymentMetrics } from '../../types/dashboard'
import { formatCurrencyCode } from '../../utils/formatting'
import { usePreferencesStore } from '../../stores/usePreferencesStore'
import { DashboardFinancialStatCard } from './DashboardFinancialStatCard'

type DashboardFinancialOverviewProps = {
  paymentMetrics: DashboardPaymentMetrics
}

export function DashboardFinancialOverview({
  paymentMetrics,
}: DashboardFinancialOverviewProps) {
  const { t } = useTranslation()
  const defaultCurrency = usePreferencesStore((s) => s.defaultCurrency)

  const cards = [
    {
      label: t('dashboard.financial_received'),
      value: formatCurrencyCode(paymentMetrics.receivedAmount, defaultCurrency),
      icon: ArrowUpRight,
    },
    {
      label: t('dashboard.financial_pending'),
      value: formatCurrencyCode(paymentMetrics.pendingAmount, defaultCurrency),
      icon: Clock3,
    },
    {
      label: t('dashboard.financial_overdue'),
      value: formatCurrencyCode(paymentMetrics.overdueAmount, defaultCurrency),
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="rounded-[28px] bg-[#635bff] p-3 md:p-6 text-white shadow-[0_24px_60px_rgba(99,91,255,0.28)] xl:col-span-8">
      <div className="flex h-full flex-col justify-between gap-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-indigo-100">
            {t('dashboard.financial_label')}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t('dashboard.financial_heading')}
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
