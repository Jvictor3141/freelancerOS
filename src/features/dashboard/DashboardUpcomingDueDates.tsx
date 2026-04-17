import { useTranslation } from 'react-i18next'
import type { DashboardPaymentAlert } from '../../types/dashboard'
import { formatCurrencyCode } from '../../utils/formatting'

type UrgencyLevel = 'today' | 'soon' | 'week' | 'later'

type UpcomingItem = DashboardPaymentAlert & { daysUntil: number; urgency: UrgencyLevel }

const URGENCY_CLASSES: Record<UrgencyLevel, string> = {
  today: 'bg-rose-50 border-rose-200 text-rose-700',
  soon:  'bg-amber-50 border-amber-200 text-amber-700',
  week:  'bg-yellow-50 border-yellow-200 text-yellow-700',
  later: 'bg-slate-50 border-slate-200 text-slate-600',
}

const BADGE_CLASSES: Record<UrgencyLevel, string> = {
  today: 'bg-rose-100 text-rose-700',
  soon:  'bg-amber-100 text-amber-700',
  week:  'bg-yellow-100 text-yellow-700',
  later: 'bg-slate-100 text-slate-500',
}

function daysUntil(dueDate: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - today.getTime()) / 86_400_000)
}

function urgencyLevel(days: number): UrgencyLevel {
  if (days === 0) return 'today'
  if (days <= 3) return 'soon'
  if (days <= 7) return 'week'
  return 'later'
}

function buildUpcomingItems(payments: DashboardPaymentAlert[]): UpcomingItem[] {
  return payments.map((p) => {
    const days = daysUntil(p.dueDate)
    return { ...p, daysUntil: days, urgency: urgencyLevel(days) }
  })
}

type DashboardUpcomingDueDatesProps = {
  payments: DashboardPaymentAlert[]
}

export function DashboardUpcomingDueDates({ payments }: DashboardUpcomingDueDatesProps) {
  const { t } = useTranslation()
  const items = buildUpcomingItems(payments)

  if (items.length === 0) return null

  return (
    <section aria-label={t('dashboard.upcoming_label')}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {t('dashboard.upcoming_label')}
      </p>

      <div className="flex gap-3 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        {items.map((item) => {
          const badge =
            item.daysUntil === 0
              ? t('dashboard.upcoming_today')
              : item.daysUntil === 1
                ? t('dashboard.upcoming_tomorrow')
                : t('dashboard.upcoming_in_days', { count: item.daysUntil })

          return (
            <div
              key={item.id}
              className={`flex shrink-0 flex-col gap-1 rounded-2xl border px-4 py-3 sm:shrink ${URGENCY_CLASSES[item.urgency]}`}
            >
              <span
                className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${BADGE_CLASSES[item.urgency]}`}
              >
                {badge}
              </span>
              <p className="max-w-44 truncate text-sm font-semibold">
                {item.clientName}
              </p>
              <p className="text-xs opacity-70 max-w-44 truncate">
                {item.projectName}
              </p>
              <p className="mt-0.5 text-sm font-bold">
                {formatCurrencyCode(item.amount, item.currency)}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
