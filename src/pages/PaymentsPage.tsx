import { CheckCheck, ListFilter, PencilLine, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../components/Modal';
import { PaymentForm } from '../components/PaymentForm';
import type { PaymentInput } from '../lib/database';
import { getErrorMessage } from '../lib/supabase';
import { useClientStore } from '../store/useClientStore';
import { usePaymentStore } from '../store/usePaymentStore';
import { useProjectStore } from '../store/useProjectStore';
import type { Payment, PaymentStatus } from '../types/payment';
import {
  paymentStatusClassName,
  paymentStatusLabel,
} from '../utils/paymentStatus';

const statusFilterOptions: Array<PaymentStatus | 'all'> = [
  'all',
  'pending',
  'paid',
  'overdue',
];

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function getPaymentActionButtonClassName(
  tone: 'success' | 'neutral' | 'danger',
) {
  if (tone === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100';
  }

  if (tone === 'danger') {
    return 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100';
  }

  return 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
}

export function PaymentsPage() {
  const {
    projects,
    error: projectError,
    initialized: projectsInitialized,
    loadProjects,
  } = useProjectStore();
  const {
    clients,
    error: clientError,
    initialized: clientsInitialized,
    loadClients,
  } = useClientStore();
  const {
    payments,
    selectedPayment,
    error: paymentError,
    initialized: paymentsInitialized,
    loadPayments,
    selectPayment,
    addPayment,
    editPayment,
    removePayment,
    markAsPaid,
    markAsOverdueIfNeeded,
  } = usePaymentStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>(
    'all',
  );
  const [statusFilterDraft, setStatusFilterDraft] =
    useState<PaymentStatus | 'all'>('all');

  const combinedError = paymentError ?? projectError ?? clientError;
  const hasActiveFilters = statusFilter !== 'all';

  useEffect(() => {
    void loadClients();
    void loadProjects();
    void loadPayments();
  }, [loadClients, loadProjects, loadPayments]);

  useEffect(() => {
    if (!paymentsInitialized) {
      return;
    }

    void markAsOverdueIfNeeded();
  }, [paymentsInitialized, markAsOverdueIfNeeded]);

  const paymentsWithRelations = useMemo(() => {
    return payments.map((payment) => {
      const project = projects.find((item) => item.id === payment.projectId);
      const client = clients.find((item) => item.id === project?.clientId);

      return {
        ...payment,
        projectName: project?.name ?? 'Projeto nao encontrado',
        clientName: client?.name ?? 'Cliente nao encontrado',
      };
    });
  }, [payments, projects, clients]);

  const filteredPayments = useMemo(() => {
    if (statusFilter === 'all') {
      return paymentsWithRelations;
    }

    return paymentsWithRelations.filter(
      (payment) => payment.status === statusFilter,
    );
  }, [paymentsWithRelations, statusFilter]);

  function openCreateModal() {
    if (projects.length === 0) {
      alert('Cadastre pelo menos um projeto antes de criar um pagamento.');
      return;
    }

    selectPayment(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    selectPayment(null);
    setIsModalOpen(false);
  }

  function openFilterModal() {
    setStatusFilterDraft(statusFilter);
    setIsFilterModalOpen(true);
  }

  function applyFilterModal() {
    setStatusFilter(statusFilterDraft);
    setIsFilterModalOpen(false);
  }

  function clearFilterModal() {
    setStatusFilterDraft('all');
    setStatusFilter('all');
  }

  async function handlePaymentSubmit(values: PaymentInput) {
    setIsSubmitting(true);

    try {
      if (selectedPayment) {
        await editPayment(selectedPayment.id, values);
      } else {
        await addPayment(values);
      }

      closeModal();
    } catch (submitError) {
      alert(
        getErrorMessage(submitError, 'Nao foi possivel salvar o pagamento.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePaymentRemoval(payment: Payment) {
    const confirmed = window.confirm('Deseja excluir este pagamento?');

    if (!confirmed) {
      return;
    }

    try {
      await removePayment(payment.id);
    } catch (removeError) {
      alert(
        getErrorMessage(removeError, 'Nao foi possivel excluir o pagamento.'),
      );
    }
  }

  async function handleMarkAsPaid(paymentId: string) {
    try {
      await markAsPaid(paymentId);
    } catch (markError) {
      alert(
        getErrorMessage(
          markError,
          'Nao foi possivel marcar o pagamento como pago.',
        ),
      );
    }
  }

  if (!clientsInitialized || !projectsInitialized || !paymentsInitialized) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">Pagamentos</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Carregando dados do banco...
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Sincronizando clientes, projetos e pagamentos no Supabase.
        </p>
      </section>
    );
  }

  return (
    <div className="page-stack space-y-6">
      {combinedError ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {combinedError}
        </section>
      ) : null}

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4 max-[425px]:items-center">
            <div className="min-w-0 flex-1">
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                Lista de pagamentos
              </h3>
              <p className="text-sm font-medium text-slate-500">
                {filteredPayments.length} pagamento(s) encontrado(s)
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as PaymentStatus | 'all')
                }
                className="w-44 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff] sm:w-52 md:w-56 max-[425px]:hidden"
              >
                {statusFilterOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'all'
                      ? 'Todos os status'
                      : paymentStatusLabel[status]}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={openFilterModal}
                aria-label="Abrir filtros"
                title="Abrir filtros"
                className={`relative hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-white text-slate-700 transition hover:bg-slate-50 max-[425px]:flex ${
                  hasActiveFilters
                    ? 'border-[#635bff] text-[#635bff]'
                    : 'border-slate-200'
                }`}
              >
                <ListFilter size={18} />
                {hasActiveFilters ? (
                  <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#635bff]" />
                ) : null}
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                aria-label="Novo pagamento"
                title="Novo pagamento"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#635bff] text-2xl font-semibold leading-none text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 lg:hidden">
          {filteredPayments.length > 0 ? (
            filteredPayments.map((payment) => (
              <article key={payment.id} className="space-y-4 px-5 py-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">
                      {payment.clientName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {payment.projectName}
                    </p>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClassName[payment.status]}`}
                  >
                    {paymentStatusLabel[payment.status]}
                  </span>
                </div>

                <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                  <p>
                    <span className="font-medium text-slate-900">Valor:</span>{' '}
                    {formatCurrency(payment.amount)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">
                      Vencimento:
                    </span>{' '}
                    {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="inline-flex max-w-full flex-nowrap items-center gap-2">
                  {payment.status !== 'paid' ? (
                    <button
                      type="button"
                      onClick={() => {
                        void handleMarkAsPaid(payment.id);
                      }}
                      aria-label={`Marcar pagamento de ${payment.clientName} como pago`}
                      title="Marcar como pago"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 ${getPaymentActionButtonClassName('success')}`}
                    >
                      <CheckCheck size={15} />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => {
                      selectPayment(payment);
                      setIsModalOpen(true);
                    }}
                    aria-label={`Editar pagamento de ${payment.clientName}`}
                    title="Editar pagamento"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 ${getPaymentActionButtonClassName('neutral')}`}
                  >
                    <PencilLine size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      void handlePaymentRemoval(payment);
                    }}
                    aria-label={`Excluir pagamento de ${payment.clientName}`}
                    title="Excluir pagamento"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 ${getPaymentActionButtonClassName('danger')}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              Nenhum pagamento encontrado.
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Projeto
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Valor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Vencimento
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Acoes
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50/70"
                >
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {payment.clientName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {payment.projectName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClassName[payment.status]}`}
                    >
                      {paymentStatusLabel[payment.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {payment.status !== 'paid' ? (
                        <button
                          type="button"
                          onClick={() => {
                            void handleMarkAsPaid(payment.id);
                          }}
                          aria-label={`Marcar pagamento de ${payment.clientName} como pago`}
                          title="Marcar como pago"
                          className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${getPaymentActionButtonClassName('success')}`}
                        >
                          <CheckCheck size={18} />
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => {
                          selectPayment(payment);
                          setIsModalOpen(true);
                        }}
                        aria-label={`Editar pagamento de ${payment.clientName}`}
                        title="Editar pagamento"
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${getPaymentActionButtonClassName('neutral')}`}
                      >
                        <PencilLine size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          void handlePaymentRemoval(payment);
                        }}
                        aria-label={`Excluir pagamento de ${payment.clientName}`}
                        title="Excluir pagamento"
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${getPaymentActionButtonClassName('danger')}`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    Nenhum pagamento encontrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        title="Filtrar pagamentos"
        description="Escolha o status para refinar a lista e aplique quando terminar."
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      >
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Status
            </span>
            <select
              value={statusFilterDraft}
              onChange={(event) =>
                setStatusFilterDraft(
                  event.target.value as PaymentStatus | 'all',
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
            >
              {statusFilterOptions.map((status) => (
                <option key={status} value={status}>
                  {status === 'all'
                    ? 'Todos os status'
                    : paymentStatusLabel[status]}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={clearFilterModal}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Limpar filtros
            </button>

            <button
              type="button"
              onClick={applyFilterModal}
              className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        title={selectedPayment ? 'Editar pagamento' : 'Novo pagamento'}
        description="Preencha os dados para registrar o pagamento."
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <PaymentForm
          projects={projects}
          initialValues={selectedPayment}
          onCancel={closeModal}
          onSubmit={handlePaymentSubmit}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
