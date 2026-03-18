import type { Client } from '../types/client'
import type { Payment } from '../types/payment'
import type { Project } from '../types/project'
import type { PaymentWithProjectAndClient } from '../types/viewModels'
import type { PaymentStatusFilter } from './paymentStatus'

export function getPaymentActionButtonClassName(
  tone: 'success' | 'neutral' | 'danger',
) {
  if (tone === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
  }

  if (tone === 'danger') {
    return 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
  }

  return 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
}

export function getPaymentsWithRelations(
  payments: Payment[],
  projects: Project[],
  clients: Client[],
): PaymentWithProjectAndClient[] {
  const projectMap = new Map(projects.map((project) => [project.id, project]))
  const clientMap = new Map(clients.map((client) => [client.id, client]))

  return payments.map((payment) => {
    const project = projectMap.get(payment.projectId)
    const client = project ? clientMap.get(project.clientId) : null

    return {
      ...payment,
      projectName: project?.name ?? 'Projeto não encontrado',
      clientName: client?.name ?? 'Cliente não encontrado',
    }
  })
}

export function getFilteredPayments(
  payments: PaymentWithProjectAndClient[],
  statusFilter: PaymentStatusFilter,
) {
  if (statusFilter === 'all') {
    return payments
  }

  return payments.filter((payment) => payment.status === statusFilter)
}
