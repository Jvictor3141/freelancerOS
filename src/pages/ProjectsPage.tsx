import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { ProjectForm } from '../components/ProjectForm';
import type { ProjectInput } from '../lib/database';
import { getErrorMessage } from '../lib/supabase';
import { useClientStore } from '../store/useClientStore';
import { useProjectStore } from '../store/useProjectStore';
import type { Project, ProjectStatus } from '../types/project';
import {
  projectStatusClassName,
  projectStatusLabel,
} from '../utils/projectStatus';

const statusFilterOptions: Array<ProjectStatus | 'all'> = [
  'all',
  'proposal',
  'in_progress',
  'review',
  'completed',
];

export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    clients,
    error: clientError,
    initialized: clientsInitialized,
    loadClients,
  } = useClientStore();
  const {
    projects,
    selectedProject,
    error: projectError,
    initialized: projectsInitialized,
    loadProjects,
    selectProject,
    addProject,
    editProject,
    removeProject,
  } = useProjectStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<ProjectStatus | 'all'>('all');
  const [clientFilter, setClientFilter] = useState('all');

  const combinedError = clientError ?? projectError;

  useEffect(() => {
    void loadClients();
    void loadProjects();
  }, [loadClients, loadProjects]);

  useEffect(() => {
    const shouldOpenNewModal = searchParams.get('new') === '1';

    if (!shouldOpenNewModal || clients.length === 0) {
      return;
    }

    selectProject(null);
    setIsModalOpen(true);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('new');
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams, clients, selectProject]);

  const projectsWithClient = useMemo(() => {
    return projects.map((project) => {
      const client = clients.find((item) => item.id === project.clientId);

      return {
        ...project,
        clientName: client?.name ?? 'Cliente nao encontrado',
        clientCompany: client?.company ?? '',
      };
    });
  }, [projects, clients]);

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();

    return projectsWithClient.filter((project) => {
      const matchesSearch =
        !term ||
        project.name.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term) ||
        project.clientName.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === 'all' || project.status === statusFilter;

      const matchesClient =
        clientFilter === 'all' || project.clientId === clientFilter;

      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [projectsWithClient, search, statusFilter, clientFilter]);

  function openCreateModal() {
    if (clients.length === 0) {
      alert('Cadastre pelo menos um cliente antes de criar um projeto.');
      return;
    }

    selectProject(null);
    setIsModalOpen(true);
  }

  function openEditModal(projectId: string) {
    const project = projects.find((item) => item.id === projectId) ?? null;
    selectProject(project);
    setIsModalOpen(true);
  }

  function closeModal() {
    selectProject(null);
    setIsModalOpen(false);
  }

  // O submit espera a gravacao remota antes de liberar a UI e fechar o modal.
  async function handleProjectSubmit(values: ProjectInput) {
    setIsSubmitting(true);

    try {
      if (selectedProject) {
        await editProject(selectedProject.id, values);
      } else {
        await addProject(values);
      }

      closeModal();
    } catch (submitError) {
      alert(
        getErrorMessage(submitError, 'Nao foi possivel salvar o projeto.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleProjectRemoval(project: Project) {
    const confirmed = window.confirm(
      `Deseja excluir o projeto "${project.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await removeProject(project.id);
    } catch (removeError) {
      alert(
        getErrorMessage(removeError, 'Nao foi possivel excluir o projeto.'),
      );
    }
  }

  if (!clientsInitialized || !projectsInitialized) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">Projetos</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Carregando dados do banco...
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Sincronizando clientes e projetos no Supabase.
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
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">Operacao</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Projetos vinculados a clientes reais
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Agora o sistema comeca a representar trabalho de verdade. Projeto
              sem cliente vinculado e bagunca. Cliente sem projeto e cadastro
              morto.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
          >
            Novo projeto
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <div className="grid gap-4 xl:grid-cols-4">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar projeto, descricao ou cliente"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as ProjectStatus | 'all')
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
          >
            {statusFilterOptions.map((status) => (
              <option key={status} value={status}>
                {status === 'all' ? 'Todos os status' : projectStatusLabel[status]}
              </option>
            ))}
          </select>

          <select
            value={clientFilter}
            onChange={(event) => setClientFilter(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
          >
            <option value="all">Todos os clientes</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('all');
              setClientFilter('all');
            }}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Limpar filtros
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-100">
        <div className="border-b border-slate-200 px-6 py-5">
          <p className="text-sm font-medium text-slate-500">
            {filteredProjects.length} projeto(s) encontrado(s)
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Lista de projetos
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Projeto
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Cliente
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Valor
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Prazo
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
              {filteredProjects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-slate-100 transition hover:bg-slate-50/70"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-slate-900">{project.name}</p>
                      <p className="text-xs text-slate-500">
                        {project.description || 'Sem descricao'}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div>
                      <p>{project.clientName}</p>
                      <p className="text-xs text-slate-500">
                        {project.clientCompany || '-'}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {project.value.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-700">
                    {project.deadline
                      ? new Date(project.deadline).toLocaleDateString('pt-BR')
                      : '-'}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${projectStatusClassName[project.status]}`}
                    >
                      {projectStatusLabel[project.status]}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(project.id)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Editar
                      </button>

                      <button
                        onClick={() => {
                          void handleProjectRemoval(project);
                        }}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProjects.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-slate-500"
                  >
                    Nenhum projeto encontrado.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        title={selectedProject ? 'Editar projeto' : 'Novo projeto'}
        description={
          selectedProject
            ? 'Atualize as informacoes do projeto.'
            : 'Preencha os dados para cadastrar um novo projeto.'
        }
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <ProjectForm
          clients={clients}
          initialValues={selectedProject}
          onCancel={closeModal}
          onSubmit={handleProjectSubmit}
          isSubmitting={isSubmitting}
        />
      </Modal>
    </div>
  );
}
