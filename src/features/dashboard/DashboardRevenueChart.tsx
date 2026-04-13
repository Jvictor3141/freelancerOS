import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useTranslation } from 'react-i18next'
import type { DashboardRevenuePoint } from '../../types/dashboard'
import { SUPPORTED_CURRENCIES, type CurrencyCode } from '../../i18n/config'
import { formatCurrencyCode } from '../../utils/formatting'
import { parseCalendarDate } from '../../utils/dateOnly'

// One colour per supported currency — consistent, distinguishable on white.
const CURRENCY_COLORS: Record<CurrencyCode, string> = {
  BRL: '#635bff',
  USD: '#22c55e',
  EUR: '#f59e0b',
}

type ChartRow = { month: string } & Partial<Record<CurrencyCode, number>>

const MONTH_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: '2-digit',
})

function formatMonthLabel(isoDate: string): string {
  const date = parseCalendarDate(isoDate)
  return date ? MONTH_FORMATTER.format(date) : isoDate
}

/**
 * Generates the last 6 month start dates as 'YYYY-MM-DD' strings so the
 * chart always shows a full 6-month window even when some months have no data.
 */
function getLast6MonthKeys(): string[] {
  const months: string[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    months.push(`${yyyy}-${mm}-01`)
  }

  return months
}

/**
 * Pivots sparse (month, currency, revenue) tuples into Recharts-friendly rows:
 * [{ month: 'jan/26', BRL: 3200, USD: 850 }, ...]
 */
function buildChartData(points: DashboardRevenuePoint[]): {
  rows: ChartRow[]
  activeCurrencies: CurrencyCode[]
} {
  const activeCurrencies = [
    ...new Set(points.map((p) => p.currency)),
  ].filter((c): c is CurrencyCode =>
    (SUPPORTED_CURRENCIES as readonly string[]).includes(c),
  )

  if (activeCurrencies.length === 0) {
    const rows = getLast6MonthKeys().map((key) => ({ month: formatMonthLabel(key) }))
    return { rows, activeCurrencies }
  }

  // Build a lookup: 'YYYY-MM-01' → currency → revenue
  const lookup = new Map<string, Partial<Record<CurrencyCode, number>>>()
  for (const point of points) {
    const key = point.month.slice(0, 7) + '-01'
    if (!lookup.has(key)) lookup.set(key, {})
    lookup.get(key)![point.currency] = point.revenue
  }

  const rows = getLast6MonthKeys().map((key) => {
    const data = lookup.get(key) ?? {}
    const row: ChartRow = { month: formatMonthLabel(key) }
    for (const currency of activeCurrencies) {
      row[currency] = data[currency] ?? 0
    }
    return row
  })

  return { rows, activeCurrencies }
}

type DashboardRevenueChartProps = {
  data: DashboardRevenuePoint[]
}

export function DashboardRevenueChart({ data }: DashboardRevenueChartProps) {
  const { t } = useTranslation()
  const { rows, activeCurrencies } = buildChartData(data)

  const isEmpty = activeCurrencies.length === 0

  return (
    <div className="h-64 sm:h-80">
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 640, height: 256 }}
      >
        <AreaChart
          data={rows}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <defs>
            {activeCurrencies.map((currency) => (
              <linearGradient
                key={currency}
                id={`gradient-${currency}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={CURRENCY_COLORS[currency]}
                  stopOpacity={0.25}
                />
                <stop
                  offset="95%"
                  stopColor={CURRENCY_COLORS[currency]}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid
            stroke="#e2e8f0"
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            tickFormatter={(value: number) =>
              value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value)
            }
          />

          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null

              return (
                <div
                  className="rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-lg"
                  style={{ boxShadow: '0 15px 35px rgba(15, 23, 42, 0.08)' }}
                >
                  <p className="mb-2 font-semibold text-slate-700">{label}</p>
                  {payload.map((entry) => {
                    const currency = entry.dataKey as CurrencyCode
                    return (
                      <div
                        key={currency}
                        className="flex items-center gap-2 text-slate-600"
                      >
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: CURRENCY_COLORS[currency] }}
                        />
                        <span>{currency}:</span>
                        <span className="font-semibold text-slate-900">
                          {formatCurrencyCode(Number(entry.value), currency)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            }}
          />

          {activeCurrencies.map((currency) => (
            <Area
              key={currency}
              type="monotone"
              dataKey={currency}
              name={currency}
              stroke={CURRENCY_COLORS[currency]}
              strokeWidth={2.5}
              fill={`url(#gradient-${currency})`}
            />
          ))}

          {isEmpty && (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize={13}
            >
              {t('dashboard.revenue_empty')}
            </text>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
