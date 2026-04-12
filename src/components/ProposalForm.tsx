import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFeedback } from './FeedbackProvider';
import { SelectField } from './SelectField';
import type { ProposalInput } from '../types/inputs';
import type { Client } from '../types/client';
import type { Proposal } from '../types/proposal';
import { SUPPORTED_CURRENCIES } from '../i18n/config';
import { usePreferencesStore } from '../stores/usePreferencesStore';
import { isValidEmailAddress } from '../utils/email';

type ProposalFormProps = {
  clients: Client[];
  initialValues?: Proposal | null;
  onSubmit: (values: ProposalInput) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

type ProposalFormValues = Omit<ProposalInput, 'amount' | 'deliveryDays'> & {
  amount: string;
  deliveryDays: string;
};
type ProposalFormField = keyof ProposalFormValues;

const emptyValues: ProposalFormValues = {
  clientId: '',
  title: '',
  description: '',
  amount: '',
  currency: 'BRL',
  deliveryDays: '7',
  recipientEmail: '',
  status: 'draft',
  notes: '',
};

export function ProposalForm({
  clients,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProposalFormProps) {
  const { t } = useTranslation();
  const defaultCurrency = usePreferencesStore((s) => s.defaultCurrency);
  const [values, setValues] = useState<ProposalFormValues>({
    ...emptyValues,
    currency: defaultCurrency,
  });
  const { notify } = useFeedback();

  function setField<K extends ProposalFormField>(
    field: K,
    value: ProposalFormValues[K],
  ) {
    setValues((previousValues) => ({
      ...previousValues,
      [field]: value,
    }));
  }

  useEffect(() => {
    if (initialValues) {
      setValues({
        clientId: initialValues.clientId,
        title: initialValues.title,
        description: initialValues.description,
        amount: String(initialValues.amount),
        currency: initialValues.currency,
        deliveryDays: String(initialValues.deliveryDays),
        recipientEmail: initialValues.recipientEmail,
        status: 'draft',
        notes: initialValues.notes,
      });
      return;
    }

    const firstClient = clients[0];
    setValues({
      ...emptyValues,
      currency: defaultCurrency,
      clientId: firstClient?.id ?? '',
      recipientEmail: firstClient?.email ?? '',
    });
  }, [initialValues, clients, defaultCurrency]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;

    if (name === 'title') {
      setField('title', value);
      return;
    }

    if (name === 'description') {
      setField('description', value);
      return;
    }

    if (name === 'amount') {
      setField('amount', value);
      return;
    }

    if (name === 'deliveryDays') {
      setField('deliveryDays', value);
      return;
    }

    if (name === 'recipientEmail') {
      setField('recipientEmail', value);
      return;
    }

    if (name === 'notes') {
      setField('notes', value);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.clientId) {
      notify({
        tone: 'warning',
        title: t('forms.proposal_error_client_required'),
      });
      return;
    }

    if (!values.title.trim()) {
      notify({
        tone: 'warning',
        title: t('forms.proposal_error_title_required'),
      });
      return;
    }

    const amount = Number(values.amount);

    if (!values.amount.trim() || Number.isNaN(amount) || amount <= 0) {
      notify({
        tone: 'warning',
        title: t('forms.proposal_error_amount_required'),
      });
      return;
    }

    const deliveryDays = Number(values.deliveryDays);

    if (
      !values.deliveryDays.trim() ||
      Number.isNaN(deliveryDays) ||
      deliveryDays <= 0
    ) {
      notify({
        tone: 'warning',
        title: t('forms.proposal_error_delivery_days_required'),
      });
      return;
    }

    if (!values.recipientEmail.trim()) {
      notify({
        tone: 'warning',
        title: t('forms.proposal_error_email_required'),
      });
      return;
    }

    if (!isValidEmailAddress(values.recipientEmail)) {
      notify({
        tone: 'warning',
        title: t('forms.proposal_error_invalid_email'),
      });
      return;
    }

    await onSubmit({
      clientId: values.clientId,
      title: values.title.trim(),
      description: values.description.trim(),
      amount,
      currency: values.currency,
      deliveryDays,
      recipientEmail: values.recipientEmail.trim(),
      status: 'draft',
      notes: values.notes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('forms.proposal_client_label')}
        </span>
        <SelectField
          name="clientId"
          value={values.clientId}
          onChange={(nextValue) => {
            const selectedClient = clients.find((client) => client.id === nextValue)
            setValues((prev) => ({
              ...prev,
              clientId: nextValue,
              recipientEmail: selectedClient?.email ?? prev.recipientEmail,
            }))
          }}
          options={[
            { value: '', label: t('forms.proposal_client_placeholder') },
            ...clients.map((client) => ({
              value: client.id,
              label: `${client.name}${client.company ? ` - ${client.company}` : ''}`,
            })),
          ]}
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('forms.proposal_title_label')}
        </span>
        <input
          name="title"
          value={values.title}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder={t('forms.proposal_title_placeholder')}
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('forms.currency_label')}
        </span>
        <SelectField
          name="currency"
          value={values.currency}
          onChange={(nextValue) => {
            if (SUPPORTED_CURRENCIES.includes(nextValue as typeof SUPPORTED_CURRENCIES[number])) {
              setField('currency', nextValue as typeof values.currency)
            }
          }}
          options={SUPPORTED_CURRENCIES.map((code) => ({
            value: code,
            label: t(`forms.currency_${code.toLowerCase()}`),
          }))}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            {t('forms.proposal_amount_label')}
          </span>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={values.amount}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
            placeholder={t('forms.proposal_amount_placeholder')}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            {t('forms.proposal_delivery_days_label')}
          </span>
          <input
            name="deliveryDays"
            type="number"
            min="1"
            step="1"
            value={values.deliveryDays}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          />
        </label>
      </div>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('forms.proposal_recipient_email_label')}
        </span>
        <input
          name="recipientEmail"
          type="email"
          value={values.recipientEmail}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder={t('forms.proposal_recipient_email_placeholder')}
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('forms.proposal_description_label')}
        </span>
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder={t('forms.proposal_description_placeholder')}
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('forms.proposal_notes_label')}
        </span>
        <textarea
          name="notes"
          value={values.notes}
          onChange={handleChange}
          className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder={t('forms.proposal_notes_placeholder')}
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
          {isSubmitting ? t('common.saving') : t('forms.proposal_submit')}
        </button>
      </div>
    </form>
  );
}
