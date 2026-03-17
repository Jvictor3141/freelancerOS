type DashboardErrorBannerProps = {
  message: string
}

export function DashboardErrorBanner({ message }: DashboardErrorBannerProps) {
  return (
    <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
      {message}
    </section>
  )
}
