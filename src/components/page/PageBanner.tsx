import type { ReactNode } from 'react'

type PageBannerTone = 'error' | 'warning'

type PageBannerProps = {
  tone?: PageBannerTone
  children: ReactNode
  actionLabel?: string
  onAction?: () => void
}

const toneClassName: Record<PageBannerTone, string> = {
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
}

export function PageBanner({
  tone = 'error',
  children,
  actionLabel,
  onAction,
}: PageBannerProps) {
  return (
    <section
      className={`rounded-3xl border px-5 py-4 text-sm ${toneClassName[tone]}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>{children}</div>
        {actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex w-fit items-center justify-center rounded-2xl border border-current/15 bg-white/70 px-4 py-2 text-sm font-semibold transition hover:bg-white"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </section>
  )
}
