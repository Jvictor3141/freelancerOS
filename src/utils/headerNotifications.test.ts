import { describe, expect, it } from 'vitest'
import type {
  PaymentWithProjectAndClient,
  ProjectWithClient,
  ProposalWithClient,
} from '../types/viewModels'
import {
  getHeaderNotifications,
  getVisibleHeaderNotifications,
} from './headerNotifications'

function createProposal(
  overrides: Partial<ProposalWithClient> = {},
): ProposalWithClient {
  return {
    id: 'proposal-1',
    clientId: 'client-1',
    projectId: 'project-1',
    title: 'Site institucional',
    description: 'Escopo comercial',
    amount: 2500,
    deliveryDays: 10,
    recipientEmail: 'contato@acme.com',
    status: 'accepted',
    sentAt: '2026-03-20T10:00:00.000Z',
    acceptedAt: '2026-03-25T08:30:00.000Z',
    rejectedAt: null,
    clientRespondedAt: '2026-03-25T08:25:00.000Z',
    clientResponseChannel: 'shared_link',
    notes: '',
    createdAt: '2026-03-18T10:00:00.000Z',
    clientName: 'Acme',
    clientCompany: 'Acme Co',
    ...overrides,
  }
}

function createProject(
  overrides: Partial<ProjectWithClient> = {},
): ProjectWithClient {
  return {
    id: 'project-1',
    clientId: 'client-1',
    name: 'App mobile',
    description: 'Entrega principal',
    value: 5000,
    deadline: '2026-03-25',
    status: 'in_progress',
    createdAt: '2026-03-10T10:00:00.000Z',
    clientName: 'Beta',
    clientCompany: 'Beta Co',
    ...overrides,
  }
}

function createPayment(
  overrides: Partial<PaymentWithProjectAndClient> = {},
): PaymentWithProjectAndClient {
  return {
    id: 'payment-1',
    projectId: 'project-1',
    amount: 1200,
    dueDate: '2026-03-25',
    paidAt: null,
    status: 'pending',
    method: 'pix',
    notes: '',
    createdAt: '2026-03-12T10:00:00.000Z',
    projectName: 'Retainer',
    clientName: 'Delta',
    ...overrides,
  }
}

describe('header notifications', () => {
  it('builds and sorts proposal, payment and project notifications', () => {
    const notifications = getHeaderNotifications(
      {
        proposals: [createProposal()],
        projects: [
          createProject({
            id: 'project-due-today',
            name: 'App mobile',
            clientName: 'Beta',
            deadline: '2026-03-25',
            status: 'in_progress',
          }),
          createProject({
            id: 'project-due-soon',
            name: 'Landing page',
            clientName: 'Gamma',
            deadline: '2026-03-28',
            status: 'review',
          }),
        ],
        payments: [createPayment()],
      },
      new Date(2026, 2, 25, 12, 0, 0),
    )

    expect(notifications.map((notification) => notification.type)).toEqual([
      'project_due_today',
      'payment_due_today',
      'project_due_soon',
      'proposal_accepted',
    ])

    expect(notifications.map((notification) => notification.title)).toEqual([
      'Projeto App mobile vence hoje',
      'Pagamento de Delta vence hoje',
      'Projeto Landing page vence em 3 dias',
      'Acme aceitou a proposta',
    ])

    expect(notifications.at(-1)?.path).toBe('/projetos')
  })

  it('creates overdue payment notifications for late unpaid items', () => {
    const notifications = getHeaderNotifications(
      {
        proposals: [],
        projects: [],
        payments: [
          createPayment({
            id: 'payment-overdue-status',
            clientName: 'Atlas',
            dueDate: '2026-03-24',
            status: 'overdue',
          }),
          createPayment({
            id: 'payment-overdue-pending',
            clientName: 'Nova',
            dueDate: '2026-03-23',
            status: 'pending',
          }),
        ],
      },
      new Date(2026, 2, 25, 12, 0, 0),
    )

    expect(notifications.map((notification) => notification.type)).toEqual([
      'payment_overdue',
      'payment_overdue',
    ])

    expect(notifications.map((notification) => notification.title)).toEqual([
      'Pagamento de Atlas esta atrasado',
      'Pagamento de Nova esta atrasado',
    ])
  })

  it('ignores items outside the notification rules', () => {
    const notifications = getHeaderNotifications(
      {
        proposals: [
          createProposal({
            id: 'proposal-without-timestamp',
            acceptedAt: null,
            clientRespondedAt: null,
          }),
          createProposal({
            id: 'proposal-rejected',
            status: 'rejected',
          }),
        ],
        projects: [
          createProject({
            id: 'project-two-days',
            deadline: '2026-03-27',
          }),
          createProject({
            id: 'project-completed',
            deadline: '2026-03-25',
            status: 'completed',
          }),
        ],
        payments: [
          createPayment({
            id: 'payment-tomorrow',
            dueDate: '2026-03-26',
          }),
          createPayment({
            id: 'payment-paid',
            status: 'paid',
          }),
        ],
      },
      new Date(2026, 2, 25, 12, 0, 0),
    )

    expect(notifications).toEqual([])
  })

  it('filters out dismissed notifications by id', () => {
    const notifications = getHeaderNotifications(
      {
        proposals: [createProposal()],
        projects: [],
        payments: [createPayment()],
      },
      new Date(2026, 2, 25, 12, 0, 0),
    )

    const firstNotification = notifications[0]

    expect(firstNotification).toBeDefined()

    if (!firstNotification) {
      throw new Error('Expected at least one notification for the dismissal test.')
    }

    expect(
      getVisibleHeaderNotifications(notifications, [firstNotification.id]).map(
        (notification) => notification.type,
      ),
    ).toEqual(['proposal_accepted'])
  })

  it('treats project and payment deadlines as calendar days even when the API returns UTC timestamps', () => {
    const notifications = getHeaderNotifications(
      {
        proposals: [],
        projects: [
          createProject({
            id: 'project-utc',
            name: 'Portal do cliente',
            clientName: 'Omega',
            deadline: '2026-03-28T00:00:00.000Z',
            status: 'in_progress',
          }),
        ],
        payments: [
          createPayment({
            id: 'payment-utc',
            clientName: 'Sigma',
            dueDate: '2026-03-25T00:00:00.000Z',
          }),
        ],
      },
      new Date(2026, 2, 25, 12, 0, 0),
    )

    expect(notifications.map((notification) => notification.type)).toEqual([
      'payment_due_today',
      'project_due_soon',
    ])

    expect(notifications.map((notification) => notification.title)).toEqual([
      'Pagamento de Sigma vence hoje',
      'Projeto Portal do cliente vence em 3 dias',
    ])
  })
})
