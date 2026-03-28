import { supabase, getSupabaseErrorMessage } from '../lib/supabase'
import {
  mapProjectRecord,
  mapProposalRecord,
  toProposalPayload,
  type ProjectRecord,
  type ProposalRecord,
} from '../lib/database'
import type { ProposalInput } from '../types/inputs'
import type { Project } from '../types/project'
import type { Proposal } from '../types/proposal'
import { ensureDatabaseBootstrap } from './bootstrapService'

export { createProposalSecureShareLink } from './proposalShareService'

type AcceptProposalResult = {
  proposal: Proposal
  project: Project
}

function isMissingAcceptProposalFunction(error: { message?: string } | null) {
  if (!error?.message) {
    return false
  }

  return (
    error.message.includes('accept_proposal') &&
    (error.message.includes('does not exist') ||
      error.message.includes('schema cache'))
  )
}

function getAcceptProposalErrorMessage(
  error: { message?: string } | null,
  fallback: string,
) {
  if (isMissingAcceptProposalFunction(error)) {
    return 'A automacao de aceite de propostas no Supabase ainda nao esta disponivel. Aplique as migrations mais recentes do projeto e tente novamente.'
  }

  return getSupabaseErrorMessage(error, fallback)
}

async function getProposalById(
  id: string,
  userId: string,
): Promise<Proposal> {
  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Nao foi possivel carregar a proposta atualizada.',
      ),
    )
  }

  return mapProposalRecord(data as ProposalRecord)
}

export async function getProposals(): Promise<Proposal[]> {
  const userId = await ensureDatabaseBootstrap()

  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Nao foi possivel carregar as propostas no banco.',
      ),
    )
  }

  return (data as ProposalRecord[] | null)?.map(mapProposalRecord) ?? []
}

export async function createProposal(data: ProposalInput): Promise<Proposal> {
  const userId = await ensureDatabaseBootstrap()

  const { data: createdProposal, error } = await supabase
    .from('proposals')
    .insert(toProposalPayload(data, { userId }))
    .select()
    .single()

  if (error || !createdProposal) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Nao foi possivel criar a proposta no banco.',
      ),
    )
  }

  return mapProposalRecord(createdProposal as ProposalRecord)
}

export async function updateProposal(
  id: string,
  data: ProposalInput,
): Promise<Proposal> {
  const userId = await ensureDatabaseBootstrap()

  const { data: updatedProposal, error } = await supabase
    .from('proposals')
    .update(toProposalPayload(data, { userId }))
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !updatedProposal) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Nao foi possivel atualizar a proposta no banco.',
      ),
    )
  }

  return mapProposalRecord(updatedProposal as ProposalRecord)
}

export async function deleteProposal(id: string) {
  const userId = await ensureDatabaseBootstrap()

  const { error } = await supabase
    .from('proposals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Nao foi possivel excluir a proposta no banco.',
      ),
    )
  }
}

export async function sendProposal(id: string): Promise<Proposal> {
  const userId = await ensureDatabaseBootstrap()

  const { data, error } = await supabase
    .from('proposals')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      accepted_at: null,
      rejected_at: null,
      client_responded_at: null,
      client_response_channel: null,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Nao foi possivel marcar a proposta como enviada.',
      ),
    )
  }

  return mapProposalRecord(data as ProposalRecord)
}

export async function rejectProposal(id: string): Promise<Proposal> {
  const userId = await ensureDatabaseBootstrap()

  const { data, error } = await supabase
    .from('proposals')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      accepted_at: null,
      client_responded_at: null,
      client_response_channel: null,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Nao foi possivel marcar a proposta como recusada.',
      ),
    )
  }

  return mapProposalRecord(data as ProposalRecord)
}

export async function reopenProposal(id: string): Promise<Proposal> {
  const userId = await ensureDatabaseBootstrap()

  const { data, error } = await supabase
    .from('proposals')
    .update({
      status: 'draft',
      sent_at: null,
      accepted_at: null,
      rejected_at: null,
      client_responded_at: null,
      client_response_channel: null,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error || !data) {
    throw new Error(
      getSupabaseErrorMessage(error, 'Nao foi possivel reabrir a proposta.'),
    )
  }

  return mapProposalRecord(data as ProposalRecord)
}

export async function acceptProposal(id: string): Promise<AcceptProposalResult> {
  const userId = await ensureDatabaseBootstrap()

  const { data: createdProject, error } = await supabase
    .rpc('accept_proposal', {
      p_proposal_id: id,
      p_project_status: 'in_progress',
    })
    .single()

  if (error || !createdProject) {
    throw new Error(
      getAcceptProposalErrorMessage(
        error,
        'Nao foi possivel aceitar a proposta e gerar o projeto.',
      ),
    )
  }

  const proposal = await getProposalById(id, userId)

  return {
    proposal,
    project: mapProjectRecord(createdProject as ProjectRecord),
  }
}
