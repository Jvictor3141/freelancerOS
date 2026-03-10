import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { revenue } from '../data/mockData';

export function RevenueChart() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Receita dos últimos 6 meses</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">Fluxo financeiro previsível</h3>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">+12% vs mês anterior</span>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#635bff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#635bff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              tickFormatter={(value) => `R$ ${value / 1000}k`}
            />
            <Tooltip
              formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, 'Receita']}
              contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 15px 35px rgba(15, 23, 42, 0.08)' }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#635bff" strokeWidth={3} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
