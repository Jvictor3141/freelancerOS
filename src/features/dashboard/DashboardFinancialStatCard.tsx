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
    <div className="rounded-3xl bg-white/12 p-2 md:p-4 backdrop-blur-sm">
      <div className='flex items-center'>
        <div className="mr-0.5 md:mr-2 inline-flex rounded-2xl bg-white/12 p-2">
          <Icon size={10} />
        </div>
        <p className="text-sm max-[374px]:hidden text-indigo-100">{label}:</p>
      </div>
      <p className="flex items-end justify-end max-[374px]:text-xs mt-2 md:text-2xl font-semibold">{value}</p>
    </div>
  )
}
