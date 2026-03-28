import type {
  PaymentWithProjectAndClient,
  ProjectWithClient,
  ProposalWithClient,
} from '../types/viewModels'
import {
  buildScopedStorageKey,
  excludeItemsById,
  readStoredStringList,
  writeStoredStringList,
} from './persistedStringList'
import { parseCalendarDate } from './dateOnly'
import { canMarkPaymentAsPaid } from './paymentRules'
import { isAcceptedProposal } from './proposalRules'
import { isActiveProject } from './projectRules'

export type HeaderNotificationType =
  | 'proposal_accepted'
  | 'payment_overdue'
  | 'payment_due_today'
  | 'project_due_soon'
  | 'project_due_today'

export type HeaderNotificationTone = 'success' | 'warning' | 'danger'

export type HeaderNotification = {
  id: string
  type: HeaderNotificationType
  tone: HeaderNotificationTone
  title: string
  description: string
  occurredAt: string
  path: '/pagamentos' | '/projetos' | '/propostas'
}

type HeaderNotificationCollections = {
  proposals: ProposalWithClient[]
  projects: ProjectWithClient[]
  payments: PaymentWithProjectAndClient[]
}

const ISO_DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const DISMISSED_HEADER_NOTIFICATIONS_STORAGE_PREFIX =
  'dismissed-header-notifications'
const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000

const notificationPriority: Record<HeaderNotificationType, number> = {
  payment_overdue: 0,
  project_due_today: 1,
  payment_due_today: 2,
  project_due_soon: 3,
  proposal_accepted: 4,
}

function parseComparableDate(value: string | null | undefined) {
  if (!value) {
    return null
  }

  if (ISO_DATE_ONLY_PATTERN.test(value)) {
    return parseCalendarDate(value)
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

function toCalendarDayTimestamp(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function getCalendarDayDifference(
  value: string | null | undefined,
  now = new Date(),
) {
  const targetDate = parseCalendarDate(value)

  if (!targetDate) {
    return null
  }

  return Math.round(
    (toCalendarDayTimestamp(targetDate) - toCalendarDayTimestamp(now)) /
      MILLISECONDS_IN_DAY,
  )
}

function getComparableTimestamp(value: string) {
  return parseComparableDate(value)?.getTime() ?? 0
}

function formatRemainingDaysLabel(remainingDays: number) {
  return remainingDays === 1 ? '1 dia' : `${remainingDays} dias`
}

function getDismissedHeaderNotificationsStorageKey(userId: string | null) {
  return buildScopedStorageKey(
    DISMISSED_HEADER_NOTIFICATIONS_STORAGE_PREFIX,
    userId,
  )
}

export function buildHeaderNotificationId(
  type: HeaderNotificationType,
  entityId: string,
  occurredAt: string,
) {
  return `${type}:${entityId}:${occurredAt}`
}

export function readDismissedHeaderNotificationIds(userId: string | null) {
  return readStoredStringList(getDismissedHeaderNotificationsStorageKey(userId))
}

export function writeDismissedHeaderNotificationIds(
  userId: string | null,
  notificationIds: string[],
) {
  writeStoredStringList(
    getDismissedHeaderNotificationsStorageKey(userId),
    notificationIds,
  )
}

export function getVisibleHeaderNotifications(
  notifications: HeaderNotification[],
  dismissedNotificationIds: string[],
) {
  return excludeItemsById(
    notifications,
    dismissedNotificationIds,
    (notification) => notification.id,
  )
}

function getProposalAcceptedNotifications(
  proposals: ProposalWithClient[],
): HeaderNotification[] {
  const notifications: HeaderNotification[] = []

  for (const proposal of proposals) {
    if (!isAcceptedProposal(proposal)) {
      continue
    }

    const occurredAt = proposal.acceptedAt ?? proposal.clientRespondedAt

    if (typeof occurredAt !== 'string' || !parseComparableDate(occurredAt)) {
      continue
    }

    notifications.push({
      id: buildHeaderNotificationId(
        'proposal_accepted',
        proposal.id,
        occurredAt,
      ),
      type: 'proposal_accepted',
      tone: 'success',
      title: `${proposal.clientName} aceitou a proposta`,
      description: `${proposal.title} virou projeto automaticamente.`,
      occurredAt,
      path: proposal.projectId ? '/projetos' : '/propostas',
    })
  }

  return notifications
}

function getPaymentDueTodayNotifications(
  payments: PaymentWithProjectAndClient[],
  now = new Date(),
): HeaderNotification[] {
  const notifications: HeaderNotification[] = []

  for (const payment of payments) {
    if (!canMarkPaymentAsPaid(payment)) {
      continue
    }

    const remainingDays = getCalendarDayDifference(payment.dueDate, now)

    if (remainingDays === null) {
      continue
    }

    if (payment.status === 'overdue') {
      notifications.push({
        id: buildHeaderNotificationId(
          'payment_overdue',
          payment.id,
          payment.dueDate,
        ),
        type: 'payment_overdue',
        tone: 'danger',
        title: `Pagamento de ${payment.clientName} esta atrasado`,
        description: `Projeto vinculado: ${payment.projectName}.`,
        occurredAt: payment.dueDate,
        path: '/pagamentos',
      })
      continue
    }

    if (remainingDays === 0) {
      notifications.push({
        id: buildHeaderNotificationId(
          'payment_due_today',
          payment.id,
          payment.dueDate,
        ),
        type: 'payment_due_today',
        tone: 'warning',
        title: `Pagamento de ${payment.clientName} vence hoje`,
        description: `Projeto vinculado: ${payment.projectName}.`,
        occurredAt: payment.dueDate,
        path: '/pagamentos',
      })
    }
  }

  return notifications
}

function getProjectDeadlineNotifications(
  projects: ProjectWithClient[],
  now = new Date(),
): HeaderNotification[] {
  const notifications: HeaderNotification[] = []

  for (const project of projects) {
    if (!isActiveProject(project)) {
      continue
    }

    const remainingDays = getCalendarDayDifference(project.deadline, now)

    if (remainingDays === 0) {
      notifications.push({
        id: buildHeaderNotificationId(
          'project_due_today',
          project.id,
          project.deadline,
        ),
        type: 'project_due_today',
        tone: 'warning',
        title: `Projeto ${project.name} vence hoje`,
        description: `Cliente: ${project.clientName}.`,
        occurredAt: project.deadline,
        path: '/projetos',
      })
      continue
    }

    if (remainingDays !== null && remainingDays > 0 && remainingDays <= 3) {
      notifications.push({
        id: buildHeaderNotificationId(
          'project_due_soon',
          project.id,
          project.deadline,
        ),
        type: 'project_due_soon',
        tone: 'warning',
        title: `Projeto ${project.name} vence em ${formatRemainingDaysLabel(
          remainingDays,
        )}`,
        description: `Cliente: ${project.clientName}.`,
        occurredAt: project.deadline,
        path: '/projetos',
      })
    }
  }

  return notifications
}

export function getHeaderNotifications(
  collections: HeaderNotificationCollections,
  now = new Date(),
) {
  const notifications: HeaderNotification[] = [
    ...getProjectDeadlineNotifications(collections.projects, now),
    ...getPaymentDueTodayNotifications(collections.payments, now),
    ...getProposalAcceptedNotifications(collections.proposals),
  ]

  return notifications.sort((firstNotification, secondNotification) => {
    const priorityDifference =
      notificationPriority[firstNotification.type] -
      notificationPriority[secondNotification.type]

    if (priorityDifference !== 0) {
      return priorityDifference
    }

    return (
      getComparableTimestamp(secondNotification.occurredAt) -
      getComparableTimestamp(firstNotification.occurredAt)
    )
  })
}
