import { Copy, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SelectField } from '../../components/SelectField'
import type { ProposalSecureShareLink } from '../../types/sharedProposal'
import type { ProposalWithClient } from '../../types/viewModels'
import { formatDateTime } from '../../utils/formatting'
import { shareExpirationValues } from './proposalsView'

type ProposalShareModalContentProps = {
  shareTargetProposal: ProposalWithClient | null
  shareExpiresInDays: number
  generatedShareLink: ProposalSecureShareLink | null
  shareFeedback: string | null
  isGeneratingShareLink: boolean
  onShareExpiresInDaysChange: (value: number) => void
  onCopyShareLink: () => void
  onResetGeneratedLink: () => void
  onClose: () => void
  onGenerateShareLink: () => void
}

export function ProposalShareModalContent({
  shareTargetProposal,
  shareExpiresInDays,
  generatedShareLink,
  shareFeedback,
  isGeneratingShareLink,
  onShareExpiresInDaysChange,
  onCopyShareLink,
  onResetGeneratedLink,
  onClose,
  onGenerateShareLink,
}: ProposalShareModalContentProps) {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.resolvedLanguage ?? 'pt'

  const expirationOptions = shareExpirationValues.map((days) => ({
    value: days,
    label: t('proposals.share_expiration_days', { count: days }),
  }))

  return (
    <div className="space-y-5">
      {shareTargetProposal ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">
            {shareTargetProposal.title}
          </p>
          <p className="mt-2 leading-6">
            {t('proposals.share_link_info')}
          </p>
        </div>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('proposals.share_expiration_label')}
        </span>
        <SelectField
          value={shareExpiresInDays}
          onChange={onShareExpiresInDaysChange}
          disabled={isGeneratingShareLink}
          options={expirationOptions}
        />
      </label>

      {generatedShareLink ? (
        <div className="space-y-4 rounded-[26px] border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {t('proposals.share_link_generated_title')}
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {t('proposals.share_link_expires_at', {
                  date: formatDateTime(generatedShareLink.expiresAt, currentLang),
                })}
              </p>
            </div>

            <a
              href={generatedShareLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm shadow-slate-100 transition hover:bg-slate-50"
              aria-label={t('proposals.share_open_view_aria')}
              title={t('proposals.share_open_view_aria')}
            >
              <ExternalLink size={16} />
            </a>
          </div>

          <textarea
            readOnly
            value={generatedShareLink.url}
            className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none"
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onCopyShareLink}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Copy size={16} />
              {t('proposals.share_copy_link')}
            </button>
            <button
              type="button"
              onClick={onResetGeneratedLink}
              className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
            >
              {t('proposals.share_generate_new_link')}
            </button>
          </div>

          {shareFeedback ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {shareFeedback}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isGeneratingShareLink}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {t('proposals.share_close')}
        </button>

        <button
          type="button"
          onClick={onGenerateShareLink}
          disabled={isGeneratingShareLink}
          className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGeneratingShareLink ? t('proposals.share_generating') : t('proposals.share_generate_link')}
        </button>
      </div>
    </div>
  )
}
