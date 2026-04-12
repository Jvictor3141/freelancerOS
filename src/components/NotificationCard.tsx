import { CheckCheck, CircleAlert, Clock3, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDate, formatDateTime } from '../utils/formatting'
import type {
  HeaderNotification,
  HeaderNotificationTone,
  HeaderNotificationType,
} from './headerNotificationsModel'

export const NOTIFICATION_CARD_MIN_HEIGHT = 132

function getNotificationToneClassName(tone: HeaderNotificationTone) {
  if (tone === 'danger') {
    return {
      card: 'border-rose-200 bg-rose-50/80 hover:bg-rose-100/80',
      icon: 'bg-rose-100 text-rose-700',
    }
  }

  if (tone === 'warning') {
    return {
      card: 'border-amber-200 bg-amber-50/80 hover:bg-amber-100/80',
      icon: 'bg-amber-100 text-amber-700',
    }
  }

  return {
    card: 'border-emerald-200 bg-emerald-50/80 hover:bg-emerald-100/80',
    icon: 'bg-emerald-100 text-emerald-700',
  }
}

function getNotificationIcon(type: HeaderNotificationType) {
  if (type === 'proposal_accepted') return <CheckCheck size={18} />
  if (type === 'payment_due_today' || type === 'payment_overdue') {
    return <CircleAlert size={18} />
  }
  return <Clock3 size={18} />
}

type NotificationCardProps = {
  notification: HeaderNotification
  onDismiss: (id: string) => void
  onClick: (notification: HeaderNotification) => void
}

export function NotificationCard({
  notification,
  onDismiss,
  onClick,
}: NotificationCardProps) {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.resolvedLanguage ?? 'pt'
  const toneClassName = getNotificationToneClassName(notification.tone)

  function getNotificationMeta() {
    if (notification.type === 'proposal_accepted') {
      return t('header.notifications_meta_accepted', { date: formatDateTime(notification.occurredAt, currentLang) })
    }
    if (notification.type === 'payment_overdue') {
      return t('header.notifications_meta_expired', { date: formatDate(notification.occurredAt, currentLang) })
    }
    return t('header.notifications_meta_due', { date: formatDate(notification.occurredAt, currentLang) })
  }

  return (
    <article
      className={`rounded-2xl border p-4 ${toneClassName.card}`}
      style={{ minHeight: `${NOTIFICATION_CARD_MIN_HEIGHT}px` }}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${toneClassName.icon}`}
        >
          {getNotificationIcon(notification.type)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => onClick(notification)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="text-sm font-semibold text-slate-950">
                {notification.title}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {notification.description}
              </p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {getNotificationMeta()}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onDismiss(notification.id)}
              aria-label={t('common.dismiss_notification_aria', { title: notification.title })}
              title={t('common.dismiss_notification')}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-500 transition hover:bg-white hover:text-slate-700"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
