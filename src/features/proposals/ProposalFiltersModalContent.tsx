import { useTranslation } from 'react-i18next'
import { SelectField } from '../../components/SelectField'
import {
  type ProposalStatusFilter,
  parseProposalStatusFilter,
  proposalStatusLabel,
  proposalStatusOptions,
} from '../../utils/proposalStatus'

type ProposalFiltersModalContentProps = {
  statusFilterDraft: ProposalStatusFilter
  onStatusChange: (value: ProposalStatusFilter) => void
  onClear: () => void
  onApply: () => void
}

export function ProposalFiltersModalContent({
  statusFilterDraft,
  onStatusChange,
  onClear,
  onApply,
}: ProposalFiltersModalContentProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Status
        </span>
        <SelectField
          value={statusFilterDraft}
          onChange={(nextValue) =>
            onStatusChange(parseProposalStatusFilter(nextValue))
          }
          options={proposalStatusOptions.map((status) => ({
            value: status,
            label:
              status === 'all'
                ? t('proposals.filter_all_statuses')
                : t(proposalStatusLabel[status]),
          }))}
        />
      </label>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClear}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {t('proposals.filter_clear')}
        </button>

        <button
          type="button"
          onClick={onApply}
          className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
        >
          {t('proposals.filter_apply')}
        </button>
      </div>
    </div>
  )
}
