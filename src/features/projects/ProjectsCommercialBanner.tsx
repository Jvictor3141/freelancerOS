import { useTranslation } from 'react-i18next'
import { formatCurrencyCompact } from '../../utils/formatting'
import type { ProjectsCommercialSummary } from '../../types/viewModels'

type ProjectsCommercialBannerProps = {
  summary: ProjectsCommercialSummary
  onOpenProposals: () => void
}

export function ProjectsCommercialBanner({
  summary,
  onOpenProposals,
}: ProjectsCommercialBannerProps) {
  const { t } = useTranslation()

  const pipelineValueText = summary.openPipelineValue.length > 0
    ? summary.openPipelineValue
        .map(({ currency, amount }) => formatCurrencyCompact(amount, currency))
        .join(' + ')
    : '—'

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-sm text-indigo-900 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="font-semibold text-indigo-950">
          {t('projects.commercial_count', { count: summary.openCount })}
        </p>
        <p className="mt-1 text-indigo-800">
          {t('projects.commercial_detail', {
            draftCount: summary.draftCount,
            sentCount: summary.sentCount,
            value: pipelineValueText,
          })}
        </p>
      </div>

      <button
        type="button"
        onClick={onOpenProposals}
        className="rounded-2xl border border-indigo-300 bg-white px-4 py-3 text-sm font-semibold text-indigo-900 transition hover:bg-indigo-100"
      >
        {t('projects.go_to_proposals')}
      </button>
    </section>
  )
}
