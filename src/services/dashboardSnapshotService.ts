import { getSupabaseErrorMessage, supabase } from '../lib/supabase'
import type { DashboardViewModel, DashboardRevenuePoint } from '../types/dashboard'
import { isSupportedCurrency } from '../i18n/config'
import { parseCalendarDate } from '../utils/dateOnly'
import { isPaymentAttentionStatus } from '../features/payments/paymentRules'
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
const DASHBOARD_SNAPSHOT_MIGRATION =
  '20260413_supported_currencies_and_read_models.sql'

export const emptyDashboardViewModel: DashboardViewModel = {
  metrics: {
    totalClients: 0,
    projectsInProgress: 0,
    completedProjects: 0,
    averageTicket: 0,
  },
  paymentMetrics: [],
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
    return `A leitura do dashboard no Supabase ainda não foi atualizada. Rode a migration ${DASHBOARD_SNAPSHOT_MIGRATION}.`
  }

  return getSupabaseErrorMessage(error, fallback)
}

function parseMetrics(record: UnknownRecord | null) {
  return {
    totalClients: getNumberValue(record ?? {}, 'totalClients'),
    projectsInProgress: getNumberValue(record ?? {}, 'projectsInProgress'),
    completedProjects: getNumberValue(record ?? {}, 'completedProjects'),
    averageTicket: getNumberValue(record ?? {}, 'averageTicket'),
  }
}

function parsePaymentMetrics(snapshot: UnknownRecord) {
  return getArrayRecords(snapshot.paymentMetrics)
    .map((record) => {
      const currency = getStringValue(record, 'currency')
      if (!isSupportedCurrency(currency)) return null

      return {
        currency,
        receivedAmount: getNumberValue(record, 'receivedAmount'),
        pendingAmount: getNumberValue(record, 'pendingAmount'),
        overdueAmount: getNumberValue(record, 'overdueAmount'),
      }
    })
    .filter((entry) => entry !== null)
}

function parseRevenue(snapshot: UnknownRecord): DashboardRevenuePoint[] {
  return getArrayRecords(snapshot.revenue)
    .map((record) => {
      const currency = getStringValue(record, 'currency')
      if (!isSupportedCurrency(currency)) return null

      const rawMonth = getStringValue(record, 'month')
      const date = parseCalendarDate(rawMonth)
      if (!date) return null

      return {
        month: rawMonth,
        currency,
        revenue: getNumberValue(record, 'revenue'),
      }
    })
    .filter((entry) => entry !== null)
}

function parseRecentActivities(snapshot: UnknownRecord) {
  return getArrayRecords(snapshot.recentActivities).map((record) => {
    const status = getStringValue(record, 'status')
    const currency = getStringValue(record, 'currency')

    return {
      id: getStringValue(record, 'id'),
      title: getStringValue(record, 'title'),
      clientName: getStringValue(record, 'clientName', 'Cliente desconhecido'),
      status: normalizeProjectStatus(status),
      createdAt: getStringValue(record, 'createdAt'),
      value: getNumberValue(record, 'value'),
      currency: isSupportedCurrency(currency) ? currency : ('BRL' as const),
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

      const currency = getStringValue(record, 'currency')

      return {
        id: getStringValue(record, 'id'),
        clientName: getStringValue(record, 'clientName', 'Cliente desconhecido'),
        projectName: getStringValue(record, 'projectName', 'Projeto desconhecido'),
        amount: getNumberValue(record, 'amount'),
        currency: isSupportedCurrency(currency) ? currency : ('BRL' as const),
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
    paymentMetrics: parsePaymentMetrics(snapshot),
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
        'Não foi possível carregar os dados do dashboard.',
      ),
    )
  }

  return parseDashboardSnapshot(data)
}
