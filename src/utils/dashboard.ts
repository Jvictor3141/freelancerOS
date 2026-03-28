import { formatDate } from './formatting'

const CURRENCY_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatDashboardCurrency(value: number) {
  return CURRENCY_FORMATTER.format(value)
}

export function formatDashboardDate(value: string) {
  return formatDate(value)
}
