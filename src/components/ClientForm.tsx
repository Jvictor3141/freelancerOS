import { useEffect, useState } from 'react';
import type { Client } from '../types/client';

type ClientFormValues = Omit<Client, 'id' | 'createdAt'>;

type ClientFormProps = {
  initialValues?: Client | null;
  onSubmit: (values: ClientFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

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
  const [values, setValues] = useState<ClientFormValues>(emptyValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        name: initialValues.name,
        company: initialValues.company,
        email: initialValues.email,
        phone: initialValues.phone,
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.name.trim() || !values.email.trim()) {
      alert('Nome e e-mail são obrigatórios.');
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
          Nome
        </span>
        <input
          name="name"
          value={values.name}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder="Ex.: João Silva"
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Empresa
        </span>
        <input
          name="company"
          value={values.company}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder="Ex.: Studio Bloom"
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Email
        </span>
        <input
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder="Ex.: joao@email.com"
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Telefone
        </span>
        <input
          name="phone"
          value={values.phone}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder="Ex.: (83) 99999-9999"
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Notas
        </span>
        <textarea
          name="notes"
          value={values.notes}
          onChange={handleChange}
          className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder="Observações sobre esse cliente..."
        />
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
          {isSubmitting ? 'Salvando...' : 'Salvar cliente'}
        </button>
      </div>
    </form>
  );
}
