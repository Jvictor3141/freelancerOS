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
      <div className='flex items-center'>
        <div className="mr-2 inline-flex rounded-2xl bg-white/12 p-2">
          <Icon size={15} />
        </div>
        <p className="text-1xl text-indigo-100">{label} :</p>
      </div>
      <p className="flex items-end justify-end mt-2 text-2xl font-semibold">{value}</p>
    </div>
  )
}
