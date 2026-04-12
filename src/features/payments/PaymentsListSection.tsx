import { CheckCheck, ListFilter, PencilLine, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { SelectField } from '../../components/SelectField'
import type { PaymentWithProjectAndClient } from '../../types/viewModels'
import { formatCurrencyCode, formatDate } from '../../utils/formatting'
import { canMarkPaymentAsPaid } from './paymentRules'
import {
  type PaymentStatusFilter,
  parsePaymentStatusFilter,
  paymentStatusClassName,
  paymentStatusFilterOptions,
  paymentStatusLabel,
} from '../../utils/paymentStatus'
import { getActionButtonClassName } from '../../utils/actionButtonStyles'
import { isSupportedLanguage } from '../../i18n/config'

type PaymentsListSectionProps = {
  payments: PaymentWithProjectAndClient[]
  statusFilter: PaymentStatusFilter
  hasActiveFilters: boolean
  onStatusFilterChange: (value: PaymentStatusFilter) => void
  onOpenFilterModal: () => void
  onOpenCreateModal: () => void
  onEdit: (payment: PaymentWithProjectAndClient) => void
  onRemove: (payment: PaymentWithProjectAndClient) => void
  onMarkAsPaid: (paymentId: string) => void
}

export function PaymentsListSection({
  payments,
  statusFilter,
  hasActiveFilters,
  onStatusFilterChange,
  onOpenFilterModal,
  onOpenCreateModal,
  onEdit,
  onRemove,
  onMarkAsPaid,
}: PaymentsListSectionProps) {
  const { t, i18n } = useTranslation()
  const { lang } = useParams<{ lang?: string }>()
  const currentLang = lang && isSupportedLanguage(lang) ? lang : (i18n.resolvedLanguage ?? 'pt')

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100">
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <div className="flex justify-between gap-4 items-center">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-semibold tracking-tight text-slate-950">
              {t('payments.list_title')}
            </h3>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <SelectField
              value={statusFilter}
              className="w-44 sm:w-52 md:w-56 max-[425px]:hidden"
              ariaLabel={t('payments.filter_by_status_aria')}
              onChange={(nextValue) =>
                onStatusFilterChange(parsePaymentStatusFilter(nextValue))
              }
              options={paymentStatusFilterOptions.map((status) => ({
                value: status,
                label:
                  status === 'all'
                    ? t('status.payment.all')
                    : t(paymentStatusLabel[status]),
              }))}
            />

            <button
              type="button"
              onClick={onOpenFilterModal}
              aria-label={t('payments.open_filters_aria')}
              title={t('payments.open_filters_title')}
              className={`relative hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-white text-slate-700 transition hover:bg-slate-50 max-[425px]:flex ${
                hasActiveFilters
                  ? 'border-[#635bff] text-[#635bff]'
                  : 'border-slate-200'
              }`}
            >
              <ListFilter size={18} />
              {hasActiveFilters ? (
                <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#635bff]" />
              ) : null}
            </button>

            <button
              type="button"
              onClick={onOpenCreateModal}
              aria-label={t('payments.add_button_aria')}
              title={t('payments.add_button_title')}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#635bff] text-2xl font-semibold leading-none text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
            >
              +
            </button>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-500">
          {t('payments.count', { count: payments.length })}
        </p>
      </div>

      <div className="divide-y divide-slate-100 lg:hidden">
        {payments.length > 0 ? (
          payments.map((payment) => (
            <article key={payment.id} className="space-y-4 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {payment.clientName}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {payment.projectName}
                  </p>
                </div>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClassName[payment.status]}`}
                >
                  {t(paymentStatusLabel[payment.status])}
                </span>
              </div>

              <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                <p>
                  <span className="font-medium text-slate-900">{t('payments.card_value')}</span>{' '}
                  {formatCurrencyCode(payment.amount, payment.currency)}
                </p>
                <p>
                  <span className="font-medium text-slate-900">
                    {t('payments.card_due_date')}
                  </span>{' '}
                  {formatDate(payment.dueDate, currentLang)}
                </p>
              </div>

              <div className="inline-flex max-w-full flex-nowrap items-center gap-2">
                {canMarkPaymentAsPaid(payment) ? (
                  <button
                    type="button"
                    onClick={() => onMarkAsPaid(payment.id)}
                    aria-label={t('payments.mark_as_paid_aria', { name: payment.clientName })}
                    title={t('payments.mark_as_paid_title')}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 ${getActionButtonClassName('success')}`}
                  >
                    <CheckCheck size={15} />
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => onEdit(payment)}
                  aria-label={t('payments.edit_aria', { name: payment.clientName })}
                  title={t('payments.edit_title')}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 ${getActionButtonClassName('neutral')}`}
                >
                  <PencilLine size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => onRemove(payment)}
                  aria-label={t('payments.delete_aria', { name: payment.clientName })}
                  title={t('payments.delete_title')}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 ${getActionButtonClassName('danger')}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            {t('payments.no_results')}
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('payments.table_client')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('payments.table_project')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('payments.table_value')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('payments.table_due_date')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('payments.table_status')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {t('payments.table_actions')}
              </th>
            </tr>
          </thead>

          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-slate-100 transition hover:bg-slate-50/70"
              >
                <td className="px-6 py-4 text-sm text-slate-700">
                  {payment.clientName}
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  {payment.projectName}
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  {formatCurrencyCode(payment.amount, payment.currency)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  {formatDate(payment.dueDate, currentLang)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClassName[payment.status]}`}
                  >
                    {t(paymentStatusLabel[payment.status])}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                {canMarkPaymentAsPaid(payment) ? (
                      <button
                        type="button"
                        onClick={() => onMarkAsPaid(payment.id)}
                        aria-label={t('payments.mark_as_paid_aria', { name: payment.clientName })}
                        title={t('payments.mark_as_paid_title')}
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${getActionButtonClassName('success')}`}
                      >
                        <CheckCheck size={18} />
                      </button>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => onEdit(payment)}
                      aria-label={t('payments.edit_aria', { name: payment.clientName })}
                      title={t('payments.edit_title')}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${getActionButtonClassName('neutral')}`}
                    >
                      <PencilLine size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemove(payment)}
                      aria-label={t('payments.delete_aria', { name: payment.clientName })}
                      title={t('payments.delete_title')}
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${getActionButtonClassName('danger')}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {payments.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  {t('payments.no_results')}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}
