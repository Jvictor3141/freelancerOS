import React, { useEffect, useState } from 'react';
import type { Project } from '../types/project';
import type { Payment } from '../types/payment';
import { paymentStatusLabel } from '../utils/paymentStatus';

type PaymentFormValues = Omit<Payment, 'id' | 'createdAt'>;

type PaymentFormProps = {
  projects: Project[];
  initialValues?: Payment | null;
  onSubmit: (values: PaymentFormValues) => void;
  onCancel: () => void;
};

const emptyValues: PaymentFormValues = {
  projectId: '',
  amount: 0,
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
}: PaymentFormProps) {
  const [values, setValues] = useState<PaymentFormValues>(emptyValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        projectId: initialValues.projectId,
        amount: initialValues.amount,
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
    >
  ) {
    const { name, value } = event.target;

    setValues((prev) => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.projectId) {
      alert('Selecione um projeto.');
      return;
    }

    if (values.amount <= 0) {
      alert('Informe um valor maior que zero.');
      return;
    }

    if (!values.dueDate) {
      alert('Informe a data de vencimento.');
      return;
    }

    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Projeto
        </span>
        <select
          name="projectId"
          value={values.projectId}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
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
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Vencimento
          </span>
          <input
            name="dueDate"
            type="date"
            value={values.dueDate}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
            <option value="pending">{paymentStatusLabel.pending}</option>
            <option value="paid">{paymentStatusLabel.paid}</option>
            <option value="overdue">{paymentStatusLabel.overdue}</option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Método
          </span>
          <select
            name="method"
            value={values.method}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          >
            <option value="pix">Pix</option>
            <option value="card">Cartão</option>
            <option value="bank_transfer">Transferência</option>
            <option value="cash">Dinheiro</option>
          </select>
        </label>
      </div>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Observações
        </span>
        <textarea
          name="notes"
          value={values.notes}
          onChange={handleChange}
          className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder="Observações do pagamento..."
        />
      </label>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
        >
          Salvar pagamento
        </button>
      </div>
    </form>
  );
}