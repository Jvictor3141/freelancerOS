import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFeedback } from './FeedbackProvider';
import { SelectField } from './SelectField';
import type { PaymentInput } from '../types/inputs';
import type { Payment } from '../types/payment';
import type { Project } from '../types/project';
import { formatDateInputValue } from '../utils/dateOnly';
import { formatCurrencyCode } from '../utils/formatting';
import { paymentMethods } from '../types/payment';
import {
  isPersistedPaymentStatus,
  isPaymentMethod,
  paymentStatusLabel,
  toPersistedPaymentStatus,
} from '../utils/paymentStatus';

type PaymentFormState = Omit<PaymentInput, 'amount'> & {
  amount: string;
};
type PaymentFormField = keyof PaymentFormState;

type PaymentFormProps = {
  projects: Project[];
  initialValues?: Payment | null;
  onSubmit: (values: PaymentInput) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

const emptyValues: PaymentFormState = {
  projectId: '',
  amount: '',
  currency: 'BRL',
  dueDate: '',
  paidAt: null,
  status: 'pending',
  method: 'pix',
  notes: '',
};

export function PaymentForm({
  projects,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: PaymentFormProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<PaymentFormState>(emptyValues);
  const { notify } = useFeedback();

  const selectedProject = projects.find((p) => p.id === values.projectId) ?? null;

  function setField<K extends PaymentFormField>(
    field: K,
    value: PaymentFormState[K],
  ) {
    setValues((previousValues) => ({
      ...previousValues,
      [field]: value,
    }));
  }

  useEffect(() => {
    if (initialValues) {
      setValues({
        projectId: initialValues.projectId,
        amount: String(initialValues.amount),
        currency: initialValues.currency,
        dueDate: initialValues.dueDate,
        paidAt: initialValues.paidAt,
        status: toPersistedPaymentStatus(initialValues.status),
        method: initialValues.method,
        notes: initialValues.notes,
      });
      return;
    }

    const firstProject = projects[0];
    setValues({
      ...emptyValues,
      projectId: firstProject?.id ?? '',
      currency: firstProject?.currency ?? 'BRL',
    });
  }, [initialValues, projects]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;

    if (name === 'amount') {
      setField('amount', value);
      return;
    }

    if (name === 'dueDate') {
      setField('dueDate', value);
      return;
    }

    if (name === 'paidAt') {
      setField('paidAt', value || null);
      return;
    }

    if (name === 'notes') {
      setField('notes', value);
      return;
    }

  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.projectId) {
      notify({
        tone: 'warning',
        title: t('forms.payment_error_project_required'),
      });
      return;
    }

    const amount = Number(values.amount);

    if (!values.amount.trim() || Number.isNaN(amount) || amount <= 0) {
      notify({
        tone: 'warning',
        title: t('forms.payment_error_amount_required'),
      });
      return;
    }

    if (selectedProject && amount > selectedProject.value) {
      notify({
        tone: 'warning',
        title: t('forms.payment_error_amount_exceeds_project', {
          max: formatCurrencyCode(selectedProject.value, selectedProject.currency),
        }),
      });
      return;
    }

    if (!values.dueDate) {
      notify({
        tone: 'warning',
        title: t('forms.payment_error_due_date_required'),
      });
      return;
    }

    if (values.status === 'paid' && !values.paidAt) {
      notify({
        tone: 'warning',
        title: t('forms.payment_error_paid_at_required'),
      });
      return;
    }

    await onSubmit({
      ...values,
      amount,
      paidAt: values.status === 'paid' ? values.paidAt : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        {t('forms.payment_project_label')}
        <SelectField
          name="projectId"
          value={values.projectId}
          onChange={(nextValue) => {
            const selectedProject = projects.find((p) => p.id === nextValue)
            setValues((prev) => ({
              ...prev,
              projectId: nextValue,
              currency: selectedProject?.currency ?? prev.currency,
            }))
          }}
          buttonClassName="bg-white text-slate-900"
          options={[
            { value: '', label: t('forms.payment_project_placeholder') },
            ...projects.map((project) => ({
              value: project.id,
              label: project.name,
            })),
          ]}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          {t('forms.payment_amount_label')}
          <input
            type="number"
            name="amount"
            min="0"
            max={selectedProject?.value}
            step="0.01"
            value={values.amount}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            placeholder={t('forms.payment_amount_placeholder')}
          />
          {selectedProject && (
            <span className="text-xs text-slate-400">
              {t('forms.payment_amount_hint', {
                max: formatCurrencyCode(selectedProject.value, selectedProject.currency),
              })}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          {t('forms.payment_due_date_label')}
          <input
            type="date"
            name="dueDate"
            value={values.dueDate}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          {t('forms.payment_status_label')}
          <SelectField
            name="status"
            value={values.status}
            onChange={(nextValue) => {
              if (!isPersistedPaymentStatus(nextValue)) return
              setValues((prev) => ({
                ...prev,
                status: nextValue,
                paidAt: nextValue === 'paid' ? prev.paidAt || formatDateInputValue() : null,
              }))
            }}
            buttonClassName="bg-white text-slate-900"
            options={[
              { value: 'pending', label: t(paymentStatusLabel.pending) },
              { value: 'paid', label: t(paymentStatusLabel.paid) },
            ]}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          {t('forms.payment_method_label')}
          <SelectField
            name="method"
            value={values.method}
            onChange={(nextValue) => {
              if (isPaymentMethod(nextValue)) setField('method', nextValue)
            }}
            buttonClassName="bg-white text-slate-900"
            options={paymentMethods.map((method) => ({
              value: method,
              label:
                method === 'pix'
                  ? t('forms.payment_method_pix')
                  : method === 'card'
                    ? t('forms.payment_method_card')
                    : method === 'bank_transfer'
                      ? t('forms.payment_method_bank_transfer')
                      : t('forms.payment_method_cash'),
            }))}
          />
        </label>
      </div>

      {values.status === 'paid' ? (
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          {t('forms.payment_paid_at_label')}
          <input
            type="date"
            name="paidAt"
            value={values.paidAt ?? ''}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          />
        </label>
      ) : null}

      <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
        {t('forms.payment_notes_label')}
        <textarea
          name="notes"
          value={values.notes}
          onChange={handleChange}
          rows={4}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          placeholder={t('forms.payment_notes_placeholder')}
        />
      </label>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {t('common.cancel')}
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
        >
          {isSubmitting ? t('common.saving') : t('forms.payment_submit')}
        </button>
      </div>
    </form>
  );
}
