import type { Client } from '../types/client'
import type {
  DashboardMetricSummary,
  DashboardPaymentAlert,
  DashboardPaymentMetrics,
  DashboardRecentActivity,
  DashboardRevenuePoint,
  DashboardViewModel,
} from '../types/dashboard'
import type { Payment } from '../types/payment'
import type { Project } from '../types/project'
import { getAverageTicket, getPaymentAmountSummary, sumProjectValues } from './financial'
import {
  getPaymentsRequiringAttention,
  sortPaymentsByDueDate,
} from './paymentRules'
import {
  countActiveProjects,
  countCompletedProjects,
  getOperationalProjects,
  sortProjectsByCreatedAtDesc,
} from './projectRules'

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
  const operationalProjects = getOperationalProjects(projects)
  const totalContractedValue = sumProjectValues(operationalProjects)

  return {
    totalClients: clients.length,
    projectsInProgress: countActiveProjects(operationalProjects),
    completedProjects: countCompletedProjects(operationalProjects),
    averageTicket: getAverageTicket(
      totalContractedValue,
      operationalProjects.length,
    ),
  }
}

export function getPaymentMetrics(payments: Payment[]): DashboardPaymentMetrics {
  const { receivedAmount, pendingAmount, overdueAmount } =
    getPaymentAmountSummary(payments)

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

  return sortProjectsByCreatedAtDesc(getOperationalProjects(projects))
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

  return sortPaymentsByDueDate(getPaymentsRequiringAttention(payments))
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
