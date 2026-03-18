import type { Project } from './project'

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
