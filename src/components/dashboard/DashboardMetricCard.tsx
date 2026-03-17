import type { LucideIcon } from 'lucide-react'

type DashboardMetricCardProps = {
  icon: LucideIcon
  iconClassName: string
  label: string
  value: number | string
  description: string
}

export function DashboardMetricCard({
  icon: Icon,
  iconClassName,
  label,
  value,
  description,
}: DashboardMetricCardProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
      <div className={`mb-4 inline-flex rounded-2xl p-3 ${iconClassName}`}>
        <Icon size={18} />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  )
}
