import { supabase, getSupabaseErrorMessage } from '../lib/supabase';
import {
  mapProjectRecord,
  mapProposalRecord,
  toProjectPayload,
  toProposalPayload,
  type ProjectRecord,
  type ProposalInput,
  type ProposalRecord,
} from '../lib/database';
import type { Project } from '../types/project';
import type { Proposal } from '../types/proposal';
import { ensureDatabaseBootstrap } from './bootstrapService';

type AcceptProposalResult = {
  proposal: Proposal;
  project: Project;
};

function isMissingAcceptProposalFunction(error: { message?: string } | null) {
  if (!error?.message) {
    return false;
  }

  return (
    error.message.includes('schema cache') ||
    (error.message.includes('function') &&
      error.message.includes('does not exist'))
  );
}

function addDaysToToday(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
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
    .single();

  if (error || !data) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível carregar a proposta atualizada.',
      ),
    );
  }

  return mapProposalRecord(data as ProposalRecord);
}

export async function getProposals(): Promise<Proposal[]> {
  const userId = await ensureDatabaseBootstrap();

  const { data, error } = await supabase
    .from('proposals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível carregar as propostas no banco.',
      ),
    );
  }

  return (data as ProposalRecord[] | null)?.map(mapProposalRecord) ?? [];
}

export async function createProposal(data: ProposalInput): Promise<Proposal> {
  const userId = await ensureDatabaseBootstrap();

  const { data: createdProposal, error } = await supabase
    .from('proposals')
    .insert(toProposalPayload(data, { userId }))
    .select()
    .single();

  if (error || !createdProposal) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível criar a proposta no banco.',
      ),
    );
  }

  return mapProposalRecord(createdProposal as ProposalRecord);
}

export async function updateProposal(
  id: string,
  data: ProposalInput,
): Promise<Proposal> {
  const userId = await ensureDatabaseBootstrap();

  const { data: updatedProposal, error } = await supabase
    .from('proposals')
    .update(toProposalPayload(data, { userId }))
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !updatedProposal) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível atualizar a proposta no banco.',
      ),
    );
  }

  return mapProposalRecord(updatedProposal as ProposalRecord);
}

export async function deleteProposal(id: string) {
  const userId = await ensureDatabaseBootstrap();

  const { error } = await supabase
    .from('proposals')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível excluir a proposta no banco.',
      ),
    );
  }
}

export async function sendProposal(id: string): Promise<Proposal> {
  const userId = await ensureDatabaseBootstrap();

  const { data, error } = await supabase
    .from('proposals')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      accepted_at: null,
      rejected_at: null,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível marcar a proposta como enviada.',
      ),
    );
  }

  return mapProposalRecord(data as ProposalRecord);
}

export async function rejectProposal(id: string): Promise<Proposal> {
  const userId = await ensureDatabaseBootstrap();

  const { data, error } = await supabase
    .from('proposals')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      accepted_at: null,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível marcar a proposta como recusada.',
      ),
    );
  }

  return mapProposalRecord(data as ProposalRecord);
}

export async function reopenProposal(id: string): Promise<Proposal> {
  const userId = await ensureDatabaseBootstrap();

  const { data, error } = await supabase
    .from('proposals')
    .update({
      status: 'draft',
      sent_at: null,
      accepted_at: null,
      rejected_at: null,
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível reabrir a proposta.',
      ),
    );
  }

  return mapProposalRecord(data as ProposalRecord);
}

export async function acceptProposal(id: string): Promise<AcceptProposalResult> {
  const userId = await ensureDatabaseBootstrap();

  const { data: createdProject, error } = await supabase
    .rpc('accept_proposal', {
      p_proposal_id: id,
      p_project_status: 'in_progress',
    })
    .single();

  if (error && isMissingAcceptProposalFunction(error)) {
    const proposal = await getProposalById(id, userId);

    if (proposal.status === 'rejected') {
      throw new Error('Não é possível aceitar uma proposta recusada.');
    }

    if (proposal.projectId) {
      const existingProject = await supabase
        .from('projects')
        .select('*')
        .eq('id', proposal.projectId)
        .eq('user_id', userId)
        .single();

      if (existingProject.data) {
        return {
          proposal,
          project: mapProjectRecord(existingProject.data as ProjectRecord),
        };
      }
    }

    const { data: fallbackProject, error: fallbackProjectError } = await supabase
      .from('projects')
      .insert(
        toProjectPayload(
          {
            clientId: proposal.clientId,
            name: proposal.title,
            description: proposal.description,
            value: proposal.amount,
            deadline: addDaysToToday(proposal.deliveryDays),
            status: 'in_progress',
          },
          { userId },
        ),
      )
      .select()
      .single();

    if (fallbackProjectError || !fallbackProject) {
      throw new Error(
        getSupabaseErrorMessage(
          fallbackProjectError,
          'Não foi possível gerar o projeto a partir da proposta.',
        ),
      );
    }

    const acceptedAt = new Date().toISOString();
    const { data: updatedProposal, error: updatedProposalError } = await supabase
      .from('proposals')
      .update({
        status: 'accepted',
        accepted_at: acceptedAt,
        rejected_at: null,
        project_id: fallbackProject.id,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updatedProposalError || !updatedProposal) {
      await supabase
        .from('projects')
        .delete()
        .eq('id', fallbackProject.id)
        .eq('user_id', userId);

      throw new Error(
        getSupabaseErrorMessage(
          updatedProposalError,
          'O projeto foi criado, mas a proposta não conseguiu ser atualizada.',
        ),
      );
    }

    return {
      proposal: mapProposalRecord(updatedProposal as ProposalRecord),
      project: mapProjectRecord(fallbackProject as ProjectRecord),
    };
  }

  if (error || !createdProject) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível aceitar a proposta e gerar o projeto.',
      ),
    );
  }

  const proposal = await getProposalById(id, userId);

  return {
    proposal,
    project: mapProjectRecord(createdProject as ProjectRecord),
  };
}
