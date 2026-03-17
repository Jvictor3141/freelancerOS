import { useEffect, useState } from 'react';
import { useFeedback } from './FeedbackProvider';
import type { Payment } from '../types/payment';
import type { Project } from '../types/project';
import { paymentStatusLabel } from '../utils/paymentStatus';

type PaymentFormValues = Omit<Payment, 'id' | 'createdAt'>;
type PaymentFormState = Omit<PaymentFormValues, 'amount'> & {
  amount: string;
};

type PaymentFormProps = {
  projects: Project[];
  initialValues?: Payment | null;
  onSubmit: (values: PaymentFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

const emptyValues: PaymentFormState = {
  projectId: '',
  amount: '',
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
  const [values, setValues] = useState<PaymentFormState>(emptyValues);
  const { notify } = useFeedback();

  useEffect(() => {
    if (initialValues) {
      setValues({
        projectId: initialValues.projectId,
        amount: String(initialValues.amount),
        dueDate: initialValues.dueDate,
        paidAt: initialValues.paidAt,
        status: initialValues.status,
        method: initialValues.method,
        notes: initialValues.notes,
      });
      return;
    }

    setValues({
      ...emptyValues,
      projectId: projects[0]?.id ?? '',
    });
  }, [initialValues, projects]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;

    setValues((previousValues) => {
      const nextValues: PaymentFormState = {
        ...previousValues,
        [name]: value,
      } as PaymentFormState;

      if (name === 'status') {
        nextValues.paidAt =
          value === 'paid'
            ? previousValues.paidAt || new Date().toISOString().slice(0, 10)
            : null;
      }

      return nextValues;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.projectId) {
      notify({
        tone: 'warning',
        title: 'Selecione um projeto.',
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

    if (!values.dueDate) {
      notify({
        tone: 'warning',
        title: 'Informe a data de vencimento.',
      });
      return;
    }

    if (values.status === 'paid' && !values.paidAt) {
      notify({
        tone: 'warning',
        title: 'Informe a data em que o pagamento foi recebido.',
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
        Projeto
        <select
          name="projectId"
          value={values.projectId}
          onChange={handleChange}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
        >
          <option value="">Selecione um projeto</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Valor
          <input
            type="number"
            name="amount"
            min="0"
            step="0.01"
            value={values.amount}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            placeholder="0,00"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Vencimento
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
          Status
          <select
            name="status"
            value={values.status}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="pending">{paymentStatusLabel.pending}</option>
            <option value="paid">{paymentStatusLabel.paid}</option>
            <option value="overdue">{paymentStatusLabel.overdue}</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Metodo
          <select
            name="method"
            value={values.method}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          >
            <option value="pix">Pix</option>
            <option value="card">Cartao</option>
            <option value="bank_transfer">Transferencia</option>
            <option value="cash">Dinheiro</option>
          </select>
        </label>
      </div>

      {values.status === 'paid' ? (
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Pago em
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
        Observacoes
        <textarea
          name="notes"
          value={values.notes}
          onChange={handleChange}
          rows={4}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
          placeholder="Adicione observacoes sobre este pagamento"
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
          {isSubmitting ? 'Salvando...' : 'Salvar pagamento'}
        </button>
      </div>
    </form>
  );
}
