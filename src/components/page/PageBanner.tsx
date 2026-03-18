import type { ReactNode } from 'react'

type PageBannerTone = 'error' | 'warning'

type PageBannerProps = {
  tone?: PageBannerTone
  children: ReactNode
}

const toneClassName: Record<PageBannerTone, string> = {
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
}

export function PageBanner({
  tone = 'error',
  children,
}: PageBannerProps) {
  return (
    <section
      className={`rounded-3xl border px-5 py-4 text-sm ${toneClassName[tone]}`}
    >
      {children}
    </section>
  )
}
