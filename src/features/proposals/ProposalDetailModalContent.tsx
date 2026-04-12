import { PencilLine } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  formatCurrencyCode,
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
  const { t, i18n } = useTranslation()
  const currentLang = i18n.resolvedLanguage ?? 'pt'
  const hasClientResponse = hasSharedLinkClientResponse(proposal)
  const isAccepted = isAcceptedProposal(proposal)

  const metaFields: MetaField[] = [
    { label: t('proposals.detail_field_client'), value: proposal.clientName },
    { label: t('proposals.detail_field_company'), value: proposal.clientCompany || '—' },
    { label: t('proposals.detail_field_email'), value: proposal.recipientEmail },
    { label: t('proposals.detail_field_deadline'), value: `${proposal.deliveryDays} ${t('proposals.share_expiration_days', { count: proposal.deliveryDays })}` },
    { label: t('proposals.detail_field_created_at'), value: formatDate(proposal.createdAt, currentLang) },
    { label: t('proposals.detail_field_sent_at'), value: formatDate(proposal.sentAt, currentLang) },
  ]

  if (proposal.acceptedAt) {
    metaFields.push({ label: t('proposals.detail_field_accepted_at'), value: formatDate(proposal.acceptedAt, currentLang) })
  }

  if (proposal.rejectedAt) {
    metaFields.push({ label: t('proposals.detail_field_rejected_at'), value: formatDate(proposal.rejectedAt, currentLang) })
  }

  return (
    <div className="space-y-5">
      {/* Status + valor */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">{t('proposals.value_label')}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {formatCurrencyCode(proposal.amount, proposal.currency)}
          </p>
        </div>
        <span
          className={`inline-flex h-7 w-fit rounded-full px-3 py-1 text-xs font-semibold ${proposalStatusClassName[proposal.status]}`}
        >
          {t(proposalStatusLabel[proposal.status])}
        </span>
      </div>

      {/* Escopo / descrição */}
      {proposal.description ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            {t('proposals.scope_label')}
          </p>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {proposal.description}
          </p>
        </div>
      ) : (
        <p className="text-sm italic text-slate-400">{t('proposals.no_scope')}</p>
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
            {t('proposals.notes_section_label')}
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
          {t('proposals.client_responded_at', {
            response: isAccepted ? t('proposals.accepted_by_client') : t('proposals.rejected_by_client'),
            date: formatDateTime(proposal.clientRespondedAt, currentLang),
          })}
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
            {t('proposals.edit_button')}
          </button>
        </div>
      ) : null}
    </div>
  )
}
