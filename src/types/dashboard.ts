import type { CurrencyCode } from '../i18n/config'
import type { Project } from './project'

export type DashboardMetricSummary = {
  totalClients: number
  projectsInProgress: number
  completedProjects: number
  proposalAcceptanceRate: number
}

/**
 * Financial totals for a single currency. The dashboard returns one entry
 * per currency that has any payment data — never a cross-currency sum.
 */
export type DashboardCurrencyBreakdown = {
  currency: CurrencyCode
  receivedAmount: number
  pendingAmount: number
  overdueAmount: number
}

/**
 * Sparse revenue data point. The SQL returns only (month, currency) pairs
 * that have actual paid payments; the frontend fills zero-gaps for display.
 */
export type DashboardRevenuePoint = {
  month: string
  currency: CurrencyCode
  revenue: number
}

export type DashboardPaymentAlert = {
  id: string
  clientName: string
  projectName: string
  amount: number
  currency: CurrencyCode
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
  currency: CurrencyCode
}

export type DashboardViewModel = {
  metrics: DashboardMetricSummary
  paymentMetrics: DashboardCurrencyBreakdown[]
  revenue: DashboardRevenuePoint[]
  recentActivities: DashboardRecentActivity[]
  paymentAlerts: DashboardPaymentAlert[]
  upcomingPayments: DashboardPaymentAlert[]
}
