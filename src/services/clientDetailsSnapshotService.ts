import { getSupabaseErrorMessage, supabase } from '../lib/supabase'
import type { ClientDetailsSnapshot } from '../types/clientDetails'
import { isPaymentMethod, isPaymentStatus } from '../utils/paymentStatus'
import { normalizeProjectStatus } from '../utils/projectStatus'
import { getRecord, type UnknownRecord } from '../utils/typeGuards'
import { ensureDatabaseBootstrap } from './bootstrapService'
import {
  getArrayRecords,
  getNumberValue,
  getNullableStringValue,
  getRecordValue,
  getStringValue,
} from './readModelUtils'

const CLIENT_DETAILS_SNAPSHOT_FUNCTION = 'get_client_details_snapshot'
const CLIENT_DETAILS_SNAPSHOT_MIGRATION =
  '20260329_dashboard_client_snapshots.sql'

function isMissingClientDetailsSnapshotFunction(
  error: { message?: string } | null,
) {
  if (!error?.message) {
    return false
  }

  return (
    error.message.includes(CLIENT_DETAILS_SNAPSHOT_FUNCTION) &&
    (error.message.includes('does not exist') ||
      error.message.includes('schema cache'))
  )
}

function getClientDetailsSnapshotError(
  error: { message?: string } | null,
  fallback: string,
) {
  if (isMissingClientDetailsSnapshotFunction(error)) {
    return `A leitura detalhada de clientes no Supabase ainda nao foi atualizada. Rode a migration ${CLIENT_DETAILS_SNAPSHOT_MIGRATION}.`
  }

  return getSupabaseErrorMessage(error, fallback)
}

function parseClient(record: UnknownRecord | null) {
  if (!record) {
    return null
  }

  return {
    id: getStringValue(record, 'id'),
    name: getStringValue(record, 'name'),
    company: getStringValue(record, 'company'),
    email: getStringValue(record, 'email'),
    phone: getStringValue(record, 'phone'),
    notes: getStringValue(record, 'notes'),
    createdAt: getStringValue(record, 'createdAt'),
  }
}

function parseSummary(record: UnknownRecord | null) {
  return {
    totalContracted: getNumberValue(record ?? {}, 'totalContracted'),
    totalReceived: getNumberValue(record ?? {}, 'totalReceived'),
    totalPending: getNumberValue(record ?? {}, 'totalPending'),
    totalOverdue: getNumberValue(record ?? {}, 'totalOverdue'),
    totalOutstanding: getNumberValue(record ?? {}, 'totalOutstanding'),
    completedProjects: getNumberValue(record ?? {}, 'completedProjects'),
  }
}

function parseProjects(snapshot: UnknownRecord) {
  return getArrayRecords(snapshot.projects).map((record) => {
    const status = getStringValue(record, 'status')

    return {
      id: getStringValue(record, 'id'),
      clientId: getStringValue(record, 'clientId'),
      name: getStringValue(record, 'name'),
      description: getStringValue(record, 'description'),
      value: getNumberValue(record, 'value'),
      deadline: getStringValue(record, 'deadline'),
      status: normalizeProjectStatus(status),
      createdAt: getStringValue(record, 'createdAt'),
    }
  })
}

function parsePayments(snapshot: UnknownRecord) {
  return getArrayRecords(snapshot.payments).map((record) => {
    const status = getStringValue(record, 'status')
    const method = getStringValue(record, 'method')

    return {
      id: getStringValue(record, 'id'),
      projectId: getStringValue(record, 'projectId'),
      amount: getNumberValue(record, 'amount'),
      dueDate: getStringValue(record, 'dueDate'),
      paidAt: getNullableStringValue(record, 'paidAt'),
      status: isPaymentStatus(status) ? status : 'pending',
      method: isPaymentMethod(method) ? method : 'pix',
      notes: getStringValue(record, 'notes'),
      createdAt: getStringValue(record, 'createdAt'),
    }
  })
}

function parseClientDetailsSnapshot(value: unknown): ClientDetailsSnapshot | null {
  const snapshot = getRecord(value)

  if (!snapshot) {
    return null
  }

  const client = parseClient(getRecordValue(snapshot, 'client'))

  if (!client) {
    return null
  }

  return {
    client,
    summary: parseSummary(getRecordValue(snapshot, 'summary')),
    projects: parseProjects(snapshot),
    payments: parsePayments(snapshot),
  }
}

export async function getClientDetailsSnapshot(
  clientId: string,
): Promise<ClientDetailsSnapshot | null> {
  await ensureDatabaseBootstrap()

  const { data, error } = await supabase.rpc(CLIENT_DETAILS_SNAPSHOT_FUNCTION, {
    p_client_id: clientId,
  })

  if (error) {
    throw new Error(
      getClientDetailsSnapshotError(
        error,
        'Nao foi possivel carregar o detalhamento do cliente.',
      ),
    )
  }

  return parseClientDetailsSnapshot(data)
}
