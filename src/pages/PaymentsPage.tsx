import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../components/Modal';
import { PaymentForm } from '../components/PaymentForm';
import type { PaymentInput } from '../lib/database';
import { getErrorMessage } from '../lib/supabase';
import { useClientStore } from '../store/useClientStore';
import { usePaymentStore } from '../store/usePaymentStore';
import { useProjectStore } from '../store/useProjectStore';
import type { Payment } from '../types/payment';
import {
  paymentStatusClassName,
  paymentStatusLabel,
} from '../utils/paymentStatus';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const combinedError = paymentError ?? projectError ?? clientError;

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

  // O submit aguarda a resposta do banco para manter o modal coerente com a persistencia remota.
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
    <div className="space-y-6">
      {combinedError ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {combinedError}
        </section>
      ) : null}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Financeiro</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Controle de pagamentos
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Aqui o sistema comeca a resolver a dor mais seria do freelancer:
              saber quem pagou, quem nao pagou e o que venceu.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
          >
            Novo pagamento
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
          >
            <option value="all">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="paid">Pagos</option>
            <option value="overdue">Atrasados</option>
          </select>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-100">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-sm font-medium text-slate-500">
            {filteredPayments.length} pagamento(s) encontrado(s)
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Lista de pagamentos
          </h3>
        </div>

        <div className="overflow-x-auto">
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
                    <div className="flex gap-2">
                      {payment.status !== 'paid' ? (
                        <button
                          onClick={() => {
                            void handleMarkAsPaid(payment.id);
                          }}
                          className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
                        >
                          Marcar como pago
                        </button>
                      ) : null}

                      <button
                        onClick={() => {
                          selectPayment(payment);
                          setIsModalOpen(true);
                        }}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => {
                          void handlePaymentRemoval(payment);
                        }}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        Excluir
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
