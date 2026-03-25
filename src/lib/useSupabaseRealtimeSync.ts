import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'
import { useEffect } from 'react'
import {
  mapClientRecord,
  mapPaymentRecord,
  mapProjectRecord,
  mapProposalRecord,
  type ClientRecord,
  type PaymentRecord,
  type ProjectRecord,
  type ProposalRecord,
} from './database'
import { supabase, syncRealtimeAuth } from './supabase'
import { useClientStore } from '../stores/useClientStore'
import { usePaymentStore } from '../stores/usePaymentStore'
import { useProjectStore } from '../stores/useProjectStore'
import { useProposalStore } from '../stores/useProposalStore'
import {
  clearSelectedRecord,
  removeRecordById,
  syncSelectedRecord,
  upsertRecordByCreatedAtDesc,
} from '../stores/resourceStoreUtils'

function getPayloadId<TRecord extends { id: string }>(
  payload: RealtimePostgresChangesPayload<TRecord>,
) {
  return payload.eventType === 'DELETE' ? payload.old.id : payload.new.id
}

function reconcileRealtimeStores() {
  return Promise.all([
    useClientStore.getState().loadClients(),
    useProjectStore.getState().loadProjects(),
    usePaymentStore.getState().loadPayments(),
    useProposalStore.getState().loadProposals(),
  ])
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
            if (payload.eventType === 'DELETE') {
              const clientId = getPayloadId(payload)

              if (!clientId) {
                return
              }

              useClientStore.setState((state) => ({
                clients: removeRecordById(state.clients, clientId),
                selectedClient: clearSelectedRecord(
                  state.selectedClient,
                  clientId,
                ),
              }))

              return
            }

            const client = mapClientRecord(payload.new)

            useClientStore.setState((state) => ({
              clients: upsertRecordByCreatedAtDesc(state.clients, client),
              selectedClient: syncSelectedRecord(state.selectedClient, client),
            }))
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
            if (payload.eventType === 'DELETE') {
              const projectId = getPayloadId(payload)

              if (!projectId) {
                return
              }

              useProjectStore.setState((state) => ({
                projects: removeRecordById(state.projects, projectId),
                selectedProject: clearSelectedRecord(
                  state.selectedProject,
                  projectId,
                ),
              }))

              return
            }

            const project = mapProjectRecord(payload.new)

            useProjectStore.setState((state) => ({
              projects: upsertRecordByCreatedAtDesc(state.projects, project),
              selectedProject: syncSelectedRecord(
                state.selectedProject,
                project,
              ),
            }))

            if (payload.eventType === 'INSERT') {
              // O aceite via portal compartilhado atualiza proposta e cria projeto
              // na mesma operação. Reconciliar propostas aqui evita depender da
              // ordem de entrega entre eventos multi-tabela.
              void useProposalStore.getState().loadProposals()
            }
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
            if (payload.eventType === 'DELETE') {
              const paymentId = getPayloadId(payload)

              if (!paymentId) {
                return
              }

              usePaymentStore.setState((state) => ({
                payments: removeRecordById(state.payments, paymentId),
                selectedPayment: clearSelectedRecord(
                  state.selectedPayment,
                  paymentId,
                ),
              }))

              return
            }

            const payment = mapPaymentRecord(payload.new)

            usePaymentStore.setState((state) => ({
              payments: upsertRecordByCreatedAtDesc(state.payments, payment),
              selectedPayment: syncSelectedRecord(
                state.selectedPayment,
                payment,
              ),
            }))
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
            if (payload.eventType === 'DELETE') {
              const proposalId = getPayloadId(payload)

              if (!proposalId) {
                return
              }

              useProposalStore.setState((state) => ({
                proposals: removeRecordById(state.proposals, proposalId),
                selectedProposal: clearSelectedRecord(
                  state.selectedProposal,
                  proposalId,
                ),
              }))

              return
            }

            const proposal = mapProposalRecord(payload.new)

            useProposalStore.setState((state) => ({
              proposals: upsertRecordByCreatedAtDesc(state.proposals, proposal),
              selectedProposal: syncSelectedRecord(
                state.selectedProposal,
                proposal,
              ),
            }))
          },
        )

      activeChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Reconciliamos um snapshot completo na conexão inicial e em reconnects
          // para cobrir eventos perdidos durante bootstrap, refresh de token ou rede.
          void reconcileRealtimeStores()
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
