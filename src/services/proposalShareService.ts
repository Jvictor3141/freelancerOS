import { getErrorMessage, supabase, supabaseKey, supabaseUrl } from '../lib/supabase';
import type { SharedProposal, ProposalSecureShareLink } from '../types/sharedProposal';

type CreateShareLinkResponse = {
  shareLink: ProposalSecureShareLink;
};

type SharedProposalResponse = {
  proposal: SharedProposal;
};

type ProposalShareAction = 'create_share_link' | 'get_shared_proposal' | 'respond_to_shared_proposal';
type SharedProposalDecision = 'accept' | 'reject';

function getProposalShareErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    typeof error.error === 'string'
  ) {
    return error.error;
  }

  return getErrorMessage(error, fallback);
}

async function invokeProposalShareFunction<TResult>(
  payload: Record<string, unknown>,
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
    | null;

  if (!response.ok) {
    throw new Error(
      getProposalShareErrorMessage(
        responseJson,
        'Não foi possível concluir a operação do link seguro da proposta.',
      ),
    );
  }

  return responseJson as TResult;
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
      action: 'create_share_link' satisfies ProposalShareAction,
      proposalId,
      expiresInDays,
    },
    { accessToken },
  );

  return response.shareLink;
}

export async function getSharedProposal(shareId: string, token: string) {
  const response = await invokeProposalShareFunction<SharedProposalResponse>({
    action: 'get_shared_proposal' satisfies ProposalShareAction,
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
    action: 'respond_to_shared_proposal' satisfies ProposalShareAction,
    shareId,
    token,
    decision,
  });

  return response.proposal;
}
