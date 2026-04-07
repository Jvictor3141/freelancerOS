import { PencilLine } from 'lucide-react'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
} from '../../utils/formatting'
import {
  proposalStatusClassName,
  proposalStatusLabel,
} from '../../utils/proposalStatus'
import { hasSharedLinkClientResponse, isAcceptedProposal } from './proposalRules'
import type { ProposalWithClient } from '../../types/viewModels'

type Props = {
  proposal: ProposalWithClient
  canEdit: boolean
  onEdit: () => void
}

type MetaField = {
  label: string
  value: string
}

export function ProposalDetailModalContent({ proposal, canEdit, onEdit }: Props) {
  const hasClientResponse = hasSharedLinkClientResponse(proposal)
  const isAccepted = isAcceptedProposal(proposal)

  const metaFields: MetaField[] = [
    { label: 'Cliente', value: proposal.clientName },
    { label: 'Empresa', value: proposal.clientCompany || '—' },
    { label: 'E-mail do destinatário', value: proposal.recipientEmail },
    { label: 'Prazo de entrega', value: `${proposal.deliveryDays} dia(s)` },
    { label: 'Criada em', value: formatDate(proposal.createdAt) },
    { label: 'Enviada em', value: formatDate(proposal.sentAt) },
  ]

  if (proposal.acceptedAt) {
    metaFields.push({ label: 'Aceita em', value: formatDate(proposal.acceptedAt) })
  }

  if (proposal.rejectedAt) {
    metaFields.push({ label: 'Recusada em', value: formatDate(proposal.rejectedAt) })
  }

  return (
    <div className="space-y-5">
      {/* Status + valor */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">Valor da proposta</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrency(proposal.amount)}
          </p>
        </div>
        <span
          className={`inline-flex h-7 w-fit rounded-full px-3 py-1 text-xs font-semibold ${proposalStatusClassName[proposal.status]}`}
        >
          {proposalStatusLabel[proposal.status]}
        </span>
      </div>

      {/* Escopo / descrição */}
      {proposal.description ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Escopo
          </p>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {proposal.description}
          </p>
        </div>
      ) : (
        <p className="text-sm italic text-slate-400">Sem escopo detalhado.</p>
      )}

      {/* Meta */}
      <div className="grid gap-2 sm:grid-cols-2">
        {metaFields.map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium text-slate-400">{label}</p>
            <p className="mt-0.5 break-all text-sm font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Observações */}
      {proposal.notes ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Observações
          </p>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {proposal.notes}
          </p>
        </div>
      ) : null}

      {/* Resposta do cliente */}
      {hasClientResponse ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            isAccepted
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {isAccepted ? 'Cliente aceitou' : 'Cliente recusou'} essa proposta em{' '}
          {formatDateTime(proposal.clientRespondedAt)}.
        </div>
      ) : null}

      {/* Rodapé com ação */}
      {canEdit ? (
        <div className="flex justify-end border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <PencilLine size={15} />
            Editar proposta
          </button>
        </div>
      ) : null}
    </div>
  )
}
