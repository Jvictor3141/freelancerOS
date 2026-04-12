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
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
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
} from './proposalRules'
import type { ProposalWithClient } from '../../types/viewModels'
import {
  proposalStatusClassName,
  proposalStatusLabel,
} from '../../utils/proposalStatus'
import { isSupportedLanguage } from '../../i18n/config'

type ProposalListSectionProps = {
  proposals: ProposalWithClient[]
  onView: (proposal: ProposalWithClient) => void
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
  onView,
  onEdit,
  onOpenShare,
  onSend,
  onAccept,
  onReject,
  onReopen,
  onOpenProjects,
  onRemove,
}: ProposalListSectionProps) {
  const { t, i18n } = useTranslation()
  const { lang } = useParams<{ lang?: string }>()
  const currentLang = lang && isSupportedLanguage(lang) ? lang : (i18n.resolvedLanguage ?? 'pt')

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          {t('proposals.list_title')}
        </h3>
        <p className="text-sm font-medium text-slate-500">
          {t('proposals.count', { count: proposals.length })}
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
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onView(proposal)}
                          className="text-left text-xl font-bold text-slate-900 hover:underline"
                        >
                          {proposal.title}
                        </button>
                        <span
                          className={`inline-flex h-7 w-fit rounded-full px-3 py-1 text-xs font-semibold ${proposalStatusClassName[proposal.status]}`}
                        >
                          {t(proposalStatusLabel[proposal.status])}
                        </span>
                      </div>

                      <p
                        className="mt-2 overflow-hidden text-sm text-slate-500"
                        title={proposal.description || t('proposals.no_scope')}
                        style={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 3,
                        }}
                      >
                        {proposal.description || t('proposals.no_scope')}
                      </p>
                    </div>

                    <div className="shrink-0 rounded-2xl bg-slate-100 px-4 py-3 text-sm">
                      <p className="text-slate-500">{t('proposals.value_label')}</p>
                      <p className="mt-1 font-semibold text-slate-950">
                        {formatCurrency(proposal.amount, currentLang)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                    <p>
                      <span className="font-medium text-slate-900">{t('proposals.field_client')}</span>{' '}
                      {proposal.clientName}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">{t('proposals.field_company')}</span>{' '}
                      {proposal.clientCompany || t('common.none')}
                    </p>
                    <p className="break-all">
                      <span className="font-medium text-slate-900">{t('proposals.field_email')}</span>{' '}
                      {proposal.recipientEmail}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">{t('proposals.field_deadline')}</span>{' '}
                      {t('proposals.delivery_days', { count: proposal.deliveryDays })}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">{t('proposals.field_created_at')}</span>{' '}
                      {formatDate(proposal.createdAt, currentLang)}
                    </p>
                    <p>
                      <span className="font-medium text-slate-900">{t('proposals.field_sent_at')}</span>{' '}
                      {formatDate(proposal.sentAt, currentLang)}
                    </p>
                    {proposal.acceptedAt ? (
                      <p>
                        <span className="font-medium text-slate-900">{t('proposals.field_accepted_at')}</span>{' '}
                        {formatDate(proposal.acceptedAt, currentLang)}
                      </p>
                    ) : null}
                    {proposal.rejectedAt ? (
                      <p>
                        <span className="font-medium text-slate-900">{t('proposals.field_rejected_at')}</span>{' '}
                        {formatDate(proposal.rejectedAt, currentLang)}
                      </p>
                    ) : null}
                  </div>

                  {proposal.notes ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      <span className="font-medium text-slate-900">{t('proposals.field_notes')}</span>{' '}
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
                      {t('proposals.client_responded_at', {
                        response: isAccepted ? t('proposals.accepted_by_client') : t('proposals.rejected_by_client'),
                        date: formatDateTime(proposal.clientRespondedAt, currentLang),
                      })}
                    </div>
                  ) : null}

                <div className="inline-flex max-w-full flex-nowrap items-center gap-2">
                  {canEditProposal(proposal) ? (
                    <ProposalActionButton
                      tone="neutral"
                      label={t('proposals.edit_aria', { title: proposal.title })}
                      title={t('proposals.edit_title')}
                      icon={PencilLine}
                      onClick={() => onEdit(proposal)}
                    />
                  ) : null}

                  {canGenerateProposalShareLink(proposal) ? (
                    <ProposalActionButton
                      tone="info"
                      label={t('proposals.share_aria', { title: proposal.title })}
                      title={t('proposals.share_title')}
                      icon={Link2}
                      onClick={() => onOpenShare(proposal)}
                    />
                  ) : null}

                  {sendMode === 'send' ? (
                    <ProposalActionButton
                      tone="info"
                      label={t('proposals.send_aria', { title: proposal.title })}
                      title={t('proposals.send_title')}
                      icon={Mail}
                      onClick={() => onSend(proposal)}
                    />
                  ) : null}

                  {sendMode === 'resend' ? (
                    <ProposalActionButton
                      tone="info"
                      label={t('proposals.resend_aria', { title: proposal.title })}
                      title={t('proposals.resend_title')}
                      icon={Send}
                      onClick={() => onSend(proposal)}
                    />
                  ) : null}

                  {canAcceptProposal(proposal) ? (
                    <ProposalActionButton
                      tone="success"
                      label={t('proposals.accept_aria', { title: proposal.title })}
                      title={t('proposals.accept_title')}
                      icon={CheckCircle2}
                      onClick={() => onAccept(proposal)}
                    />
                  ) : null}

                  {canRejectProposal(proposal) ? (
                    <ProposalActionButton
                      tone="danger"
                      label={t('proposals.reject_aria', { title: proposal.title })}
                      title={t('proposals.reject_title')}
                      icon={XCircle}
                      onClick={() => onReject(proposal)}
                    />
                  ) : null}

                  {canReopenProposal(proposal) ? (
                    <ProposalActionButton
                      tone="neutral"
                      label={t('proposals.reopen_aria', { title: proposal.title })}
                      title={t('proposals.reopen_title')}
                      icon={RotateCcw}
                      onClick={() => onReopen(proposal)}
                    />
                  ) : null}

                  {canOpenProposalProject(proposal) ? (
                    <ProposalActionButton
                      tone="success"
                      label={t('proposals.open_projects_aria')}
                      title={t('proposals.open_projects_title')}
                      icon={ArrowRight}
                      onClick={onOpenProjects}
                    />
                  ) : null}

                  <ProposalActionButton
                    tone="neutral"
                    label={t('proposals.delete_aria', { title: proposal.title })}
                    title={t('proposals.delete_title')}
                    icon={Trash2}
                    onClick={() => onRemove(proposal)}
                  />
                </div>
              </article>
            )
          })
        ) : (
          <div className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
            {t('proposals.no_results')}
          </div>
        )}
      </div>
    </section>
  )
}
