type DashboardErrorBannerProps = {
  message: string
  onRetry?: () => void
}

export function DashboardErrorBanner({
  message,
  onRetry,
}: DashboardErrorBannerProps) {
  return (
    <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>{message}</div>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex w-fit items-center justify-center rounded-2xl border border-rose-300 bg-white/80 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-white"
          >
            Tentar novamente
          </button>
        ) : null}
      </div>
    </section>
  )
}
