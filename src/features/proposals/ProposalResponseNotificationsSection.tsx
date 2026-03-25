import { X } from 'lucide-react'
import type { ProposalWithClient } from '../../types/viewModels'
import { formatDateTime } from '../../utils/formatting'
import { isAcceptedProposal } from '../../utils/proposalRules'

type ProposalResponseNotificationsSectionProps = {
  notifications: ProposalWithClient[]
  onDismiss: (proposal: ProposalWithClient) => void
}

export function ProposalResponseNotificationsSection({
  notifications,
  onDismiss,
}: ProposalResponseNotificationsSectionProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Respostas do cliente
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Portal compartilhado com atividade recente
          </h3>
        </div>
        <p className="text-sm text-slate-500">
          {notifications.length} aviso(s) ativo(s)
        </p>
      </div>

      <div className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pr-1">
        {notifications.map((proposal) => {
          const isAccepted = isAcceptedProposal(proposal)

          return (
            <article
              key={`${proposal.id}-${proposal.clientRespondedAt}`}
              className={`w-full shrink-0 snap-start rounded-3xl border p-4 md:w-[calc((100%-0.75rem)/2)] xl:w-[calc((100%-1.5rem)/3)] ${
                isAccepted
                  ? 'border-emerald-200 bg-emerald-50/70'
                  : 'border-rose-200 bg-rose-50/70'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-semibold text-slate-950">
                      {proposal.title}
                    </h4>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        isAccepted
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isAccepted ? 'Aceita' : 'Recusada'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {proposal.clientName}
                    {proposal.clientCompany ? ` · ${proposal.clientCompany}` : ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onDismiss(proposal)}
                  aria-label={`Remover aviso da proposta ${proposal.title}`}
                  title="Remover aviso"
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 transition hover:bg-white hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Resposta em{' '}
                <span className="font-semibold text-slate-900">
                  {formatDateTime(proposal.clientRespondedAt)}
                </span>
                .
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
