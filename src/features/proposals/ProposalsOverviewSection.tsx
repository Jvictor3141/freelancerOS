import {
  CheckCircle2,
  Clock3,
  PencilLine,
  Plus,
  Send,
} from 'lucide-react'
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

  const countCards = [
    { label: t('proposals.overview_metric_drafts'),   value: metrics.draftCount,    icon: PencilLine   },
    { label: t('proposals.overview_metric_sent'),     value: metrics.sentCount,     icon: Send         },
    { label: t('proposals.overview_metric_accepted'), value: metrics.acceptedCount, icon: CheckCircle2 },
  ]

  return (
    <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <article className="rounded-[28px] bg-[#635bff] p-6 text-white shadow-[0_24px_60px_rgba(99,91,255,0.28)]">
        <p className="text-sm font-medium text-indigo-100">{t('proposals.overview_label')}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          {t('proposals.overview_heading')}
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-4">
          {countCards.map((card) => {
            const Icon = card.icon
            return (
              <div key={card.label} className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
                <div className="flex items-center">
                  <div className="mr-2 inline-flex rounded-2xl bg-white/12 p-2">
                    <Icon size={10} />
                  </div>
                  <p className="text-sm text-indigo-100">{card.label}:</p>
                </div>
                <p className="mt-2 text-right text-lg font-semibold">{card.value}</p>
              </div>
            )
          })}

          <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
            <div className="flex items-center">
              <div className="mr-2 inline-flex rounded-2xl bg-white/12 p-2">
                <Clock3 size={10} />
              </div>
              <p className="text-sm text-indigo-100">{t('proposals.overview_metric_open')}:</p>
            </div>
            <div className="mt-2 flex flex-col items-end gap-0.5">
              {metrics.openPipelineValue.length > 0
                ? metrics.openPipelineValue.map(({ currency, amount }) => (
                    <p key={currency} className="text-lg font-semibold leading-tight">
                      {formatCurrencyCompact(amount, currency)}
                    </p>
                  ))
                : <p className="text-lg font-semibold">—</p>
              }
            </div>
          </div>
        </div>
      </article>

      <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">{t('proposals.quick_action_label')}</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          {t('proposals.quick_action_heading')}
        </h3>

        <button
          type="button"
          onClick={onCreate}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
        >
          {t('proposals.new_button')}
          <Plus size={16} />
        </button>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">{t('proposals.flow_label')}</p>
          <ul className="mt-3 text-sm leading-6 text-slate-600">
            <li>{t('proposals.flow_step_1')}</li>
            <li>{t('proposals.flow_step_2')}</li>
            <li>{t('proposals.flow_step_3')}</li>
          </ul>
        </div>
      </article>
    </section>
  )
}
