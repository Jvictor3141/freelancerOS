import type { Client } from '../types/client'
import type { Payment } from '../types/payment'
import type { Project } from '../types/project'

export type DashboardMetricSummary = {
  totalClients: number
  projectsInProgress: number
  completedProjects: number
  averageTicket: number
}

export type DashboardPaymentMetrics = {
  receivedAmount: number
  pendingAmount: number
  overdueAmount: number
}

export type DashboardRevenuePoint = {
  month: string
  revenue: number
}

export type DashboardPaymentAlert = {
  id: string
  clientName: string
  projectName: string
  amount: number
  dueDate: string
  status: 'pending' | 'overdue'
}

export type DashboardRecentActivity = {
  id: string
  title: string
  clientName: string
  status: Project['status']
  createdAt: string
  value: number
}

export type DashboardViewModel = {
  metrics: DashboardMetricSummary
  paymentMetrics: DashboardPaymentMetrics
  revenue: DashboardRevenuePoint[]
  recentActivities: DashboardRecentActivity[]
  paymentAlerts: DashboardPaymentAlert[]
}

type DashboardViewModelInput = {
  clients: Client[]
  projects: Project[]
  payments: Payment[]
  revenueMonths?: number
  recentActivityLimit?: number
  paymentAlertLimit?: number
}

const MONTH_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: '2-digit',
})

const CURRENCY_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatDashboardCurrency(value: number) {
  return CURRENCY_FORMATTER.format(value)
}

export function formatDashboardDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR')
}

export function getDashboardMetrics(
  clients: Client[],
  projects: Project[],
): DashboardMetricSummary {
  const operationalProjects = projects.filter(
    (project) => project.status !== 'proposal',
  )
  const totalClients = clients.length

  const projectsInProgress = operationalProjects.filter(
    (project) => project.status === 'in_progress' || project.status === 'review',
  ).length

  const completedProjects = operationalProjects.filter(
    (project) => project.status === 'completed',
  ).length

  const totalContractedValue = operationalProjects.reduce(
    (sum, project) => sum + Number(project.value || 0),
    0,
  )

  const averageTicket =
    operationalProjects.length > 0
      ? totalContractedValue / operationalProjects.length
      : 0

  return {
    totalClients,
    projectsInProgress,
    completedProjects,
    averageTicket,
  }
}

export function getPaymentMetrics(payments: Payment[]): DashboardPaymentMetrics {
  const receivedAmount = payments
    .filter((payment) => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0)

  const pendingAmount = payments
    .filter((payment) => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0)

  const overdueAmount = payments
    .filter((payment) => payment.status === 'overdue')
    .reduce((sum, payment) => sum + payment.amount, 0)

  return {
    receivedAmount,
    pendingAmount,
    overdueAmount,
  }
}

export function getMonthlyReceivedRevenue(
  payments: Payment[],
  monthsBack = 6,
): DashboardRevenuePoint[] {
  const now = new Date()

  const buckets = Array.from({ length: monthsBack }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (monthsBack - 1 - index),
      1,
    )

    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      month: MONTH_FORMATTER.format(date),
      revenue: 0,
    }
  })

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]))

  for (const payment of payments) {
    if (payment.status !== 'paid' || !payment.paidAt) continue

    const paidAt = new Date(payment.paidAt)

    if (Number.isNaN(paidAt.getTime())) continue

    const key = `${paidAt.getFullYear()}-${paidAt.getMonth()}`
    const bucket = bucketMap.get(key)

    if (!bucket) continue

    bucket.revenue += Number(payment.amount || 0)
  }

  return buckets.map(({ month, revenue }) => ({
    month,
    revenue,
  }))
}

export function getRecentProjectActivities(
  projects: Project[],
  clients: Client[],
  limit = 4,
): DashboardRecentActivity[] {
  const clientMap = new Map(clients.map((client) => [client.id, client]))

  return projects
    .filter((project) => project.status !== 'proposal')
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, limit)
    .map((project) => ({
      id: project.id,
      title: project.name,
      clientName: clientMap.get(project.clientId)?.name ?? 'Cliente desconhecido',
      status: project.status,
      createdAt: project.createdAt,
      value: project.value,
    }))
}

export function getPaymentAlerts(
  payments: Payment[],
  projects: Project[],
  clients: Client[],
  limit = 4,
): DashboardPaymentAlert[] {
  const projectMap = new Map(projects.map((project) => [project.id, project]))
  const clientMap = new Map(clients.map((client) => [client.id, client]))

  return payments
    .filter(
      (
        payment,
      ): payment is Payment & { status: 'pending' | 'overdue' } =>
        payment.status === 'pending' || payment.status === 'overdue',
    )
    .sort((a, b) => {
      const aTime = new Date(a.dueDate).getTime()
      const bTime = new Date(b.dueDate).getTime()
      return aTime - bTime
    })
    .slice(0, limit)
    .map((payment) => {
      const project = projectMap.get(payment.projectId)
      const client = project ? clientMap.get(project.clientId) : null

      return {
        id: payment.id,
        clientName: client?.name ?? 'Cliente desconhecido',
        projectName: project?.name ?? 'Projeto desconhecido',
        amount: payment.amount,
        dueDate: payment.dueDate,
        status: payment.status,
      }
    })
}

export function getDashboardViewModel({
  clients,
  projects,
  payments,
  revenueMonths = 6,
  recentActivityLimit = 4,
  paymentAlertLimit = 4,
}: DashboardViewModelInput): DashboardViewModel {
  return {
    metrics: getDashboardMetrics(clients, projects),
    paymentMetrics: getPaymentMetrics(payments),
    revenue: getMonthlyReceivedRevenue(payments, revenueMonths),
    recentActivities: getRecentProjectActivities(
      projects,
      clients,
      recentActivityLimit,
    ),
    paymentAlerts: getPaymentAlerts(
      payments,
      projects,
      clients,
      paymentAlertLimit,
    ),
  }
}
