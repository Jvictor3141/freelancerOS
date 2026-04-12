import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFeedback } from './FeedbackProvider';
import type { Client } from '../types/client';
import { isValidEmailAddress } from '../utils/email';

type ClientFormValues = Omit<Client, 'id' | 'createdAt'>;

type ClientFormProps = {
  initialValues?: Client | null;
  onSubmit: (values: ClientFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

const emptyValues: ClientFormValues = {
  name: '',
  company: '',
  email: '',
  phone: '',
  notes: '',
};

export function ClientForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ClientFormProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<ClientFormValues>(emptyValues);
  const { notify } = useFeedback();

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name,
        company: initialValues.company,
        email: initialValues.email,
        phone: formatPhone(initialValues.phone),
        notes: initialValues.notes,
      });
      return;
    }

    setValues(emptyValues);
  }, [initialValues]);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setValues((previousValues) => ({
      ...previousValues,
      [name]: value,
    }));
  }

  function handlePhoneChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValues((previousValues) => ({
      ...previousValues,
      phone: formatPhone(event.target.value),
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.name.trim() || !values.email.trim()) {
      notify({
        tone: 'warning',
        title: t('forms.client_error_required'),
      });
      return;
    }

    if (!isValidEmailAddress(values.email)) {
      notify({
        tone: 'warning',
        title: t('forms.client_error_invalid_email'),
      });
      return;
    }

    await onSubmit({
      name: values.name.trim(),
      company: values.company.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      notes: values.notes.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('forms.client_name_label')}
        </span>
        <input
          name="name"
          value={values.name}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder={t('forms.client_name_placeholder')}
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('forms.client_company_label')}
        </span>
        <input
          name="company"
          value={values.company}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder={t('forms.client_company_placeholder')}
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('forms.client_email_label')}
        </span>
        <input
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder={t('forms.client_email_placeholder')}
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('forms.client_phone_label')}
        </span>
        <input
          name="phone"
          value={values.phone}
          onChange={handlePhoneChange}
          maxLength={15}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder={t('forms.client_phone_placeholder')}
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('forms.client_notes_label')}
        </span>
        <textarea
          name="notes"
          value={values.notes}
          onChange={handleChange}
          className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder={t('forms.client_notes_placeholder')}
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
          {isSubmitting ? t('common.saving') : t('forms.client_submit')}
        </button>
      </div>
    </form>
  );
}
