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
      <div className='flex items-center'>
        <div className={`mr-2 inline-flex rounded-2xl p-3 ${iconClassName}`}>
          <Icon size={13} />
        </div>
        <p className="text-sm max-[374px]:text-xs font-medium text-slate-500">{label}</p>
      </div>
      <p className="flex items-end justify-end mt-2 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="flex bottom-0 justify-center mt-2 text-sm max-[374px]:text-xs text-slate-500">{description}</p>
    </div>
  )
}
