import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatCurrencyCompact } from '../../utils/formatting'
import type { ProposalMetrics } from '../../types/viewModels'

type ProposalsOverviewSectionProps = {
  metrics: ProposalMetrics
  onCreate: () => void
}

export function ProposalsOverviewSection({
  metrics,
  onCreate,
}: ProposalsOverviewSectionProps) {
  const { t } = useTranslation()

  const stats = [
    { label: t('proposals.overview_metric_drafts'),   value: metrics.draftCount    },
    { label: t('proposals.overview_metric_sent'),     value: metrics.sentCount     },
    { label: t('proposals.overview_metric_accepted'), value: metrics.acceptedCount },
  ]

  const flowSteps = [
    t('proposals.flow_step_1'),
    t('proposals.flow_step_2'),
    t('proposals.flow_step_3'),
  ]

  return (
    <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">

      {/* Left — main overview */}
      <article className="rounded-[28px] bg-[#635bff] p-6 text-white shadow-[0_24px_60px_rgba(99,91,255,0.28)]">
        <div className="space-y-1">
          <p className="text-sm font-medium text-indigo-100">{t('proposals.overview_label')}</p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t('proposals.overview_heading')}
          </h2>
        </div>

        {/* Count stats */}
        <div className="mt-6 grid grid-cols-3 divide-x divide-white/15">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={i === 0 ? 'pr-4' : i === stats.length - 1 ? 'pl-4' : 'px-4'}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-200">
                {stat.label}
              </p>
              <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="my-5 h-px bg-white/15" />

        {/* Pipeline */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-indigo-200">
            {t('proposals.overview_metric_open')}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            {metrics.openPipelineValue.length > 0
              ? metrics.openPipelineValue.map(({ currency, amount }) => (
                  <span
                    key={currency}
                    className="flex flex-col items-end rounded-2xl bg-white/15 px-3 py-2 backdrop-blur-sm"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-200">
                      {currency}
                    </span>
                    <span className="text-sm font-semibold leading-tight">
                      {formatCurrencyCompact(amount, currency)}
                    </span>
                  </span>
                ))
              : <span className="text-sm text-indigo-300">—</span>
            }
          </div>
        </div>
      </article>

      {/* Right — quick action */}
      <article className="flex flex-col rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{t('proposals.quick_action_label')}</p>
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">
            {t('proposals.quick_action_heading')}
          </h3>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
        >
          {t('proposals.new_button')}
          <Plus size={15} />
        </button>

        {/* Flow steps */}
        <div className="mt-5 flex flex-col gap-3">
          {flowSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-bold text-indigo-600">
                {i + 1}
              </span>
              <p className="text-sm leading-5 text-slate-500">{step}</p>
            </div>
          ))}
        </div>
      </article>

    </section>
  )
}
