import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { DashboardRevenuePoint } from '../../types/dashboard'
import { formatDashboardCurrency } from '../../utils/dashboard'

type DashboardRevenueChartProps = {
  data: DashboardRevenuePoint[]
}

export function DashboardRevenueChart({ data }: DashboardRevenueChartProps) {
  return (
    <div className="h-64 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#635bff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#635bff" stopOpacity={0} />
            </linearGradient>
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
            tickFormatter={(value) => `R$ ${Number(value) / 1000}k`}
          />

          <Tooltip
            formatter={(value) => [
              formatDashboardCurrency(Number(value)),
              'Recebido',
            ]}
            contentStyle={{
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              boxShadow: '0 15px 35px rgba(15, 23, 42, 0.08)',
            }}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#635bff"
            strokeWidth={3}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
