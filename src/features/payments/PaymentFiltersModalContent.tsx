import { useTranslation } from 'react-i18next'
import { SelectField } from '../../components/SelectField'
import {
  type PaymentStatusFilter,
  parsePaymentStatusFilter,
  paymentStatusFilterOptions,
  paymentStatusLabel,
} from '../../utils/paymentStatus'

type PaymentFiltersModalContentProps = {
  statusFilterDraft: PaymentStatusFilter
  onStatusChange: (value: PaymentStatusFilter) => void
  onClear: () => void
  onApply: () => void
}

export function PaymentFiltersModalContent({
  statusFilterDraft,
  onStatusChange,
  onClear,
  onApply,
}: PaymentFiltersModalContentProps) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('payments.filter_status_label')}
        </span>
        <SelectField
          value={statusFilterDraft}
          onChange={(nextValue) =>
            onStatusChange(parsePaymentStatusFilter(nextValue))
          }
          options={paymentStatusFilterOptions.map((status) => ({
            value: status,
            label:
              status === 'all' ? t('payments.filter_all_statuses') : t(paymentStatusLabel[status]),
          }))}
        />
      </label>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClear}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {t('payments.filter_clear')}
        </button>

        <button
          type="button"
          onClick={onApply}
          className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
        >
          {t('payments.filter_apply')}
        </button>
      </div>
    </div>
  )
}
