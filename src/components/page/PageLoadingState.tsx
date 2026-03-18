type PageLoadingStateProps = {
  label: string
  description: string
}

export function PageLoadingState({
  label,
  description,
}: PageLoadingStateProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-100">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
        Carregando dados do banco...
      </h2>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </section>
  )
}
