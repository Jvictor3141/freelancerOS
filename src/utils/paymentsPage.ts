import type { Client } from '../types/client'
import type { Payment } from '../types/payment'
import type { Project } from '../types/project'
import type { PaymentWithProjectAndClient } from '../types/viewModels'
import type { PaymentStatusFilter } from './paymentStatus'

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
