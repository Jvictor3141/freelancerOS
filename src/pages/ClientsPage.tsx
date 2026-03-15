import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClientForm } from '../components/ClientForm';
import { Modal } from '../components/Modal';
import type { ClientInput } from '../lib/database';
import { getErrorMessage } from '../lib/supabase';
import { useClientStore } from '../store/useClientStore';
import type { Client } from '../types/client';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('pt-BR');
}

export function ClientsPage() {
  const {
    clients,
    selectedClient,
    loading,
    error,
    initialized,
    loadClients,
    selectClient,
    addClient,
    editClient,
    removeClient,
  } = useClientStore();

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    void loadClients();
  }, [loadClients]);

  const filteredClients = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return clients;
    }

    return clients.filter((client) => {
      return (
        client.name.toLowerCase().includes(term) ||
        client.company.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term)
      );
    });
  }, [clients, search]);

  function openCreateModal() {
    selectClient(null);
    setIsModalOpen(true);
  }

  function openEditModal(clientId: string) {
    const client = clients.find((item) => item.id === clientId) ?? null;
    selectClient(client);
    setIsModalOpen(true);
  }

  function closeModal() {
    selectClient(null);
    setIsModalOpen(false);
  }

  async function handleClientSubmit(values: ClientInput) {
    setIsSubmitting(true);

    try {
      if (selectedClient) {
        await editClient(selectedClient.id, values);
      } else {
        await addClient(values);
      }

      closeModal();
    } catch (submitError) {
      alert(getErrorMessage(submitError, 'Nao foi possivel salvar o cliente.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleClientRemoval(client: Client) {
    const confirmed = window.confirm(
      `Deseja excluir o cliente "${client.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeClient(client.id);
    } catch (removeError) {
      alert(
        getErrorMessage(removeError, 'Nao foi possivel excluir o cliente.'),
      );
    }
  }

  if (!initialized) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">Clientes</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Carregando dados do banco...
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {loading
            ? 'Buscando a base de clientes no Supabase.'
            : 'Preparando a sincronizacao inicial.'}
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          {error}
        </section>
      ) : null}

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Base de clientes
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Gerencie seus clientes sem depender de planilha
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Centralize contato, empresa e historico para nao perder contexto
              quando o trabalho apertar.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, empresa ou email"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff] sm:min-w-72"
            />

            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
            >
              Novo cliente
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <p className="text-sm font-medium text-slate-500">
            {filteredClients.length} cliente(s) encontrado(s)
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Lista de clientes
          </h3>
        </div>

        <div className="divide-y divide-slate-100 lg:hidden">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <article key={client.id} className="space-y-4 px-5 py-5">
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-semibold text-slate-900">
                    {client.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {client.company || 'Sem empresa informada'}
                  </p>
                  <p className="break-all text-sm text-slate-600">
                    {client.email}
                  </p>
                  <p className="text-sm text-slate-600">
                    {client.phone || 'Sem telefone informado'}
                  </p>
                </div>

                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Criado em {formatDate(client.createdAt)}
                </p>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => openEditModal(client.id)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/clients/${client.id}`)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Ver detalhes
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      void handleClientRemoval(client);
                    }}
                    className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                  >
                    Excluir
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              Nenhum cliente encontrado.
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
                  Empresa
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Telefone
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Acoes
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50/70"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {client.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Criado em {formatDate(client.createdAt)}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {client.company || '-'}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {client.email}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {client.phone || '-'}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(client.id)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Ver detalhes
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          void handleClientRemoval(client);
                        }}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredClients.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        title={selectedClient ? 'Editar cliente' : 'Novo cliente'}
        description={
          selectedClient
            ? 'Atualize as informacoes do cliente.'
            : 'Preencha os dados para cadastrar um novo cliente.'
        }
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <ClientForm
          initialValues={selectedClient}
          onCancel={closeModal}
          onSubmit={handleClientSubmit}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
