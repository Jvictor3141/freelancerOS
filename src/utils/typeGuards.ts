export type UnknownRecord = Record<string, unknown>

export function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function getRecord(value: unknown): UnknownRecord | null {
  return isRecord(value) ? value : null
}

export function isOneOf<TValue extends string>(
  options: readonly TValue[],
  value: string,
): value is TValue {
  return (options as readonly string[]).includes(value)
}
