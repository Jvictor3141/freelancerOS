import { getRecord, isRecord, type UnknownRecord } from '../utils/typeGuards'

export function getArrayRecords(value: unknown): UnknownRecord[] {
  return Array.isArray(value) ? value.filter(isRecord) : []
}

export function getStringValue(
  record: UnknownRecord,
  key: string,
  fallback = '',
) {
  const value = record[key]

  return typeof value === 'string' ? value : fallback
}

export function getNullableStringValue(record: UnknownRecord, key: string) {
  const value = record[key]

  return typeof value === 'string' ? value : null
}

export function getNumberValue(
  record: UnknownRecord,
  key: string,
  fallback = 0,
) {
  const value = record[key]

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value)
    return Number.isFinite(parsedValue) ? parsedValue : fallback
  }

  return fallback
}

export function getRecordValue(record: UnknownRecord, key: string) {
  return getRecord(record[key])
}
