export function buildScopedStorageKey(prefix: string, scope: string | null) {
  return `${prefix}:${scope ?? 'anonymous'}`
}

export function readStoredStringList(storageKey: string) {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey)

    if (!rawValue) {
      return []
    }

    const parsedValue = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(
      (value): value is string => typeof value === 'string',
    )
  } catch {
    return []
  }
}

export function writeStoredStringList(
  storageKey: string,
  values: string[],
) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(storageKey, JSON.stringify(values))
}

export function excludeItemsById<TItem>(
  items: TItem[],
  excludedIds: string[],
  getId: (item: TItem) => string,
) {
  const excludedIdSet = new Set(excludedIds)

  return items.filter((item) => !excludedIdSet.has(getId(item)))
}
