const ISO_DATE_PREFIX_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/

function padDatePart(value: number) {
  return String(value).padStart(2, '0')
}

export function formatDateInputValue(date = new Date()) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(
    date.getDate(),
  )}`
}

export function addDaysToDateInputValue(days: number, baseDate = new Date()) {
  const nextDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
  )

  nextDate.setDate(nextDate.getDate() + days)

  return formatDateInputValue(nextDate)
}

export function parseCalendarDate(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const dateMatch = value.match(ISO_DATE_PREFIX_PATTERN)

  if (dateMatch) {
    const [, year, month, day] = dateMatch
    const date = new Date(Number(year), Number(month) - 1, Number(day))

    return Number.isNaN(date.getTime()) ? null : date
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}
