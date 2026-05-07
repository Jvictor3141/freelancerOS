import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { DashboardRecentActivity } from '../../types/dashboard'
import { formatCurrencyCode, formatDate } from '../../utils/formatting'
import {
  projectStatusClassName,
  projectStatusLabel,
} from '../../utils/projectStatus'
import { useLangPath } from '../../i18n/hooks/useLangPath'

const MAX_VISIBLE_ACTIVITY_CARDS = 3
const ACTIVITY_CARD_MIN_HEIGHT = 116
const ACTIVITY_CARD_GAP = 12
const ACTIVITIES_SCROLL_AREA_MAX_HEIGHT =
  MAX_VISIBLE_ACTIVITY_CARDS * ACTIVITY_CARD_MIN_HEIGHT +
  (MAX_VISIBLE_ACTIVITY_CARDS - 1) * ACTIVITY_CARD_GAP

type DashboardRecentActivitiesPanelProps = {
  activities: DashboardRecentActivity[]
}

export function DashboardRecentActivitiesPanel({
  activities,
}: DashboardRecentActivitiesPanelProps) {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.resolvedLanguage ?? 'pt'
  const langPath = useLangPath()

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 xl:col-span-4">
      <div className="mb-6">
        <p className="text-sm font-medium text-slate-500">
          {t('dashboard.recent_activities_label')}
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          {t('dashboard.recent_activities_heading')}
        </h3>
      </div>

      <div
        className="space-y-3 overflow-y-auto pr-1"
        style={{ maxHeight: `${ACTIVITIES_SCROLL_AREA_MAX_HEIGHT}px` }}
        aria-label={t('dashboard.recent_activities_aria')}
      >
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="min-h-29 rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
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
                  {t(projectStatusLabel[activity.status])}
                </span>
              </div>

              <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                <span>{formatDate(activity.createdAt, currentLang)}</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrencyCode(activity.value, activity.currency)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6">
            <p className="text-sm text-slate-500">{t('dashboard.recent_activities_empty')}</p>
            <Link
              to={langPath('/projetos')}
              className="w-fit rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              {t('dashboard.recent_activities_empty_cta')}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
