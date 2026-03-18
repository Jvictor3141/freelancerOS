const CURRENCY_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR')

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

function toValidDate(value: string | Date | null | undefined) {
  if (!value) {
    return null
  }

  const date = value instanceof Date ? value : new Date(value)

  return Number.isNaN(date.getTime()) ? null : date
}

export function formatCurrency(value: number) {
  return CURRENCY_FORMATTER.format(value)
}

export function formatDate(value: string | Date | null | undefined) {
  const date = toValidDate(value)
  return date ? DATE_FORMATTER.format(date) : '-'
}

export function formatDateTime(value: string | Date | null | undefined) {
  const date = toValidDate(value)
  return date ? DATE_TIME_FORMATTER.format(date) : '-'
}
