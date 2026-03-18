import type { DashboardRecentActivity } from '../../types/dashboard'
import { formatDashboardCurrency, formatDashboardDate } from '../../utils/dashboard'
import {
  projectStatusClassName,
  projectStatusLabel,
} from '../../utils/projectStatus'

type DashboardRecentActivitiesPanelProps = {
  activities: DashboardRecentActivity[]
}

export function DashboardRecentActivitiesPanel({
  activities,
}: DashboardRecentActivitiesPanelProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 xl:col-span-4">
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-500">
          Atividade recente
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          Últimos projetos criados
        </h3>
      </div>

      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">
                    {activity.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {activity.clientName}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${projectStatusClassName[activity.status]}`}
                >
                  {projectStatusLabel[activity.status]}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>{formatDashboardDate(activity.createdAt)}</span>
                <span>{formatDashboardCurrency(activity.value)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
            Nenhuma atividade recente encontrada.
          </div>
        )}
      </div>
    </div>
  )
}
