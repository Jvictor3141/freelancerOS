import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  ListFilter,
  Link2,
  Mail,
  PencilLine,
  Plus,
  RotateCcw,
  Send,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeedback } from '../components/FeedbackProvider';
import { Modal } from '../components/Modal';
import { ProposalForm } from '../components/ProposalForm';
import type { ProposalInput } from '../lib/database';
import { getToastToneForMessage } from '../lib/feedback';
import { getErrorMessage } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useClientStore } from '../store/useClientStore';
import { useProposalStore } from '../store/useProposalStore';
import type { ProposalSecureShareLink } from '../types/sharedProposal';
import type { Proposal, ProposalStatus } from '../types/proposal';
import { getFreelancerProfileFromUser } from '../utils/freelancerProfile';
import { buildMailtoLink, buildProposalEmail } from '../utils/proposalEmail';
import {
  proposalStatusClassName,
  proposalStatusLabel,
} from '../utils/proposalStatus';

const statusOptions: Array<ProposalStatus | 'all'> = [
  'all',
  'draft',
  'sent',
  'accepted',
  'rejected',
];

const shareExpirationOptions = [
  { value: 1, label: '1 dia' },
  { value: 3, label: '3 dias' },
  { value: 7, label: '7 dias' },
  { value: 14, label: '14 dias' },
  { value: 30, label: '30 dias' },
];

const dismissedProposalResponseNotificationsStoragePrefix =
  'dismissed-proposal-response-notifications';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(value: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString('pt-BR');
}

function formatDateTime(value: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function buildClientResponseNotificationId(
  proposal: Pick<Proposal, 'id' | 'clientRespondedAt'>,
) {
  return `${proposal.id}:${proposal.clientRespondedAt ?? 'pending'}`;
}

function getDismissedClientResponseNotificationsStorageKey(
  userId: string | null,
) {
  return `${dismissedProposalResponseNotificationsStoragePrefix}:${userId ?? 'anonymous'}`;
}

function readDismissedClientResponseNotificationIds(userId: string | null) {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(
      getDismissedClientResponseNotificationsStorageKey(userId),
    );

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(
      (value): value is string => typeof value === 'string',
    );
  } catch {
    return [];
  }
}

function writeDismissedClientResponseNotificationIds(
  userId: string | null,
  notificationIds: string[],
) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    getDismissedClientResponseNotificationsStorageKey(userId),
    JSON.stringify(notificationIds),
  );
}

function getProposalActionButtonClassName(
  tone: 'neutral' | 'info' | 'success' | 'danger',
) {
  if (tone === 'info') {
    return 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100';
  }

  if (tone === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100';
  }

  if (tone === 'danger') {
    return 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100';
  }

  return 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50';
}

export function ProposalsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    clients,
    error: clientError,
    initialized: clientsInitialized,
    loadClients,
  } = useClientStore();
  const {
    proposals,
    selectedProposal,
    error: proposalError,
    initialized: proposalsInitialized,
    loadProposals,
    selectProposal,
    addProposal,
    editProposal,
    removeProposal,
    sendProposalToClient,
    generateSecureShareLink,
    acceptProposalAndGenerateProject,
    rejectProposalById,
    reopenProposalById,
  } = useProposalStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);
  const [shareTargetProposal, setShareTargetProposal] =
    useState<Proposal | null>(null);
  const [shareExpiresInDays, setShareExpiresInDays] = useState(7);
  const [generatedShareLink, setGeneratedShareLink] =
    useState<ProposalSecureShareLink | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<ProposalStatus | 'all'>('all');
  const [statusFilterDraft, setStatusFilterDraft] =
    useState<ProposalStatus | 'all'>('all');
  const [dismissedClientResponseNotificationIds, setDismissedClientResponseNotificationIds] =
    useState<string[]>([]);
  const { confirm, notify } = useFeedback();

  const combinedError = proposalError ?? clientError;
  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'all';
  const freelancerProfile = useMemo(() => {
    return getFreelancerProfileFromUser(user);
  }, [user]);

  function alert(message: string) {
    notify({
      tone: getToastToneForMessage(message),
      title: message,
    });
  }

  useEffect(() => {
    void loadClients();
    void loadProposals();
  }, [loadClients, loadProposals]);

  useEffect(() => {
    setDismissedClientResponseNotificationIds(
      readDismissedClientResponseNotificationIds(user?.id ?? null),
    );
  }, [user?.id]);

  const proposalsWithClient = useMemo(() => {
    return proposals.map((proposal) => {
      const client = clients.find((item) => item.id === proposal.clientId);

      return {
        ...proposal,
        clientName: client?.name ?? 'Cliente não encontrado',
        clientCompany: client?.company ?? '',
      };
    });
  }, [proposals, clients]);

  const filteredProposals = useMemo(() => {
    const term = search.trim().toLowerCase();

    return proposalsWithClient.filter((proposal) => {
      const matchesSearch =
        !term ||
        proposal.title.toLowerCase().includes(term) ||
        proposal.description.toLowerCase().includes(term) ||
        proposal.clientName.toLowerCase().includes(term) ||
        proposal.recipientEmail.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === 'all' || proposal.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [proposalsWithClient, search, statusFilter]);

  const clientResponseNotifications = useMemo(() => {
    return proposalsWithClient
      .filter(
        (proposal) =>
          proposal.clientRespondedAt &&
          proposal.clientResponseChannel === 'shared_link' &&
          (proposal.status === 'accepted' || proposal.status === 'rejected'),
      )
      .sort((firstProposal, secondProposal) => {
        return (
          new Date(secondProposal.clientRespondedAt ?? 0).getTime() -
          new Date(firstProposal.clientRespondedAt ?? 0).getTime()
        );
      })
      .slice(0, 4);
  }, [proposalsWithClient]);

  const visibleClientResponseNotifications = useMemo(() => {
    const dismissedNotificationIds = new Set(
      dismissedClientResponseNotificationIds,
    );

    return clientResponseNotifications.filter((proposal) => {
      return !dismissedNotificationIds.has(
        buildClientResponseNotificationId(proposal),
      );
    });
  }, [clientResponseNotifications, dismissedClientResponseNotificationIds]);

  const metrics = useMemo(() => {
    const draftCount = proposals.filter((proposal) => proposal.status === 'draft').length;
    const sentCount = proposals.filter((proposal) => proposal.status === 'sent').length;
    const acceptedCount = proposals.filter(
      (proposal) => proposal.status === 'accepted',
    ).length;
    const openPipelineValue = proposals
      .filter(
        (proposal) =>
          proposal.status === 'draft' || proposal.status === 'sent',
      )
      .reduce((total, proposal) => total + proposal.amount, 0);

    return {
      draftCount,
      sentCount,
      acceptedCount,
      openPipelineValue,
    };
  }, [proposals]);

  function openCreateModal() {
    if (clients.length === 0) {
      alert('Cadastre pelo menos um cliente antes de criar uma proposta.');
      return;
    }

    selectProposal(null);
    setIsModalOpen(true);
  }

  function openEditModal(proposalId: string) {
    const proposal = proposals.find((item) => item.id === proposalId) ?? null;
    selectProposal(proposal);
    setIsModalOpen(true);
  }

  function closeModal() {
    selectProposal(null);
    setIsModalOpen(false);
  }

  function openShareModal(proposal: Proposal) {
    setShareTargetProposal(proposal);
    setShareExpiresInDays(7);
    setGeneratedShareLink(null);
    setShareFeedback(null);
    setIsShareModalOpen(true);
  }

  function closeShareModal() {
    setShareTargetProposal(null);
    setGeneratedShareLink(null);
    setShareFeedback(null);
    setShareExpiresInDays(7);
    setIsShareModalOpen(false);
  }

  function resetAllFilters() {
    setSearch('');
    setStatusFilter('all');
    setStatusFilterDraft('all');
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

  function handleDismissClientResponseNotification(
    proposal: Pick<Proposal, 'id' | 'clientRespondedAt'>,
  ) {
    const notificationId = buildClientResponseNotificationId(proposal);

    setDismissedClientResponseNotificationIds((currentNotificationIds) => {
      if (currentNotificationIds.includes(notificationId)) {
        return currentNotificationIds;
      }

      const nextNotificationIds = [...currentNotificationIds, notificationId];
      writeDismissedClientResponseNotificationIds(user?.id ?? null, nextNotificationIds);
      return nextNotificationIds;
    });
  }

  async function handleProposalSubmit(values: ProposalInput) {
    const isEditing = Boolean(selectedProposal);
    setIsSubmitting(true);

    try {
      if (selectedProposal) {
        await editProposal(selectedProposal.id, values);
      } else {
        await addProposal(values);
      }

      closeModal();
      alert(
        isEditing
          ? 'Proposta atualizada com sucesso.'
          : 'Proposta criada com sucesso.',
      );
    } catch (submitError) {
      alert(
        getErrorMessage(submitError, 'Não foi possível salvar a proposta.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleProposalRemoval(proposal: Proposal) {
    const confirmed = await confirm({
      title: 'Excluir proposta?',
      description: `Deseja excluir a proposta "${proposal.title}"?`,
      confirmLabel: 'Excluir proposta',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await removeProposal(proposal.id);
      alert('Proposta excluida com sucesso.');
    } catch (removeError) {
      alert(
        getErrorMessage(removeError, 'Não foi possível excluir a proposta.'),
      );
    }
  }

  async function handleShareLinkGeneration() {
    if (!shareTargetProposal) {
      return;
    }

    setIsGeneratingShareLink(true);
    setShareFeedback(null);

    try {
      const shareLink = await generateSecureShareLink(
        shareTargetProposal.id,
        shareExpiresInDays,
      );

      setGeneratedShareLink(shareLink);
    } catch (shareError) {
      alert(
        getErrorMessage(
          shareError,
          'Não foi possível gerar o link seguro da proposta.',
        ),
      );
    } finally {
      setIsGeneratingShareLink(false);
    }
  }

  async function handleCopyShareLink() {
    if (!generatedShareLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(generatedShareLink.url);
      setShareFeedback('Link copiado para a área de transferência.');
    } catch {
      setShareFeedback(
        'Não foi possível copiar automaticamente. Copie o link manualmente.',
      );
    }
  }

  async function handleSendProposal(proposal: Proposal) {
    if (!proposal.recipientEmail.trim()) {
      alert('Defina um e-mail válido antes de enviar a proposta.');
      return;
    }

    try {
      const updatedProposal = await sendProposalToClient(proposal.id);
      const clientName =
        clients.find((client) => client.id === updatedProposal.clientId)?.name ??
        'cliente';
      const { subject, body } = buildProposalEmail(
        updatedProposal,
        clientName,
        freelancerProfile,
      );

      window.location.href = buildMailtoLink(
        updatedProposal.recipientEmail,
        subject,
        body,
      );
      alert('Abrindo seu app de e-mail com a proposta preenchida.');
    } catch (sendError) {
      alert(
        getErrorMessage(sendError, 'Não foi possível enviar a proposta.'),
      );
    }
  }

  async function handleAcceptProposal(proposal: Proposal) {
    const confirmed = await confirm({
      title: 'Aceitar proposta?',
      description: `Aceitar a proposta "${proposal.title}" e gerar o projeto automaticamente?`,
      confirmLabel: 'Aceitar proposta',
      cancelLabel: 'Cancelar',
      tone: 'default',
    });

    if (!confirmed) {
      return;
    }

    try {
      await acceptProposalAndGenerateProject(proposal.id);
      alert('Projeto gerado automaticamente na aba Projetos.');
    } catch (acceptError) {
      alert(
        getErrorMessage(
          acceptError,
          'Não foi possível aceitar a proposta e gerar o projeto.',
        ),
      );
    }
  }

  async function handleRejectProposal(proposal: Proposal) {
    const confirmed = await confirm({
      title: 'Recusar proposta?',
      description: `Marcar a proposta "${proposal.title}" como recusada?`,
      confirmLabel: 'Recusar proposta',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    });

    if (!confirmed) {
      return;
    }

    try {
      await rejectProposalById(proposal.id);
      alert('Proposta marcada como recusada.');
    } catch (rejectError) {
      alert(
        getErrorMessage(
          rejectError,
          'Não foi possível marcar a proposta como recusada.',
        ),
      );
    }
  }

  async function handleReopenProposal(proposal: Proposal) {
    try {
      await reopenProposalById(proposal.id);
      alert(`Proposta "${proposal.title}" reaberta como rascunho.`);
    } catch (reopenError) {
      alert(
        getErrorMessage(
          reopenError,
          'Não foi possível reabrir a proposta.',
        ),
      );
    }
  }

  if (!clientsInitialized || !proposalsInitialized) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">Propostas</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Carregando dados do banco...
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Preparando clientes e propostas para montar o funil comercial.
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

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[28px] bg-[#635bff] p-6 text-white shadow-[0_24px_60px_rgba(99,91,255,0.28)]">
          <p className="text-sm font-medium text-indigo-100">
            Fluxo comercial
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Proposta, envio, aceite e projeto no mesmo fluxo
          </h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
              <div className="mb-3 inline-flex rounded-2xl bg-white/12 p-2">
                <PencilLine size={18} />
              </div>
              <p className="text-sm text-indigo-100">Rascunhos</p>
              <p className="mt-2 text-2xl font-semibold">
                {metrics.draftCount}
              </p>
            </div>

            <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
              <div className="mb-3 inline-flex rounded-2xl bg-white/12 p-2">
                <Send size={18} />
              </div>
              <p className="text-sm text-indigo-100">Enviadas</p>
              <p className="mt-2 text-2xl font-semibold">
                {metrics.sentCount}
              </p>
            </div>

            <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
              <div className="mb-3 inline-flex rounded-2xl bg-white/12 p-2">
                <CheckCircle2 size={18} />
              </div>
              <p className="text-sm text-indigo-100">Aceitas</p>
              <p className="mt-2 text-2xl font-semibold">
                {metrics.acceptedCount}
              </p>
            </div>

            <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
              <div className="mb-3 inline-flex rounded-2xl bg-white/12 p-2">
                <Clock3 size={18} />
              </div>
              <p className="text-sm text-indigo-100">Pipeline aberto</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatCurrency(metrics.openPipelineValue)}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
          <p className="text-sm font-medium text-slate-500">Ação rápida</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Nova proposta operacional
          </h3>

          <button
            type="button"
            onClick={openCreateModal}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
          >
            Nova proposta
            <Plus size={16} />
          </button>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Fluxo</p>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
              <li>1. Crie o rascunho com escopo, valor e prazo.</li>
              <li>2. Envie por email para o contato do cliente.</li>
              <li>3. Ao aceitar, gere o projeto automaticamente.</li>
            </ul>
          </div>
        </article>
      </section>

      {visibleClientResponseNotifications.length > 0 ? (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Respostas do cliente
              </p>
              <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                Portal compartilhado com atividade recente
              </h3>
            </div>
            <p className="text-sm text-slate-500">
              {visibleClientResponseNotifications.length} aviso(s) ativo(s)
            </p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleClientResponseNotifications.map((proposal) => (
              <article
                key={`${proposal.id}-${proposal.clientRespondedAt}`}
                className={`rounded-3xl border p-4 ${
                  proposal.status === 'accepted'
                    ? 'border-emerald-200 bg-emerald-50/70'
                    : 'border-rose-200 bg-rose-50/70'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-semibold text-slate-950">
                        {proposal.title}
                      </h4>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          proposal.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {proposal.status === 'accepted' ? 'Aceita' : 'Recusada'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {proposal.clientName}
                      {proposal.clientCompany
                        ? ` · ${proposal.clientCompany}`
                        : ''}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDismissClientResponseNotification(proposal)}
                    aria-label={`Remover aviso da proposta ${proposal.title}`}
                    title="Remover aviso"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-slate-500 transition hover:bg-white hover:text-slate-700"
                  >
                    <X size={15} />
                  </button>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Resposta em{' '}
                  <span className="font-semibold text-slate-900">
                    {formatDateTime(proposal.clientRespondedAt)}
                  </span>
                  .
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <div className="hidden gap-4 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)_minmax(0,0.75fr)]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título, cliente ou e-mail"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as ProposalStatus | 'all')
            }
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === 'all'
                  ? 'Todos os status'
                  : proposalStatusLabel[status]}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={resetAllFilters}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Limpar filtros
          </button>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por título, cliente ou e-mail"
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
          />

          <button
            type="button"
            onClick={openFilterModal}
            aria-label="Abrir filtros"
            title="Abrir filtros"
            className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-white text-slate-700 transition hover:bg-slate-50 ${
              statusFilter !== 'all'
                ? 'border-[#635bff] text-[#635bff]'
                : 'border-slate-200'
            }`}
          >
            <ListFilter size={18} />
            {statusFilter !== 'all' ? (
              <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#635bff]" />
            ) : null}
          </button>

          <button
            type="button"
            onClick={resetAllFilters}
            aria-label="Limpar filtros"
            title="Limpar filtros"
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition ${
              hasActiveFilters
                ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                : 'border-slate-200 bg-slate-100 text-slate-400'
            }`}
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100">
        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
            Propostas da operação
          </h3>
          <p className="text-sm font-medium text-slate-500">
            {filteredProposals.length} proposta(s) encontrada(s)
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredProposals.length > 0 ? (
            filteredProposals.map((proposal) => (
              <article key={proposal.id} className="space-y-4 px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <p className="text-lg font-semibold text-slate-900">
                        {proposal.title}
                      </p>
                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${proposalStatusClassName[proposal.status]}`}
                      >
                        {proposalStatusLabel[proposal.status]}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {proposal.description || 'Sem escopo detalhado.'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                    <p className="text-slate-500">Valor da proposta</p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {formatCurrency(proposal.amount)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                  <p>
                    <span className="font-medium text-slate-900">Cliente:</span>{' '}
                    {proposal.clientName}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">
                      Empresa:
                    </span>{' '}
                    {proposal.clientCompany || '-'}
                  </p>
                  <p className="break-all">
                    <span className="font-medium text-slate-900">E-mail:</span>{' '}
                    {proposal.recipientEmail}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Prazo:</span>{' '}
                    {proposal.deliveryDays} dia(s)
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">
                      Criada em:
                    </span>{' '}
                    {formatDate(proposal.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">
                      Enviada em:
                    </span>{' '}
                    {formatDate(proposal.sentAt)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">
                      Aceita em:
                    </span>{' '}
                    {formatDate(proposal.acceptedAt)}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">
                      Recusada em:
                    </span>{' '}
                    {formatDate(proposal.rejectedAt)}
                  </p>
                </div>

                {proposal.notes ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    <span className="font-medium text-slate-900">
                      Observações:
                    </span>{' '}
                    {proposal.notes}
                  </div>
                ) : null}

                {proposal.clientRespondedAt &&
                proposal.clientResponseChannel === 'shared_link' ? (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      proposal.status === 'accepted'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-rose-200 bg-rose-50 text-rose-800'
                    }`}
                  >
                    {proposal.status === 'accepted'
                      ? 'Cliente aceitou'
                      : 'Cliente recusou'}{' '}
                    essa proposta em {formatDateTime(proposal.clientRespondedAt)}.
                  </div>
                ) : null}

                <div className="inline-flex max-w-full flex-nowrap items-center gap-2">
                  {proposal.status !== 'accepted' ? (
                    <button
                      type="button"
                      onClick={() => openEditModal(proposal.id)}
                      aria-label={`Editar proposta ${proposal.title}`}
                      title="Editar proposta"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 lg:h-11 lg:w-11 lg:rounded-xl ${getProposalActionButtonClassName('neutral')}`}
                    >
                      <PencilLine size={15} className="lg:h-4.25 lg:w-4.25" />
                    </button>
                  ) : null}

                  {proposal.status !== 'accepted' ? (
                    <button
                      type="button"
                      onClick={() => openShareModal(proposal)}
                      aria-label={`Gerar link seguro da proposta ${proposal.title}`}
                      title="Gerar link seguro"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 lg:h-11 lg:w-11 lg:rounded-xl ${getProposalActionButtonClassName('info')}`}
                    >
                      <Link2 size={15} className="lg:h-4.25 lg:w-4.25" />
                    </button>
                  ) : null}

                  {(proposal.status === 'draft' || proposal.status === 'rejected') ? (
                    <button
                      type="button"
                      onClick={() => {
                        void handleSendProposal(proposal);
                      }}
                      aria-label={`Enviar proposta ${proposal.title} ao cliente`}
                      title="Enviar ao cliente"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 lg:h-11 lg:w-11 lg:rounded-xl ${getProposalActionButtonClassName('info')}`}
                    >
                      <Mail size={15} className="lg:h-4.25 lg:w-4.25" />
                    </button>
                  ) : null}

                  {proposal.status === 'sent' ? (
                    <button
                      type="button"
                      onClick={() => {
                        void handleSendProposal(proposal);
                      }}
                      aria-label={`Reenviar proposta ${proposal.title}`}
                      title="Reenviar proposta"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 lg:h-11 lg:w-11 lg:rounded-xl ${getProposalActionButtonClassName('info')}`}
                    >
                      <Send size={15} className="lg:h-4.25 lg:w-4.25" />
                    </button>
                  ) : null}

                  {(proposal.status === 'draft' || proposal.status === 'sent') ? (
                    <button
                      type="button"
                      onClick={() => {
                        void handleAcceptProposal(proposal);
                      }}
                      aria-label={`Aceitar proposta ${proposal.title} e gerar projeto`}
                      title="Aceitar e gerar projeto"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 lg:h-11 lg:w-11 lg:rounded-xl ${getProposalActionButtonClassName('success')}`}
                    >
                      <CheckCircle2 size={15} className="lg:h-4.25 lg:w-4.25" />
                    </button>
                  ) : null}

                  {(proposal.status === 'draft' || proposal.status === 'sent') ? (
                    <button
                      type="button"
                      onClick={() => {
                        void handleRejectProposal(proposal);
                      }}
                      aria-label={`Marcar proposta ${proposal.title} como recusada`}
                      title="Marcar como recusada"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 lg:h-11 lg:w-11 lg:rounded-xl ${getProposalActionButtonClassName('danger')}`}
                    >
                      <XCircle size={15} className="lg:h-4.25 lg:w-4.25" />
                    </button>
                  ) : null}

                  {proposal.status === 'rejected' ? (
                    <button
                      type="button"
                      onClick={() => {
                        void handleReopenProposal(proposal);
                      }}
                      aria-label={`Reabrir proposta ${proposal.title} como rascunho`}
                      title="Reabrir rascunho"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 lg:h-11 lg:w-11 lg:rounded-xl ${getProposalActionButtonClassName('neutral')}`}
                    >
                      <RotateCcw size={15} className="lg:h-4.25 lg:w-4.25" />
                    </button>
                  ) : null}

                  {proposal.status === 'accepted' ? (
                    <button
                      type="button"
                      onClick={() => navigate('/projetos')}
                      aria-label="Abrir projetos"
                      title="Abrir projetos"
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 lg:h-11 lg:w-11 lg:rounded-xl ${getProposalActionButtonClassName('success')}`}
                    >
                      <ArrowRight size={15} className="lg:h-4.25 lg:w-4.25" />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => {
                      void handleProposalRemoval(proposal);
                    }}
                    aria-label={`Excluir proposta ${proposal.title}`}
                    title="Excluir proposta"
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition sm:h-10 sm:w-10 lg:h-11 lg:w-11 lg:rounded-xl ${getProposalActionButtonClassName('neutral')}`}
                  >
                    <Trash2 size={15} className="lg:h-4.25 lg:w-4.25" />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="px-5 py-10 text-center text-sm text-slate-500 sm:px-6">
              Nenhuma proposta encontrada. Crie a primeira para começar o fluxo
              comercial.
            </div>
          )}
        </div>
      </section>

      <Modal
        title="Filtrar propostas"
        description="Escolha o status comercial para refinar a lista e aplique quando terminar."
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
                  event.target.value as ProposalStatus | 'all',
                )
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === 'all'
                    ? 'Todos os status'
                    : proposalStatusLabel[status]}
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
        title={selectedProposal ? 'Editar proposta' : 'Nova proposta'}
        description={
          selectedProposal
            ? 'Ajuste a proposta antes de reenviar ao cliente.'
            : 'Preencha os dados comerciais para criar uma nova proposta.'
        }
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <ProposalForm
          clients={clients}
          initialValues={selectedProposal}
          onCancel={closeModal}
          onSubmit={handleProposalSubmit}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        title="Link seguro da proposta"
        description="Gere um link protegido por token e compartilhe apenas a visualização pública dessa proposta."
        isOpen={isShareModalOpen}
        onClose={closeShareModal}
      >
        <div className="space-y-5">
          {shareTargetProposal ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">
                {shareTargetProposal.title}
              </p>
              <p className="mt-2 leading-6">
                O token aparece somente após a geração. Se você perder esse
                link, será preciso gerar um novo.
              </p>
            </div>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Expiração do link
            </span>
            <select
              value={shareExpiresInDays}
              onChange={(event) => setShareExpiresInDays(Number(event.target.value))}
              disabled={isGeneratingShareLink}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#635bff]"
            >
              {shareExpirationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {generatedShareLink ? (
            <div className="space-y-4 rounded-[26px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Link gerado com sucesso
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Expira em {formatDateTime(generatedShareLink.expiresAt)}.
                  </p>
                </div>

                <a
                  href={generatedShareLink.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm shadow-slate-100 transition hover:bg-slate-50"
                  aria-label="Abrir visualização compartilhada"
                  title="Abrir visualização compartilhada"
                >
                  <ExternalLink size={16} />
                </a>
              </div>

              <textarea
                readOnly
                value={generatedShareLink.url}
                className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none"
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    void handleCopyShareLink();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Copy size={16} />
                  Copiar link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGeneratedShareLink(null);
                    setShareFeedback(null);
                  }}
                  className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  Gerar novo link
                </button>
              </div>

              {shareFeedback ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {shareFeedback}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeShareModal}
              disabled={isGeneratingShareLink}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Fechar
            </button>

            <button
              type="button"
              onClick={() => {
                void handleShareLinkGeneration();
              }}
              disabled={isGeneratingShareLink}
              className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGeneratingShareLink ? 'Gerando...' : 'Gerar link seguro'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
