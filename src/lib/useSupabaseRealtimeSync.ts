import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'
import { useEffect } from 'react'
import {
  mapClientRecord,
  mapProjectRecord,
  mapProposalRecord,
  type ClientRecord,
  type PaymentRecord,
  type ProjectRecord,
  type ProposalRecord,
} from './database'
import { supabase, syncRealtimeAuth } from './supabase'
import {
  clearSelectedRecord,
  removeRecordById,
  syncSelectedRecord,
  upsertRecordByCreatedAtDesc,
} from '../stores/resourceStoreUtils'
import type { ResourceLoadStatus } from '../stores/resourceLoadState'
import { useClientStore } from '../stores/useClientStore'
import { usePaymentStore } from '../stores/usePaymentStore'
import { useProjectStore } from '../stores/useProjectStore'
import { useProposalStore } from '../stores/useProposalStore'
import { useRealtimeInvalidationStore } from '../stores/useRealtimeInvalidationStore'

function getPayloadId<TRecord extends { id: string }>(
  payload: RealtimePostgresChangesPayload<TRecord>,
) {
  return payload.eventType === 'DELETE' ? payload.old.id : payload.new.id
}

function hasRequestedResource(status: ResourceLoadStatus) {
  return status !== 'idle'
}

function shouldApplyRealtimeMutation(status: ResourceLoadStatus) {
  return status === 'loading' || status === 'ready'
}

function invalidateSnapshotViews() {
  useRealtimeInvalidationStore
    .getState()
    .bump(['dashboard', 'clientDetails'])
}

function refreshRequestedRealtimeResources() {
  const reloads: Promise<unknown>[] = []

  const clientStore = useClientStore.getState()
  if (hasRequestedResource(clientStore.loadStatus)) {
    reloads.push(clientStore.loadClients({ force: true }))
  }

  const projectStore = useProjectStore.getState()
  if (hasRequestedResource(projectStore.loadStatus)) {
    reloads.push(projectStore.loadProjects({ force: true }))
  }

  const paymentStore = usePaymentStore.getState()
  if (hasRequestedResource(paymentStore.loadStatus)) {
    reloads.push(paymentStore.loadPayments({ force: true }))
  }

  const proposalStore = useProposalStore.getState()
  if (hasRequestedResource(proposalStore.loadStatus)) {
    reloads.push(proposalStore.loadProposals({ force: true }))
  }

  invalidateSnapshotViews()

  return Promise.all(reloads)
}

function logRealtimeStatus(userId: string, status: string) {
  if (
    !import.meta.env.DEV ||
    (status !== 'CHANNEL_ERROR' &&
      status !== 'TIMED_OUT' &&
      status !== 'CLOSED')
  ) {
    return
  }

  console.warn(
    `[realtime] channel freelanceros-realtime:${userId} status=${status}`,
  )
}

export function useSupabaseRealtimeSync(userId: string | null) {
  useEffect(() => {
    if (!userId) {
      return
    }

    let isDisposed = false
    let hasSubscribedOnce = false
    let activeChannel: RealtimeChannel | null = null

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (isDisposed) {
        return
      }

      syncRealtimeAuth(session)

      activeChannel = supabase
        .channel(`freelanceros-realtime:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'clients',
            filter: `user_id=eq.${userId}`,
          },
          (payload: RealtimePostgresChangesPayload<ClientRecord>) => {
            const clientStore = useClientStore.getState()

            if (payload.eventType === 'DELETE') {
              const clientId = getPayloadId(payload)

              if (!clientId) {
                return
              }

              if (shouldApplyRealtimeMutation(clientStore.loadStatus)) {
                useClientStore.setState((state) => ({
                  clients: removeRecordById(state.clients, clientId),
                  selectedClient: clearSelectedRecord(
                    state.selectedClient,
                    clientId,
                  ),
                }))
              }

              invalidateSnapshotViews()
              return
            }

            if (shouldApplyRealtimeMutation(clientStore.loadStatus)) {
              const client = mapClientRecord(payload.new)

              useClientStore.setState((state) => ({
                clients: upsertRecordByCreatedAtDesc(state.clients, client),
                selectedClient: syncSelectedRecord(
                  state.selectedClient,
                  client,
                ),
              }))
            }

            invalidateSnapshotViews()
          },
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'projects',
            filter: `user_id=eq.${userId}`,
          },
          (payload: RealtimePostgresChangesPayload<ProjectRecord>) => {
            const projectStore = useProjectStore.getState()

            if (payload.eventType === 'DELETE') {
              const projectId = getPayloadId(payload)

              if (!projectId) {
                return
              }

              if (shouldApplyRealtimeMutation(projectStore.loadStatus)) {
                useProjectStore.setState((state) => ({
                  projects: removeRecordById(state.projects, projectId),
                  selectedProject: clearSelectedRecord(
                    state.selectedProject,
                    projectId,
                  ),
                }))
              }

              invalidateSnapshotViews()
              return
            }

            if (shouldApplyRealtimeMutation(projectStore.loadStatus)) {
              const project = mapProjectRecord(payload.new)

              useProjectStore.setState((state) => ({
                projects: upsertRecordByCreatedAtDesc(state.projects, project),
                selectedProject: syncSelectedRecord(
                  state.selectedProject,
                  project,
                ),
              }))
            }

            if (payload.eventType === 'INSERT') {
              const proposalStore = useProposalStore.getState()

              if (hasRequestedResource(proposalStore.loadStatus)) {
                // O aceite via portal compartilhado atualiza proposta e cria
                // projeto na mesma operacao. Recarregar so a store de propostas
                // aqui evita um refresh global para cobrir esse caso multi-tabela.
                void proposalStore.loadProposals({ force: true })
              }
            }

            invalidateSnapshotViews()
          },
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payments',
            filter: `user_id=eq.${userId}`,
          },
          (payload: RealtimePostgresChangesPayload<PaymentRecord>) => {
            const paymentStore = usePaymentStore.getState()

            if (payload.eventType === 'DELETE') {
              const paymentId = getPayloadId(payload)

              if (
                paymentId &&
                shouldApplyRealtimeMutation(paymentStore.loadStatus)
              ) {
                usePaymentStore.setState((state) => ({
                  payments: removeRecordById(state.payments, paymentId),
                  selectedPayment: clearSelectedRecord(
                    state.selectedPayment,
                    paymentId,
                  ),
                }))
              }

              invalidateSnapshotViews()
              return
            }

            if (hasRequestedResource(paymentStore.loadStatus)) {
              // O read model de pagamentos deriva o status no banco. Recarregar
              // so essa store mantem a UI alinhada com a view sem duplicar regra
              // de atraso no cliente.
              void paymentStore.loadPayments({ force: true })
            }

            invalidateSnapshotViews()
          },
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'proposals',
            filter: `user_id=eq.${userId}`,
          },
          (payload: RealtimePostgresChangesPayload<ProposalRecord>) => {
            const proposalStore = useProposalStore.getState()

            if (payload.eventType === 'DELETE') {
              const proposalId = getPayloadId(payload)

              if (!proposalId) {
                return
              }

              if (shouldApplyRealtimeMutation(proposalStore.loadStatus)) {
                useProposalStore.setState((state) => ({
                  proposals: removeRecordById(state.proposals, proposalId),
                  selectedProposal: clearSelectedRecord(
                    state.selectedProposal,
                    proposalId,
                  ),
                }))
              }

              return
            }

            if (shouldApplyRealtimeMutation(proposalStore.loadStatus)) {
              const proposal = mapProposalRecord(payload.new)

              useProposalStore.setState((state) => ({
                proposals: upsertRecordByCreatedAtDesc(
                  state.proposals,
                  proposal,
                ),
                selectedProposal: syncSelectedRecord(
                  state.selectedProposal,
                  proposal,
                ),
              }))
            }
          },
        )

      activeChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          if (hasSubscribedOnce) {
            // Em reconnects, reconciliamos apenas recursos que o usuario ja
            // pediu nesta sessao. Isso cobre eventos perdidos sem disparar
            // snapshots completos de tudo a cada reconexao.
            void refreshRequestedRealtimeResources()
            return
          }

          hasSubscribedOnce = true
          return
        }

        logRealtimeStatus(userId, status)
      })
    })()

    return () => {
      isDisposed = true

      if (activeChannel) {
        void supabase.removeChannel(activeChannel)
      }
    }
  }, [userId])
}
