import { useEffect, useState } from 'react'
import { useFeedback } from '../../components/FeedbackProvider'
import { useFilterModal } from '../../lib/useFilterModal'
import { getErrorMessage } from '../../lib/supabase'
import { useAlert } from '../../lib/useAlert'
import { useRemovalHandler } from '../../lib/useRemovalHandler'
import { useSubmitHandler } from '../../lib/useSubmitHandler'
import { useAuthStore } from '../../stores/useAuthStore'
import { useClientStore } from '../../stores/useClientStore'
import { useProposalStore } from '../../stores/useProposalStore'
import {
  hasResourceLoadError,
  isResourcePending,
} from '../../stores/resourceLoadState'
import type { ProposalSecureShareLink } from '../../types/sharedProposal'
import type { ProposalWithClient } from '../../types/viewModels'
import { getFreelancerProfileFromUser } from '../../utils/freelancerProfile'
import { buildMailtoLink, buildProposalEmail } from '../../utils/proposalEmail'
import type { ProposalStatusFilter } from '../../utils/proposalStatus'
import {
  buildClientResponseNotificationId,
  getClientResponseNotifications,
  getFilteredProposals,
  getProposalMetrics,
  getProposalsWithClient,
  getVisibleClientResponseNotifications,
  readDismissedClientResponseNotificationIds,
  writeDismissedClientResponseNotificationIds,
} from './proposalsView'

export function useProposalsPage() {
  const user = useAuthStore((state) => state.user)

  const clients = useClientStore((state) => state.clients)
  const clientError = useClientStore((state) => state.error)
  const clientsLoadStatus = useClientStore((state) => state.loadStatus)
  const ensureClientsLoaded = useClientStore(
    (state) => state.ensureClientsLoaded,
  )
  const retryClientsLoad = useClientStore((state) => state.retryLoad)

  const proposals = useProposalStore((state) => state.proposals)
  const selectedProposal = useProposalStore((state) => state.selectedProposal)
  const proposalError = useProposalStore((state) => state.error)
  const proposalsLoadStatus = useProposalStore((state) => state.loadStatus)
  const ensureProposalsLoaded = useProposalStore(
    (state) => state.ensureProposalsLoaded,
  )
  const retryProposalsLoad = useProposalStore((state) => state.retryLoad)
  const selectProposal = useProposalStore((state) => state.selectProposal)
  const addProposal = useProposalStore((state) => state.addProposal)
  const editProposal = useProposalStore((state) => state.editProposal)
  const removeProposal = useProposalStore((state) => state.removeProposal)
  const sendProposalToClient = useProposalStore(
    (state) => state.sendProposalToClient,
  )
  const generateSecureShareLink = useProposalStore(
    (state) => state.generateSecureShareLink,
  )
  const acceptProposalAndGenerateProject = useProposalStore(
    (state) => state.acceptProposalAndGenerateProject,
  )
  const rejectProposalById = useProposalStore(
    (state) => state.rejectProposalById,
  )
  const reopenProposalById = useProposalStore(
    (state) => state.reopenProposalById,
  )

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false)
  const [shareTargetProposal, setShareTargetProposal] =
    useState<ProposalWithClient | null>(null)
  const [shareExpiresInDays, setShareExpiresInDays] = useState(7)
  const [generatedShareLink, setGeneratedShareLink] =
    useState<ProposalSecureShareLink | null>(null)
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const statusFilterModal = useFilterModal<ProposalStatusFilter>('all')
  const [
    dismissedClientResponseNotificationIds,
    setDismissedClientResponseNotificationIds,
  ] = useState<string[]>([])
  const { confirm } = useFeedback()
  const { alert } = useAlert()
  const handleProposalRemoval = useRemovalHandler<ProposalWithClient>({
    confirmLabel: 'Excluir proposta',
    description: (proposal) => `Deseja excluir a proposta "${proposal.title}"?`,
    remove: removeProposal,
    successMessage: 'Proposta excluida com sucesso.',
    errorMessage: 'Não foi possível excluir a proposta.',
  })
  const { isSubmitting, handleSubmit: handleProposalSubmit } = useSubmitHandler({
    selected: selectedProposal,
    add: addProposal,
    edit: editProposal,
    onSuccess: closeModal,
    createdMessage: 'Proposta criada com sucesso.',
    updatedMessage: 'Proposta atualizada com sucesso.',
    errorMessage: 'Não foi possível salvar a proposta.',
  })

  const freelancerProfile = getFreelancerProfileFromUser(user)
  const proposalsWithClient = getProposalsWithClient(proposals, clients)
  const filteredProposals = getFilteredProposals(
    proposalsWithClient,
    search,
    statusFilterModal.value,
  )
  const clientResponseNotifications = getClientResponseNotifications(
    proposalsWithClient,
  )
  const visibleClientResponseNotifications =
    getVisibleClientResponseNotifications(
      clientResponseNotifications,
      dismissedClientResponseNotificationIds,
    )

  useEffect(() => {
    void Promise.all([ensureClientsLoaded(), ensureProposalsLoaded()])
  }, [ensureClientsLoaded, ensureProposalsLoaded])

  useEffect(() => {
    setDismissedClientResponseNotificationIds(
      readDismissedClientResponseNotificationIds(user?.id ?? null),
    )
  }, [user?.id])

  function openCreateModal() {
    if (clients.length === 0) {
      alert('Cadastre pelo menos um cliente antes de criar uma proposta.')
      return
    }

    selectProposal(null)
    setIsModalOpen(true)
  }

  function openEditModal(proposal: ProposalWithClient) {
    selectProposal(proposal)
    setIsModalOpen(true)
  }

  function closeModal() {
    selectProposal(null)
    setIsModalOpen(false)
  }

  function openShareModal(proposal: ProposalWithClient) {
    setShareTargetProposal(proposal)
    setShareExpiresInDays(7)
    setGeneratedShareLink(null)
    setShareFeedback(null)
    setIsShareModalOpen(true)
  }

  function closeShareModal() {
    setShareTargetProposal(null)
    setGeneratedShareLink(null)
    setShareFeedback(null)
    setShareExpiresInDays(7)
    setIsShareModalOpen(false)
  }

  async function handleRetryLoad() {
    await Promise.all([retryClientsLoad(), retryProposalsLoad()])
  }

  function resetAllFilters() {
    setSearch('')
    statusFilterModal.clear()
  }

  function resetGeneratedShareLink() {
    setGeneratedShareLink(null)
    setShareFeedback(null)
  }

  function handleDismissClientResponseNotification(proposal: ProposalWithClient) {
    const notificationId = buildClientResponseNotificationId(proposal)

    setDismissedClientResponseNotificationIds((currentNotificationIds) => {
      if (currentNotificationIds.includes(notificationId)) {
        return currentNotificationIds
      }

      const nextNotificationIds = [...currentNotificationIds, notificationId]
      writeDismissedClientResponseNotificationIds(user?.id ?? null, nextNotificationIds)
      return nextNotificationIds
    })
  }

  async function handleShareLinkGeneration() {
    if (!shareTargetProposal) {
      return
    }

    setIsGeneratingShareLink(true)
    setShareFeedback(null)

    try {
      const shareLink = await generateSecureShareLink(
        shareTargetProposal.id,
        shareExpiresInDays,
      )

      setGeneratedShareLink(shareLink)
    } catch (shareError) {
      alert(
        getErrorMessage(
          shareError,
          'Não foi possível gerar o link seguro da proposta.',
        ),
      )
    } finally {
      setIsGeneratingShareLink(false)
    }
  }

  async function handleCopyShareLink() {
    if (!generatedShareLink) {
      return
    }

    try {
      await navigator.clipboard.writeText(generatedShareLink.url)
      setShareFeedback('Link copiado para a área de transferência.')
    } catch {
      setShareFeedback(
        'Não foi possível copiar automaticamente. Copie o link manualmente.',
      )
    }
  }

  async function handleSendProposal(proposal: ProposalWithClient) {
    if (!proposal.recipientEmail.trim()) {
      alert('Defina um e-mail válido antes de enviar a proposta.')
      return
    }

    try {
      const updatedProposal = await sendProposalToClient(proposal.id)
      const { subject, body } = buildProposalEmail(
        updatedProposal,
        proposal.clientName || 'cliente',
        freelancerProfile,
      )

      window.location.href = buildMailtoLink(
        updatedProposal.recipientEmail,
        subject,
        body,
      )
      alert('Abrindo seu app de e-mail com a proposta preenchida.')
    } catch (sendError) {
      alert(getErrorMessage(sendError, 'Não foi possível enviar a proposta.'))
    }
  }

  async function handleAcceptProposal(proposal: ProposalWithClient) {
    const confirmed = await confirm({
      title: 'Aceitar proposta?',
      description: `Aceitar a proposta "${proposal.title}" e gerar o projeto automaticamente?`,
      confirmLabel: 'Aceitar proposta',
      cancelLabel: 'Cancelar',
      tone: 'default',
    })

    if (!confirmed) {
      return
    }

    try {
      await acceptProposalAndGenerateProject(proposal.id)
      alert('Projeto gerado automaticamente na aba Projetos.')
    } catch (acceptError) {
      alert(
        getErrorMessage(
          acceptError,
          'Não foi possível aceitar a proposta e gerar o projeto.',
        ),
      )
    }
  }

  async function handleRejectProposal(proposal: ProposalWithClient) {
    const confirmed = await confirm({
      title: 'Recusar proposta?',
      description: `Marcar a proposta "${proposal.title}" como recusada?`,
      confirmLabel: 'Recusar proposta',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    })

    if (!confirmed) {
      return
    }

    try {
      await rejectProposalById(proposal.id)
      alert('Proposta marcada como recusada.')
    } catch (rejectError) {
      alert(
        getErrorMessage(
          rejectError,
          'Não foi possível marcar a proposta como recusada.',
        ),
      )
    }
  }

  async function handleReopenProposal(proposal: ProposalWithClient) {
    try {
      await reopenProposalById(proposal.id)
      alert(`Proposta "${proposal.title}" reaberta como rascunho.`)
    } catch (reopenError) {
      alert(getErrorMessage(reopenError, 'Não foi possível reabrir a proposta.'))
    }
  }

  return {
    clients,
    combinedError: proposalError ?? clientError,
    filteredProposals,
    generatedShareLink,
    hasActiveFilters: search.trim() !== '' || statusFilterModal.value !== 'all',
    hasLoadError:
      hasResourceLoadError(clientsLoadStatus) ||
      hasResourceLoadError(proposalsLoadStatus),
    isFilterModalOpen: statusFilterModal.isOpen,
    isGeneratingShareLink,
    isLoading:
      isResourcePending(clientsLoadStatus) ||
      isResourcePending(proposalsLoadStatus),
    isModalOpen,
    isShareModalOpen,
    isSubmitting,
    metrics: getProposalMetrics(proposals),
    search,
    selectedProposal,
    shareExpiresInDays,
    shareFeedback,
    shareTargetProposal,
    statusFilter: statusFilterModal.value,
    statusFilterDraft: statusFilterModal.draft,
    visibleClientResponseNotifications,
    applyFilterModal: statusFilterModal.apply,
    clearFilterModal: statusFilterModal.clear,
    closeModal,
    closeShareModal,
    handleAcceptProposal,
    handleCopyShareLink,
    handleDismissClientResponseNotification,
    handleProposalRemoval,
    handleProposalSubmit,
    handleRejectProposal,
    handleReopenProposal,
    handleRetryLoad,
    handleSendProposal,
    handleShareLinkGeneration,
    openCreateModal,
    openEditModal,
    openFilterModal: statusFilterModal.open,
    openShareModal,
    resetAllFilters,
    resetGeneratedShareLink,
    setIsFilterModalOpen: statusFilterModal.setIsOpen,
    setSearch,
    setShareExpiresInDays,
    setStatusFilter: statusFilterModal.setValue,
    setStatusFilterDraft: statusFilterModal.setDraft,
  }
}
