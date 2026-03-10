import type { Metric } from '../data/mockData';

export function MetricCard({ label, value, change, positive }: Metric) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            positive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {change}
        </span>
      </div>
    </article>
  );
}
