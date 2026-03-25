import {
  ArrowRight,
  CheckCircle2,
  Link2,
  Mail,
  PencilLine,
  RotateCcw,
  Send,
  Trash2,
  XCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getActionButtonClassName } from '../../utils/actionButtonStyles'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from '../../utils/formatting'
import {
  canAcceptProposal,
  canEditProposal,
  canGenerateProposalShareLink,
  canOpenProposalProject,
  canRejectProposal,
  canReopenProposal,
  getProposalSendMode,
  hasSharedLinkClientResponse,
  isAcceptedProposal,
} from '../../utils/proposalRules'
import type { ProposalWithClient } from '../../types/viewModels'
import {
  proposalStatusClassName,
  proposalStatusLabel,
} from '../../utils/proposalStatus'

type ProposalListSectionProps = {
  proposals: ProposalWithClient[]
  onEdit: (proposal: ProposalWithClient) => void
  onOpenShare: (proposal: ProposalWithClient) => void
  onSend: (proposal: ProposalWithClient) => void
  onAccept: (proposal: ProposalWithClient) => void
  onReject: (proposal: ProposalWithClient) => void
  onReopen: (proposal: ProposalWithClient) => void
  onOpenProjects: () => void
  onRemove: (proposal: ProposalWithClient) => void
}

type ProposalActionButtonProps = {
  tone: 'neutral' | 'info' | 'success' | 'danger'
  label: string
  title: string
  icon: LucideIcon
  onClick: () => void
}

function ProposalActionButton({
  tone,
  label,
  title,
  icon: Icon,
  onClick,
}: ProposalActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={title}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 lg:h-11 lg:w-11 lg:rounded-xl ${getActionButtonClassName(
        tone,
      )}`}
    >
      <Icon size={15} className="lg:h-4.25 lg:w-4.25" />
    </button>
  )
}

export function ProposalListSection({
  proposals,
  onEdit,
  onOpenShare,
  onSend,
  onAccept,
  onReject,
  onReopen,
  onOpenProjects,
  onRemove,
}: ProposalListSectionProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          Propostas da operação
        </h3>
        <p className="text-sm font-medium text-slate-500">
          {proposals.length} proposta(s) encontrada(s)
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {proposals.length > 0 ? (
          proposals.map((proposal) => {
            const sendMode = getProposalSendMode(proposal)
            const hasClientResponse = hasSharedLinkClientResponse(proposal)
            const isAccepted = isAcceptedProposal(proposal)

            return (
              <article key={proposal.id} className="space-y-4 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex justify-between gap-2 sm:flex-row sm:items-center">
                      <p className="text-lg font-semibold text-slate-900">
                        {proposal.title}
                      </p>
                      <span
                        className={`inline-flex w-fit h-7 rounded-full px-3 py-1 text-xs font-semibold ${proposalStatusClassName[proposal.status]}`}
                      >
                        {proposalStatusLabel[proposal.status]}
                      </span>
                    </div>

                    <p
                      className="mt-2 overflow-hidden text-sm text-slate-500"
                      title={proposal.description || 'Sem escopo detalhado.'}
                      style={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                      }}
                    >
                      {proposal.description || 'Sem escopo detalhado.'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                    <p className="text-slate-500">Valor da proposta</p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {formatCurrency(proposal.amount)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                  <p>
                    <span className="font-medium text-slate-900">Cliente:</span>{' '}
                    {proposal.clientName}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Empresa:</span>{' '}
                    {proposal.clientCompany || '-'}
                  </p>
                  <p className="break-all">
                    <span className="font-medium text-slate-900">E-mail:</span>{' '}
                    {proposal.recipientEmail}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Prazo:</span>{' '}
                    {proposal.deliveryDays} dia(s)
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Criada em:</span>{' '}
                    {formatDate(proposal.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Enviada em:</span>{' '}
                    {formatDate(proposal.sentAt)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Aceita em:</span>{' '}
                    {formatDate(proposal.acceptedAt)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Recusada em:</span>{' '}
                    {formatDate(proposal.rejectedAt)}
                  </p>
                </div>

                {proposal.notes ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <span className="font-medium text-slate-900">
                      Observações:
                    </span>{' '}
                    <span
                      className="overflow-hidden align-top"
                      title={proposal.notes}
                      style={{
                        display: '-webkit-inline-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                      }}
                    >
                      {proposal.notes}
                    </span>
                  </div>
                ) : null}

                {hasClientResponse ? (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      isAccepted
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-rose-200 bg-rose-50 text-rose-800'
                    }`}
                  >
                    {isAccepted ? 'Cliente aceitou' : 'Cliente recusou'} essa
                    proposta em {formatDateTime(proposal.clientRespondedAt)}.
                  </div>
                ) : null}

                <div className="inline-flex max-w-full flex-nowrap items-center gap-2">
                  {canEditProposal(proposal) ? (
                    <ProposalActionButton
                      tone="neutral"
                      label={`Editar proposta ${proposal.title}`}
                      title="Editar proposta"
                      icon={PencilLine}
                      onClick={() => onEdit(proposal)}
                    />
                  ) : null}

                  {canGenerateProposalShareLink(proposal) ? (
                    <ProposalActionButton
                      tone="info"
                      label={`Gerar link seguro da proposta ${proposal.title}`}
                      title="Gerar link seguro"
                      icon={Link2}
                      onClick={() => onOpenShare(proposal)}
                    />
                  ) : null}

                  {sendMode === 'send' ? (
                    <ProposalActionButton
                      tone="info"
                      label={`Enviar proposta ${proposal.title} ao cliente`}
                      title="Enviar ao cliente"
                      icon={Mail}
                      onClick={() => onSend(proposal)}
                    />
                  ) : null}

                  {sendMode === 'resend' ? (
                    <ProposalActionButton
                      tone="info"
                      label={`Reenviar proposta ${proposal.title}`}
                      title="Reenviar proposta"
                      icon={Send}
                      onClick={() => onSend(proposal)}
                    />
                  ) : null}

                  {canAcceptProposal(proposal) ? (
                    <ProposalActionButton
                      tone="success"
                      label={`Aceitar proposta ${proposal.title} e gerar projeto`}
                      title="Aceitar e gerar projeto"
                      icon={CheckCircle2}
                      onClick={() => onAccept(proposal)}
                    />
                  ) : null}

                  {canRejectProposal(proposal) ? (
                    <ProposalActionButton
                      tone="danger"
                      label={`Marcar proposta ${proposal.title} como recusada`}
                      title="Marcar como recusada"
                      icon={XCircle}
                      onClick={() => onReject(proposal)}
                    />
                  ) : null}

                  {canReopenProposal(proposal) ? (
                    <ProposalActionButton
                      tone="neutral"
                      label={`Reabrir proposta ${proposal.title} como rascunho`}
                      title="Reabrir rascunho"
                      icon={RotateCcw}
                      onClick={() => onReopen(proposal)}
                    />
                  ) : null}

                  {canOpenProposalProject(proposal) ? (
                    <ProposalActionButton
                      tone="success"
                      label="Abrir projetos"
                      title="Abrir projetos"
                      icon={ArrowRight}
                      onClick={onOpenProjects}
                    />
                  ) : null}

                  <ProposalActionButton
                    tone="neutral"
                    label={`Excluir proposta ${proposal.title}`}
                    title="Excluir proposta"
                    icon={Trash2}
                    onClick={() => onRemove(proposal)}
                  />
                </div>
              </article>
            )
          })
        ) : (
          <div className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
            Nenhuma proposta encontrada. Crie a primeira para começar o fluxo
            comercial.
          </div>
        )}
      </div>
    </section>
  )
}
