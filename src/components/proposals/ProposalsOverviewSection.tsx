import {
  CheckCircle2,
  Clock3,
  PencilLine,
  Plus,
  Send,
} from 'lucide-react'
import { formatCurrency } from '../../utils/formatting'
import type { ProposalMetrics } from '../../utils/proposalsPage'

type ProposalsOverviewSectionProps = {
  metrics: ProposalMetrics
  onCreate: () => void
}

export function ProposalsOverviewSection({
  metrics,
  onCreate,
}: ProposalsOverviewSectionProps) {
  const summaryCards = [
    {
      label: 'Rascunhos',
      value: metrics.draftCount,
      icon: PencilLine,
    },
    {
      label: 'Enviadas',
      value: metrics.sentCount,
      icon: Send,
    },
    {
      label: 'Aceitas',
      value: metrics.acceptedCount,
      icon: CheckCircle2,
    },
    {
      label: 'Pipeline aberto',
      value: formatCurrency(metrics.openPipelineValue),
      icon: Clock3,
    },
  ]

  return (
    <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <article className="rounded-[28px] bg-[#635bff] p-6 text-white shadow-[0_24px_60px_rgba(99,91,255,0.28)]">
        <p className="text-sm font-medium text-indigo-100">Fluxo comercial</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Proposta, envio, aceite e projeto no mesmo fluxo
        </h2>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon

            return (
              <div
                key={card.label}
                className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm"
              >
                <div className="mb-3 inline-flex rounded-2xl bg-white/12 p-2">
                  <Icon size={18} />
                </div>
                <p className="text-sm text-indigo-100">{card.label}</p>
                <p className="mt-2 text-2xl font-semibold">{card.value}</p>
              </div>
            )
          })}
        </div>
      </article>

      <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">Ação rápida</p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          Nova proposta operacional
        </h3>

        <button
          type="button"
          onClick={onCreate}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
        >
          Nova proposta
          <Plus size={16} />
        </button>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Fluxo</p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
            <li>1. Crie o rascunho com escopo, valor e prazo.</li>
            <li>2. Envie por email para o contato do cliente.</li>
            <li>3. Ao aceitar, gere o projeto automaticamente.</li>
          </ul>
        </div>
      </article>
    </section>
  )
}
