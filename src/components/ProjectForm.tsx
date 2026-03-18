import { useEffect, useState } from 'react';
import { useFeedback } from './FeedbackProvider';
import type { Client } from '../types/client';
import type { Project } from '../types/project';
import type { ProjectInput } from '../types/inputs';
import {
  isProjectStatus,
  projectEditableStatusOptions,
  projectStatusLabel,
  proposalProjectEditableStatusOptions,
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
  const [values, setValues] = useState<ProjectFormState>(emptyValues);
  const { notify } = useFeedback();
  const statusOptions =
    initialValues?.status === 'proposal'
      ? proposalProjectEditableStatusOptions
      : projectEditableStatusOptions;

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
        deadline: initialValues.deadline,
        status: initialValues.status,
      });
      return;
    }

    setValues({
      ...emptyValues,
      clientId: clients[0]?.id ?? '',
    });
  }, [initialValues, clients]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    if (name === 'clientId') {
      setField('clientId', value);
      return;
    }

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

    if (name === 'status' && isProjectStatus(value)) {
      setField('status', value);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.clientId) {
      notify({
        tone: 'warning',
        title: 'Selecione um cliente.',
      });
      return;
    }

    if (!values.name.trim()) {
      notify({
        tone: 'warning',
        title: 'O nome do projeto e obrigatorio.',
      });
      return;
    }

    const numericValue =
      values.value.trim() === '' ? 0 : Number(values.value);

    if (Number.isNaN(numericValue) || numericValue < 0) {
      notify({
        tone: 'warning',
        title: 'O valor do projeto nao pode ser negativo.',
      });
      return;
    }

    await onSubmit({
      clientId: values.clientId,
      name: values.name.trim(),
      description: values.description.trim(),
      value: numericValue,
      deadline: values.deadline,
      status: values.status,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Cliente
        </span>
        <select
          name="clientId"
          value={values.clientId}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
        >
          <option value="">Selecione um cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
              {client.company ? ` - ${client.company}` : ''}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Nome do projeto
        </span>
        <input
          name="name"
          value={values.name}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder="Ex.: Landing page institucional"
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Descricao
        </span>
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder="Descreva o escopo do projeto..."
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Valor
          </span>
          <input
            name="value"
            type="number"
            min="0"
            step="0.01"
            value={values.value}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
            placeholder="0,00"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Prazo
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
          Status
        </span>
        <select
          name="status"
          value={values.status}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {projectStatusLabel[status]}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar projeto'}
        </button>
      </div>
    </form>
  );
}
