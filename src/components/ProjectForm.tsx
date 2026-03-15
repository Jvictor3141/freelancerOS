import { useEffect, useState } from 'react';
import type { Client } from '../types/client';
import type { Project, ProjectStatus } from '../types/project';
import { projectStatusLabel } from '../utils/projectStatus';

type ProjectFormValues = Omit<Project, 'id' | 'createdAt'>;

type ProjectFormProps = {
  clients: Client[];
  initialValues?: Project | null;
  onSubmit: (values: ProjectFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

const emptyValues: ProjectFormValues = {
  clientId: '',
  name: '',
  description: '',
  value: 0,
  deadline: '',
  status: 'proposal',
};

const statusOptions: ProjectStatus[] = [
  'proposal',
  'in_progress',
  'review',
  'completed',
];

export function ProjectForm({
  clients,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProjectFormProps) {
  const [values, setValues] = useState<ProjectFormValues>(emptyValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        clientId: initialValues.clientId,
        name: initialValues.name,
        description: initialValues.description,
        value: initialValues.value,
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

    setValues((previousValues) => ({
      ...previousValues,
      [name]: name === 'value' ? Number(value) : value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.clientId) {
      alert('Selecione um cliente.');
      return;
    }

    if (!values.name.trim()) {
      alert('O nome do projeto e obrigatorio.');
      return;
    }

    if (values.value < 0) {
      alert('O valor do projeto nao pode ser negativo.');
      return;
    }

    await onSubmit({
      clientId: values.clientId,
      name: values.name.trim(),
      description: values.description.trim(),
      value: Number(values.value),
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
