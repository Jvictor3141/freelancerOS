import { useEffect, useState } from 'react'
import { useFeedback } from '../../components/FeedbackProvider'
import { getToastToneForMessage } from '../../lib/feedback'
import { getErrorMessage } from '../../lib/supabase'
import { useAuthStore } from '../../stores/useAuthStore'
import { useClientStore } from '../../stores/useClientStore'
import { useProposalStore } from '../../stores/useProposalStore'
import {
  hasResourceLoadError,
  isResourcePending,
} from '../../stores/resourceLoadState'
import type { ProposalInput } from '../../types/inputs'
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
} from '../../utils/proposalsPage'

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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false)
  const [shareTargetProposal, setShareTargetProposal] =
    useState<ProposalWithClient | null>(null)
  const [shareExpiresInDays, setShareExpiresInDays] = useState(7)
  const [generatedShareLink, setGeneratedShareLink] =
    useState<ProposalSecureShareLink | null>(null)
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProposalStatusFilter>('all')
  const [statusFilterDraft, setStatusFilterDraft] =
    useState<ProposalStatusFilter>('all')
  const [
    dismissedClientResponseNotificationIds,
    setDismissedClientResponseNotificationIds,
  ] = useState<string[]>([])
  const { confirm, notify } = useFeedback()

  const freelancerProfile = getFreelancerProfileFromUser(user)
  const proposalsWithClient = getProposalsWithClient(proposals, clients)
  const filteredProposals = getFilteredProposals(
    proposalsWithClient,
    search,
    statusFilter,
  )
  const clientResponseNotifications = getClientResponseNotifications(
    proposalsWithClient,
  )
  const visibleClientResponseNotifications =
    getVisibleClientResponseNotifications(
      clientResponseNotifications,
      dismissedClientResponseNotificationIds,
    )

  function alert(message: string) {
    notify({
      tone: getToastToneForMessage(message),
      title: message,
    })
  }

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
    setStatusFilter('all')
    setStatusFilterDraft('all')
  }

  function openFilterModal() {
    setStatusFilterDraft(statusFilter)
    setIsFilterModalOpen(true)
  }

  function applyFilterModal() {
    setStatusFilter(statusFilterDraft)
    setIsFilterModalOpen(false)
  }

  function clearFilterModal() {
    setStatusFilterDraft('all')
    setStatusFilter('all')
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

  async function handleProposalSubmit(values: ProposalInput) {
    const isEditing = Boolean(selectedProposal)
    setIsSubmitting(true)

    try {
      if (selectedProposal) {
        await editProposal(selectedProposal.id, values)
      } else {
        await addProposal(values)
      }

      closeModal()
      alert(
        isEditing
          ? 'Proposta atualizada com sucesso.'
          : 'Proposta criada com sucesso.',
      )
    } catch (submitError) {
      alert(getErrorMessage(submitError, 'NÃ£o foi possÃ­vel salvar a proposta.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleProposalRemoval(proposal: ProposalWithClient) {
    const confirmed = await confirm({
      title: 'Excluir proposta?',
      description: `Deseja excluir a proposta "${proposal.title}"?`,
      confirmLabel: 'Excluir proposta',
      cancelLabel: 'Cancelar',
      tone: 'danger',
    })

    if (!confirmed) {
      return
    }

    try {
      await removeProposal(proposal.id)
      alert('Proposta excluida com sucesso.')
    } catch (removeError) {
      alert(getErrorMessage(removeError, 'NÃ£o foi possÃ­vel excluir a proposta.'))
    }
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
          'NÃ£o foi possÃ­vel gerar o link seguro da proposta.',
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
      setShareFeedback('Link copiado para a Ã¡rea de transferÃªncia.')
    } catch {
      setShareFeedback(
        'NÃ£o foi possÃ­vel copiar automaticamente. Copie o link manualmente.',
      )
    }
  }

  async function handleSendProposal(proposal: ProposalWithClient) {
    if (!proposal.recipientEmail.trim()) {
      alert('Defina um e-mail vÃ¡lido antes de enviar a proposta.')
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
      alert(getErrorMessage(sendError, 'NÃ£o foi possÃ­vel enviar a proposta.'))
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
          'NÃ£o foi possÃ­vel aceitar a proposta e gerar o projeto.',
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
          'NÃ£o foi possÃ­vel marcar a proposta como recusada.',
        ),
      )
    }
  }

  async function handleReopenProposal(proposal: ProposalWithClient) {
    try {
      await reopenProposalById(proposal.id)
      alert(`Proposta "${proposal.title}" reaberta como rascunho.`)
    } catch (reopenError) {
      alert(getErrorMessage(reopenError, 'NÃ£o foi possÃ­vel reabrir a proposta.'))
    }
  }

  return {
    clients,
    combinedError: proposalError ?? clientError,
    filteredProposals,
    generatedShareLink,
    hasActiveFilters: search.trim() !== '' || statusFilter !== 'all',
    hasLoadError:
      hasResourceLoadError(clientsLoadStatus) ||
      hasResourceLoadError(proposalsLoadStatus),
    isFilterModalOpen,
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
    statusFilter,
    statusFilterDraft,
    visibleClientResponseNotifications,
    applyFilterModal,
    clearFilterModal,
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
    openFilterModal,
    openShareModal,
    resetAllFilters,
    resetGeneratedShareLink,
    setIsFilterModalOpen,
    setSearch,
    setShareExpiresInDays,
    setStatusFilter,
    setStatusFilterDraft,
  }
}
