import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { DashboardPaymentAlert } from '../../types/dashboard'
import { formatDashboardCurrency, formatDashboardDate } from '../../utils/dashboard'
import {
  paymentStatusClassName,
  paymentStatusLabel,
} from '../../utils/paymentStatus'

const MAX_VISIBLE_ALERT_CARDS = 1
const ALERT_CARD_MIN_HEIGHT = 102
const ALERT_CARD_GAP = 12
const ALERTS_SCROLL_AREA_MAX_HEIGHT =
  MAX_VISIBLE_ALERT_CARDS * ALERT_CARD_MIN_HEIGHT +
  (MAX_VISIBLE_ALERT_CARDS - 1) * ALERT_CARD_GAP

type DashboardAlertsPanelProps = {
  alerts: DashboardPaymentAlert[]
}

export function DashboardAlertsPanel({ alerts }: DashboardAlertsPanelProps) {
  const alertsListRef = useRef<HTMLDivElement>(null)
  const [canScrollDown, setCanScrollDown] = useState(false)

  useEffect(() => {
    const listElement = alertsListRef.current

    if (!listElement) {
      setCanScrollDown(false)
      return
    }

    const currentListElement = listElement

    function updateScrollHint() {
      const hiddenContentBelow =
        currentListElement.scrollHeight -
        currentListElement.scrollTop -
        currentListElement.clientHeight

      setCanScrollDown(hiddenContentBelow > 4)
    }

    updateScrollHint()

    currentListElement.addEventListener('scroll', updateScrollHint, { passive: true })

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            updateScrollHint()
          })
        : null

    resizeObserver?.observe(currentListElement)
    window.addEventListener('resize', updateScrollHint)

    return () => {
      currentListElement.removeEventListener('scroll', updateScrollHint)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateScrollHint)
    }
  }, [alerts.length])

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100 xl:col-span-4">
      <div className="mb-4">
        <p className="text-sm font-medium text-slate-500">Alertas</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          Clientes que precisam de atenção
        </h3>
      </div>

      <div className="relative">
        <div
          ref={alertsListRef}
          className="space-y-3 overflow-y-auto pr-1"
          style={{ maxHeight: `${ALERTS_SCROLL_AREA_MAX_HEIGHT}px` }}
          aria-label="Lista de alertas"
        >
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="min-h-25.5 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {alert.clientName}
                    </p>
                    <p className="mt-1 truncate text-sm text-slate-500">
                      {alert.projectName}
                    </p>
                  </div>

                  <span
                    className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClassName[alert.status]}`}
                  >
                    {paymentStatusLabel[alert.status]}
                  </span>
                </div>

                <div className="mt-2.5 flex flex-col gap-1.5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                  <span>Vence em {formatDashboardDate(alert.dueDate)}</span>
                  <span className="font-semibold text-slate-900">
                    {formatDashboardCurrency(alert.amount)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
              Nenhum cliente com cobrança pendente ou atrasada.
            </div>
          )}
        </div>

        {canScrollDown ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center rounded-b-2xl bg-linear-to-t from-white via-white/94 to-transparent translate-y-10 px-4 pb-0 pt-1 text-center text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              Role para ver mais
              <ChevronDown size={14} />
            </span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
