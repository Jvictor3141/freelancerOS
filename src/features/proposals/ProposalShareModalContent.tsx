import { Copy, ExternalLink } from 'lucide-react'
import type { ProposalSecureShareLink } from '../../types/sharedProposal'
import type { ProposalWithClient } from '../../types/viewModels'
import { formatDateTime } from '../../utils/formatting'
import { shareExpirationOptions } from '../../utils/proposalsPage'

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
  return (
    <div className="space-y-5">
      {shareTargetProposal ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
          <p className="font-semibold text-slate-900">
            {shareTargetProposal.title}
          </p>
          <p className="mt-2 leading-6">
            O token aparece somente após a geração. Se você perder esse link,
            será preciso gerar um novo.
          </p>
        </div>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Expiração do link
        </span>
        <select
          value={shareExpiresInDays}
          onChange={(event) => onShareExpiresInDaysChange(Number(event.target.value))}
          disabled={isGeneratingShareLink}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
        >
          {shareExpirationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {generatedShareLink ? (
        <div className="space-y-4 rounded-[26px] border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Link gerado com sucesso
              </p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Expira em {formatDateTime(generatedShareLink.expiresAt)}.
              </p>
            </div>

            <a
              href={generatedShareLink.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm shadow-slate-100 transition hover:bg-slate-50"
              aria-label="Abrir visualização compartilhada"
              title="Abrir visualização compartilhada"
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
              Copiar link
            </button>
            <button
              type="button"
              onClick={onResetGeneratedLink}
              className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Gerar novo link
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
          Fechar
        </button>

        <button
          type="button"
          onClick={onGenerateShareLink}
          disabled={isGeneratingShareLink}
          className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isGeneratingShareLink ? 'Gerando...' : 'Gerar link seguro'}
        </button>
      </div>
    </div>
  )
}
