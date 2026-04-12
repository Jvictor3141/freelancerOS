import { RefreshCw, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { DashboardCurrencyBreakdown } from '../../types/dashboard'
import { convertToBase } from '../../services/exchangeRateService'
import { useExchangeRates } from '../../hooks/useExchangeRates'
import { usePreferencesStore } from '../../stores/usePreferencesStore'
import { formatCurrencyCode } from '../../utils/formatting'

type DashboardConvertedTotalProps = {
  paymentMetrics: DashboardCurrencyBreakdown[]
}

export function DashboardConvertedTotal({
  paymentMetrics,
}: DashboardConvertedTotalProps) {
  const { t } = useTranslation()
  const defaultCurrency = usePreferencesStore((s) => s.defaultCurrency)
  const [enabled, setEnabled] = useState(false)

  const { rates, isLoading, isStale, error, retry } = useExchangeRates(
    enabled ? defaultCurrency : 'BRL',
  )

  const needsConversion = paymentMetrics.some(
    (row) => row.currency !== defaultCurrency,
  )

  if (!needsConversion || paymentMetrics.length === 0) {
    return null
  }

  if (!enabled) {
    return (
      <button
        type="button"
        onClick={() => setEnabled(true)}
        className="mt-auto w-fit self-end rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
      >
        {t('dashboard.financial_converted_toggle', { currency: defaultCurrency })}
      </button>
    )
  }

  const totalReceived =
    rates !== null
      ? paymentMetrics.reduce(
          (sum, row) => sum + convertToBase(row.receivedAmount, row.currency, rates),
          0,
        )
      : null

  const totalPending =
    rates !== null
      ? paymentMetrics.reduce(
          (sum, row) => sum + convertToBase(row.pendingAmount, row.currency, rates),
          0,
        )
      : null

  return (
    <div className="mt-auto rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <TriangleAlert size={13} className="text-amber-300" />
          <p className="text-xs font-medium text-amber-200">
            {isStale
              ? t('dashboard.financial_converted_stale')
              : t('dashboard.financial_converted_disclaimer')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setEnabled(false)}
          className="text-xs text-indigo-200 hover:text-white"
        >
          {t('dashboard.financial_converted_hide')}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-indigo-200">
          <RefreshCw size={12} className="animate-spin" />
          {t('dashboard.financial_converted_loading')}
        </div>
      ) : error && rates === null ? (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-rose-200">
            {t('dashboard.financial_converted_error')}
          </p>
          <button
            type="button"
            onClick={retry}
            className="text-xs font-medium text-white hover:underline"
          >
            {t('common.retry')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-indigo-200">
              {t('dashboard.financial_received')}
            </p>
            <p className="mt-0.5 text-lg font-semibold">
              {totalReceived !== null
                ? `≈ ${formatCurrencyCode(totalReceived, defaultCurrency)}`
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-indigo-200">
              {t('dashboard.financial_pending')}
            </p>
            <p className="mt-0.5 text-lg font-semibold">
              {totalPending !== null
                ? `≈ ${formatCurrencyCode(totalPending, defaultCurrency)}`
                : '—'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
