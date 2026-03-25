import { Bell, CheckCheck, CircleAlert, Clock3, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { useClientStore } from '../stores/useClientStore'
import { usePaymentStore } from '../stores/usePaymentStore'
import { useProjectStore } from '../stores/useProjectStore'
import { useProposalStore } from '../stores/useProposalStore'
import type {
  HeaderNotification,
  HeaderNotificationTone,
  HeaderNotificationType,
} from '../utils/headerNotifications'
import {
  getHeaderNotifications,
  getVisibleHeaderNotifications,
  readDismissedHeaderNotificationIds,
  writeDismissedHeaderNotificationIds,
} from '../utils/headerNotifications'
import { getPaymentsWithRelations } from '../utils/paymentsPage'
import { getProjectsWithClient } from '../utils/projectsPage'
import { getProposalsWithClient } from '../utils/proposalsPage'
import { formatDate, formatDateTime } from '../utils/formatting'

const MAX_VISIBLE_NOTIFICATIONS = 4
const NOTIFICATION_CARD_MIN_HEIGHT = 132
const NOTIFICATION_CARD_GAP = 12
const NOTIFICATIONS_SCROLL_AREA_MAX_HEIGHT =
  MAX_VISIBLE_NOTIFICATIONS * NOTIFICATION_CARD_MIN_HEIGHT +
  (MAX_VISIBLE_NOTIFICATIONS - 1) * NOTIFICATION_CARD_GAP

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
  if (type === 'proposal_accepted') {
    return <CheckCheck size={18} />
  }

  if (type === 'payment_due_today' || type === 'payment_overdue') {
    return <CircleAlert size={18} />
  }

  return <Clock3 size={18} />
}

function getNotificationMeta(notification: HeaderNotification) {
  if (notification.type === 'proposal_accepted') {
    return `Aceite em ${formatDateTime(notification.occurredAt)}`
  }

  if (notification.type === 'payment_overdue') {
    return `Venceu em ${formatDate(notification.occurredAt)}`
  }

  return `Prazo em ${formatDate(notification.occurredAt)}`
}

export function HeaderNotificationsMenu() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const clients = useClientStore((state) => state.clients)
  const clientsInitialized = useClientStore((state) => state.initialized)
  const ensureClientsLoaded = useClientStore(
    (state) => state.ensureClientsLoaded,
  )

  const projects = useProjectStore((state) => state.projects)
  const projectsInitialized = useProjectStore((state) => state.initialized)
  const ensureProjectsLoaded = useProjectStore(
    (state) => state.ensureProjectsLoaded,
  )

  const payments = usePaymentStore((state) => state.payments)
  const paymentsInitialized = usePaymentStore((state) => state.initialized)
  const ensurePaymentsLoaded = usePaymentStore(
    (state) => state.ensurePaymentsLoaded,
  )

  const proposals = useProposalStore((state) => state.proposals)
  const proposalsInitialized = useProposalStore((state) => state.initialized)
  const ensureProposalsLoaded = useProposalStore(
    (state) => state.ensureProposalsLoaded,
  )

  const [isOpen, setIsOpen] = useState(false)
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<
    string[]
  >([])

  const notificationMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!user) {
      return
    }

    void Promise.all([
      ensureClientsLoaded(),
      ensureProjectsLoaded(),
      ensurePaymentsLoaded(),
      ensureProposalsLoaded(),
    ])
  }, [
    user,
    ensureClientsLoaded,
    ensureProjectsLoaded,
    ensurePaymentsLoaded,
    ensureProposalsLoaded,
  ])

  useEffect(() => {
    if (!user) {
      setDismissedNotificationIds([])
      return
    }

    setDismissedNotificationIds(readDismissedHeaderNotificationIds(user.id))
  }, [user])

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!notificationMenuRef.current) {
        return
      }

      if (
        event.target instanceof Node &&
        !notificationMenuRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const notifications = getVisibleHeaderNotifications(
    getHeaderNotifications({
      proposals: getProposalsWithClient(proposals, clients),
      projects: getProjectsWithClient(projects, clients),
      payments: getPaymentsWithRelations(payments, projects, clients),
    }),
    dismissedNotificationIds,
  )

  const isLoading =
    Boolean(user) &&
    (!clientsInitialized ||
      !projectsInitialized ||
      !paymentsInitialized ||
      !proposalsInitialized)

  function handleDismissNotification(notificationId: string) {
    setDismissedNotificationIds((currentNotificationIds) => {
      if (currentNotificationIds.includes(notificationId)) {
        return currentNotificationIds
      }

      const nextNotificationIds = [...currentNotificationIds, notificationId]
      writeDismissedHeaderNotificationIds(user?.id ?? null, nextNotificationIds)
      return nextNotificationIds
    })
  }

  function handleNotificationClick(notification: HeaderNotification) {
    setIsOpen(false)
    navigate(notification.path)
  }

  return (
    <div ref={notificationMenuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        aria-label="Abrir notificacoes"
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
        <div className="motion-popover fixed left-3 right-3 top-[5.5rem] z-30 rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_24px_50px_rgba(15,23,42,0.12)] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+0.75rem)] sm:w-96 sm:max-w-[calc(100vw-1.5rem)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Notificacoes</p>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                Agenda operacional
              </h3>
            </div>

            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {notifications.length} ativo(s)
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
                Carregando notificacoes...
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => {
                const toneClassName = getNotificationToneClassName(
                  notification.tone,
                )

                return (
                  <article
                    key={notification.id}
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
                            onClick={() => handleNotificationClick(notification)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className="text-sm font-semibold text-slate-950">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {notification.description}
                            </p>
                            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                              {getNotificationMeta(notification)}
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDismissNotification(notification.id)
                            }
                            aria-label={`Dispensar notificacao: ${notification.title}`}
                            title="Dispensar notificacao"
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/85 text-slate-500 transition hover:bg-white hover:text-slate-700"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                Nenhuma notificacao no momento.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
