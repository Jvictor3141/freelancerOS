import { formatCurrency } from '../../utils/formatting'
import type { ProjectsCommercialSummary } from '../../types/viewModels'

type ProjectsCommercialBannerProps = {
  summary: ProjectsCommercialSummary
  onOpenProposals: () => void
}

export function ProjectsCommercialBanner({
  summary,
  onOpenProposals,
}: ProjectsCommercialBannerProps) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-sm text-indigo-900 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="font-semibold text-indigo-950">
          {summary.openCount} proposta(s) aberta(s) no pipeline comercial.
        </p>
        <p className="mt-1 text-indigo-800">
          {summary.draftCount} em rascunho, {summary.sentCount} enviada(s) e{' '}
          {formatCurrency(summary.openPipelineValue)} em valor potencial antes de
          virarem projeto.
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenProposals}
        className="rounded-2xl border border-indigo-300 bg-white px-4 py-3 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-100"
      >
        Ir para Propostas
      </button>
    </section>
  )
}
