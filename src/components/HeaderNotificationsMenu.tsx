import { Bell } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { HeaderNotification } from './headerNotificationsModel'
import { NotificationCard, NOTIFICATION_CARD_MIN_HEIGHT } from './NotificationCard'
import { useHeaderNotifications } from './useHeaderNotifications'

const MAX_VISIBLE_NOTIFICATIONS = 4
const NOTIFICATION_CARD_GAP = 12
const NOTIFICATIONS_SCROLL_AREA_MAX_HEIGHT =
  MAX_VISIBLE_NOTIFICATIONS * NOTIFICATION_CARD_MIN_HEIGHT +
  (MAX_VISIBLE_NOTIFICATIONS - 1) * NOTIFICATION_CARD_GAP

export function HeaderNotificationsMenu() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const notificationMenuRef = useRef<HTMLDivElement | null>(null)
  const {
    notifications,
    isLoading,
    hasLoadError,
    handleRetryLoad,
    handleDismissNotification,
    handleNotificationClick: navigateToNotification,
  } = useHeaderNotifications()

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!notificationMenuRef.current) return

      if (
        event.target instanceof Node &&
        !notificationMenuRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleNotificationClick(notification: HeaderNotification) {
    setIsOpen(false)
    navigateToNotification(notification)
  }

  return (
    <div ref={notificationMenuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-label={t('common.open_notifications_aria')}
        aria-expanded={isOpen}
        className={`relative inline-flex h-14 w-14 items-center justify-center rounded-2xl border bg-white text-slate-700 shadow-sm shadow-slate-100 transition ${
          isOpen
            ? 'border-slate-300 bg-slate-50 text-slate-950'
            : 'border-slate-200 hover:bg-slate-50'
        }`}
      >
        <Bell size={20} />
        {notifications.length > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 py-0.5 text-[11px] font-bold text-white">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="motion-popover fixed left-3 right-3 top-22 z-30 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_24px_50px_rgba(15,23,42,0.12)] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+0.75rem)] sm:w-96 sm:max-w-[calc(100vw-1.5rem)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">{t('header.notifications_label')}</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                {t('header.notifications_heading')}
              </h3>
            </div>

            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {t('header.notifications_count', { count: notifications.length })}
            </span>
          </div>

          <div
            className="mt-4 space-y-3 overflow-y-auto pr-1"
            style={{
              maxHeight: `min(calc(100vh - 8.5rem), ${NOTIFICATIONS_SCROLL_AREA_MAX_HEIGHT}px)`,
            }}
          >
            {isLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                {t('header.notifications_loading')}
              </div>
            ) : hasLoadError ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-5 text-sm text-amber-800">
                <p>{t('header.notifications_error')}</p>
                <button
                  type="button"
                  onClick={() => {
                    void handleRetryLoad()
                  }}
                  className="mt-3 inline-flex rounded-2xl border border-amber-300 bg-white/80 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-white"
                >
                  {t('common.retry')}
                </button>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onDismiss={handleDismissNotification}
                  onClick={handleNotificationClick}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                {t('header.notifications_empty')}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
