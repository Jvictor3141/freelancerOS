import { getErrorMessage, supabase, supabaseKey, supabaseUrl } from '../lib/supabase';
import type {
  CreateShareLinkResponse,
  ProposalShareRequest,
  ProposalShareResponse,
  SharedProposalDecision,
  SharedProposalResponse,
} from '../types/sharedProposal'
import { getRecord } from '../utils/typeGuards'

function getProposalShareErrorMessage(error: unknown, fallback: string) {
  const errorRecord = getRecord(error)

  if (typeof errorRecord?.error === 'string') {
    return errorRecord.error
  }

  return getErrorMessage(error, fallback)
}

async function invokeProposalShareFunction<TResult extends ProposalShareResponse>(
  payload: ProposalShareRequest,
  options?: { accessToken?: string | null },
): Promise<TResult> {
  const response = await fetch(`${supabaseUrl}/functions/v1/proposal-share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
      ...(options?.accessToken
        ? { Authorization: `Bearer ${options.accessToken}` }
        : {}),
    },
    body: JSON.stringify(payload),
  });

  const responseJson = (await response.json().catch(() => null)) as
    | { error?: string }
    | TResult
    | null

  if (!response.ok) {
    throw new Error(
      getProposalShareErrorMessage(
        responseJson,
        'Não foi possível concluir a operação do link seguro da proposta.',
      ),
    );
  }

  return responseJson as TResult
}

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}

export async function createProposalSecureShareLink(
  proposalId: string,
  expiresInDays: number,
) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    throw new Error('Faça login novamente para gerar o link seguro.');
  }

  const response = await invokeProposalShareFunction<CreateShareLinkResponse>(
    {
      action: 'create_share_link',
      proposalId,
      expiresInDays,
    },
    { accessToken },
  );

  return response.shareLink;
}

export async function getSharedProposal(shareId: string, token: string) {
  const response = await invokeProposalShareFunction<SharedProposalResponse>({
    action: 'get_shared_proposal',
    shareId,
    token,
  });

  return response.proposal;
}

export async function respondToSharedProposal(
  shareId: string,
  token: string,
  decision: SharedProposalDecision,
) {
  const response = await invokeProposalShareFunction<SharedProposalResponse>({
    action: 'respond_to_shared_proposal',
    shareId,
    token,
    decision,
  });

  return response.proposal;
}
