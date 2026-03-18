import { useEffect, useState } from 'react';
import { useFeedback } from './FeedbackProvider';
import type { ProposalInput } from '../types/inputs';
import type { Client } from '../types/client';
import type { Proposal } from '../types/proposal';

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
  const [values, setValues] = useState<ProposalFormValues>(emptyValues);
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
      clientId: firstClient?.id ?? '',
      recipientEmail: firstClient?.email ?? '',
    });
  }, [initialValues, clients]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    if (name === 'clientId') {
      const selectedClient = clients.find((client) => client.id === value);

      setValues((previousValues) => ({
        ...previousValues,
        clientId: value,
        recipientEmail: selectedClient?.email ?? previousValues.recipientEmail,
      }));
      return;
    }

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
        title: 'Selecione um cliente.',
      });
      return;
    }

    if (!values.title.trim()) {
      notify({
        tone: 'warning',
        title: 'Informe o titulo da proposta.',
      });
      return;
    }

    const amount = Number(values.amount);

    if (!values.amount.trim() || Number.isNaN(amount) || amount <= 0) {
      notify({
        tone: 'warning',
        title: 'Informe um valor maior que zero.',
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
        title: 'Informe um prazo valido em dias.',
      });
      return;
    }

    if (!values.recipientEmail.trim()) {
      notify({
        tone: 'warning',
        title: 'Informe o email de envio.',
      });
      return;
    }

    await onSubmit({
      clientId: values.clientId,
      title: values.title.trim(),
      description: values.description.trim(),
      amount,
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
          Titulo da proposta
        </span>
        <input
          name="title"
          value={values.title}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder="Ex.: Redesign do site institucional"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Valor
          </span>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            value={values.amount}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
            placeholder="0,00"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Prazo estimado em dias
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
          E-mail do destinatario
        </span>
        <input
          name="recipientEmail"
          type="email"
          value={values.recipientEmail}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder="contato@cliente.com"
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Escopo
        </span>
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          className="min-h-32 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder="Descreva entregaveis, revisoes, etapas e limites da proposta..."
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Observacoes internas
        </span>
        <textarea
          name="notes"
          value={values.notes}
          onChange={handleChange}
          className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder="Contexto comercial, margem, pontos para negociar..."
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
          {isSubmitting ? 'Salvando...' : 'Salvar proposta'}
        </button>
      </div>
    </form>
  );
}
