import { getSupabaseErrorMessage, supabase } from '../lib/supabase'
import type { DashboardViewModel } from '../types/dashboard'
import { parseCalendarDate } from '../utils/dateOnly'
import { isPaymentAttentionStatus } from '../utils/paymentRules'
import { isPaymentStatus } from '../utils/paymentStatus'
import { normalizeProjectStatus } from '../utils/projectStatus'
import { getRecord, type UnknownRecord } from '../utils/typeGuards'
import { ensureDatabaseBootstrap } from './bootstrapService'
import {
  getArrayRecords,
  getNumberValue,
  getRecordValue,
  getStringValue,
} from './readModelUtils'

const DASHBOARD_SNAPSHOT_FUNCTION = 'get_dashboard_snapshot'
const DASHBOARD_SNAPSHOT_MIGRATION = '20260329_dashboard_client_snapshots.sql'
const MONTH_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: '2-digit',
})

export const emptyDashboardViewModel: DashboardViewModel = {
  metrics: {
    totalClients: 0,
    projectsInProgress: 0,
    completedProjects: 0,
    averageTicket: 0,
  },
  paymentMetrics: {
    receivedAmount: 0,
    pendingAmount: 0,
    overdueAmount: 0,
  },
  revenue: [],
  recentActivities: [],
  paymentAlerts: [],
}

function isMissingDashboardSnapshotFunction(error: { message?: string } | null) {
  if (!error?.message) {
    return false
  }

  return (
    error.message.includes(DASHBOARD_SNAPSHOT_FUNCTION) &&
    (error.message.includes('does not exist') ||
      error.message.includes('schema cache'))
  )
}

function getDashboardSnapshotError(
  error: { message?: string } | null,
  fallback: string,
) {
  if (isMissingDashboardSnapshotFunction(error)) {
    return `A leitura do dashboard no Supabase ainda nao foi atualizada. Rode a migration ${DASHBOARD_SNAPSHOT_MIGRATION}.`
  }

  return getSupabaseErrorMessage(error, fallback)
}

function formatRevenueMonth(value: string) {
  const date = parseCalendarDate(value)

  return date ? MONTH_FORMATTER.format(date) : value
}

function parseMetrics(record: UnknownRecord | null) {
  return {
    totalClients: getNumberValue(record ?? {}, 'totalClients'),
    projectsInProgress: getNumberValue(record ?? {}, 'projectsInProgress'),
    completedProjects: getNumberValue(record ?? {}, 'completedProjects'),
    averageTicket: getNumberValue(record ?? {}, 'averageTicket'),
  }
}

function parsePaymentMetrics(record: UnknownRecord | null) {
  return {
    receivedAmount: getNumberValue(record ?? {}, 'receivedAmount'),
    pendingAmount: getNumberValue(record ?? {}, 'pendingAmount'),
    overdueAmount: getNumberValue(record ?? {}, 'overdueAmount'),
  }
}

function parseRevenue(snapshot: UnknownRecord) {
  return getArrayRecords(snapshot.revenue).map((record) => ({
    month: formatRevenueMonth(getStringValue(record, 'month')),
    revenue: getNumberValue(record, 'revenue'),
  }))
}

function parseRecentActivities(snapshot: UnknownRecord) {
  return getArrayRecords(snapshot.recentActivities).map((record) => {
    const status = getStringValue(record, 'status')

    return {
      id: getStringValue(record, 'id'),
      title: getStringValue(record, 'title'),
      clientName: getStringValue(
        record,
        'clientName',
        'Cliente desconhecido',
      ),
      status: normalizeProjectStatus(status),
      createdAt: getStringValue(record, 'createdAt'),
      value: getNumberValue(record, 'value'),
    }
  })
}

function parsePaymentAlerts(snapshot: UnknownRecord) {
  return getArrayRecords(snapshot.paymentAlerts)
    .map((record) => {
      const status = getStringValue(record, 'status')

      if (!isPaymentStatus(status) || !isPaymentAttentionStatus(status)) {
        return null
      }

      return {
        id: getStringValue(record, 'id'),
        clientName: getStringValue(
          record,
          'clientName',
          'Cliente desconhecido',
        ),
        projectName: getStringValue(
          record,
          'projectName',
          'Projeto desconhecido',
        ),
        amount: getNumberValue(record, 'amount'),
        dueDate: getStringValue(record, 'dueDate'),
        status,
      }
    })
    .filter((alert) => alert !== null)
}

function parseDashboardSnapshot(value: unknown): DashboardViewModel {
  const snapshot = getRecord(value)

  if (!snapshot) {
    return emptyDashboardViewModel
  }

  return {
    metrics: parseMetrics(getRecordValue(snapshot, 'metrics')),
    paymentMetrics: parsePaymentMetrics(
      getRecordValue(snapshot, 'paymentMetrics'),
    ),
    revenue: parseRevenue(snapshot),
    recentActivities: parseRecentActivities(snapshot),
    paymentAlerts: parsePaymentAlerts(snapshot),
  }
}

export async function getDashboardSnapshot(): Promise<DashboardViewModel> {
  await ensureDatabaseBootstrap()

  const { data, error } = await supabase.rpc(DASHBOARD_SNAPSHOT_FUNCTION)

  if (error) {
    throw new Error(
      getDashboardSnapshotError(
        error,
        'Nao foi possivel carregar os dados do dashboard.',
      ),
    )
  }

  return parseDashboardSnapshot(data)
}
