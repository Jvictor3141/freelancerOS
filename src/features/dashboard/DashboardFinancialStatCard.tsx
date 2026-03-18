import type { LucideIcon } from 'lucide-react'

type DashboardFinancialStatCardProps = {
  icon: LucideIcon
  label: string
  value: string
}

export function DashboardFinancialStatCard({
  icon: Icon,
  label,
  value,
}: DashboardFinancialStatCardProps) {
  return (
    <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
      <div className="mb-3 inline-flex rounded-2xl bg-white/12 p-2">
        <Icon size={18} />
      </div>
      <p className="text-sm text-indigo-100">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  )
}
