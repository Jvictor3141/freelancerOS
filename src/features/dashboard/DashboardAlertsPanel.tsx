import type { DashboardPaymentAlert } from '../../types/dashboard'
import { formatDashboardCurrency, formatDashboardDate } from '../../utils/dashboard'
import {
  paymentStatusClassName,
  paymentStatusLabel,
} from '../../utils/paymentStatus'

type DashboardAlertsPanelProps = {
  alerts: DashboardPaymentAlert[]
}

export function DashboardAlertsPanel({ alerts }: DashboardAlertsPanelProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 xl:col-span-4">
      <div className="mb-5">
        <p className="text-sm font-medium text-slate-500">Alertas</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          Clientes que precisam de atenção
        </h3>
      </div>

      <div className="space-y-3">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {alert.clientName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {alert.projectName}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClassName[alert.status]}`}
                >
                  {paymentStatusLabel[alert.status]}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>Vence em {formatDashboardDate(alert.dueDate)}</span>
                <span className="font-semibold text-slate-900">
                  {formatDashboardCurrency(alert.amount)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            Nenhum cliente com cobrança pendente ou atrasada.
          </div>
        )}
      </div>
    </div>
  )
}
