import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFeedback } from './FeedbackProvider';
import { SelectField } from './SelectField';
import type { Client } from '../types/client';
import type { Project } from '../types/project';
import type { ProjectInput } from '../types/inputs';
import { SUPPORTED_CURRENCIES } from '../i18n/config';
import { usePreferencesStore } from '../stores/usePreferencesStore';
import {
  isProjectStatus,
  projectEditableStatusOptions,
  projectStatusLabel,
} from '../utils/projectStatus';

type ProjectFormState = Omit<ProjectInput, 'value'> & {
  value: string;
};
type ProjectFormField = keyof ProjectFormState;

type ProjectFormProps = {
  clients: Client[];
  initialValues?: Project | null;
  onSubmit: (values: ProjectInput) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

const emptyValues: ProjectFormState = {
  clientId: '',
  name: '',
  description: '',
  value: '',
  currency: 'BRL',
  deadline: '',
  status: 'in_progress',
};

export function ProjectForm({
  clients,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProjectFormProps) {
  const { t } = useTranslation();
  const defaultCurrency = usePreferencesStore((s) => s.defaultCurrency);
  const [values, setValues] = useState<ProjectFormState>({
    ...emptyValues,
    currency: defaultCurrency,
  });
  const { notify } = useFeedback();
  const statusOptions = projectEditableStatusOptions;

  function setField<K extends ProjectFormField>(
    field: K,
    value: ProjectFormState[K],
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
        name: initialValues.name,
        description: initialValues.description,
        value: String(initialValues.value),
        currency: initialValues.currency,
        deadline: initialValues.deadline,
        status: initialValues.status,
      });
      return;
    }

    setValues({
      ...emptyValues,
      currency: defaultCurrency,
      clientId: clients[0]?.id ?? '',
    });
  }, [initialValues, clients, defaultCurrency]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;

    if (name === 'name') {
      setField('name', value);
      return;
    }

    if (name === 'description') {
      setField('description', value);
      return;
    }

    if (name === 'value') {
      setField('value', value);
      return;
    }

    if (name === 'deadline') {
      setField('deadline', value);
      return;
    }

  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.clientId) {
      notify({
        tone: 'warning',
        title: t('forms.project_error_client_required'),
      });
      return;
    }

    if (!values.name.trim()) {
      notify({
        tone: 'warning',
        title: t('forms.project_error_name_required'),
      });
      return;
    }

    const numericValue =
      values.value.trim() === '' ? 0 : Number(values.value);

    if (Number.isNaN(numericValue) || numericValue < 0) {
      notify({
        tone: 'warning',
        title: t('forms.project_error_value_negative'),
      });
      return;
    }

    await onSubmit({
      clientId: values.clientId,
      name: values.name.trim(),
      description: values.description.trim(),
      value: numericValue,
      currency: values.currency,
      deadline: values.deadline,
      status: values.status,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('forms.project_client_label')}
        </span>
        <SelectField
          name="clientId"
          value={values.clientId}
          onChange={(nextValue) => setField('clientId', nextValue)}
          options={[
            { value: '', label: t('forms.project_client_placeholder') },
            ...clients.map((client) => ({
              value: client.id,
              label: `${client.name}${client.company ? ` - ${client.company}` : ''}`,
            })),
          ]}
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('forms.project_name_label')}
        </span>
        <input
          name="name"
          value={values.name}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder={t('forms.project_name_placeholder')}
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('forms.project_description_label')}
        </span>
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder={t('forms.project_description_placeholder')}
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
            {t('forms.project_value_label')}
          </span>
          <input
            name="value"
            type="number"
            min="0"
            step="0.01"
            value={values.value}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
            placeholder={t('forms.project_value_placeholder')}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            {t('forms.project_deadline_label')}
          </span>
          <input
            name="deadline"
            type="date"
            value={values.deadline}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          />
        </label>
      </div>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {t('forms.project_status_label')}
        </span>
        <SelectField
          name="status"
          value={values.status}
          onChange={(nextValue) => {
            if (isProjectStatus(nextValue)) setField('status', nextValue)
          }}
          options={statusOptions.map((status) => ({
            value: status,
            label: t(projectStatusLabel[status]),
          }))}
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
          {isSubmitting ? t('common.saving') : t('forms.project_submit')}
        </button>
      </div>
    </form>
  );
}
