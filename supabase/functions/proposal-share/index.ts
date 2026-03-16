import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const supabaseServiceRoleKey =
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const publicAppUrl = Deno.env.get('PUBLIC_APP_URL') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type CreateShareLinkRequest = {
  action: 'create_share_link';
  proposalId: string;
  expiresInDays: number;
};

type GetSharedProposalRequest = {
  action: 'get_shared_proposal';
  shareId: string;
  token: string;
};

type RespondToSharedProposalRequest = {
  action: 'respond_to_shared_proposal';
  shareId: string;
  token: string;
  decision: 'accept' | 'reject';
};

type ProposalShareRequest =
  | CreateShareLinkRequest
  | GetSharedProposalRequest
  | RespondToSharedProposalRequest;

type ProposalShareRow = {
  id: string;
  user_id: string;
  proposal_id: string;
  token_hash: string;
  expires_at: string;
  last_viewed_at: string | null;
  revoked_at: string | null;
};

type ProposalRow = {
  id: string;
  user_id: string;
  client_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  amount: number | string;
  delivery_days: number;
  recipient_email: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  sent_at: string | null;
  accepted_at: string | null;
  rejected_at: string | null;
  client_responded_at: string | null;
  client_response_channel: 'shared_link' | null;
  created_at: string;
  clients:
    | {
        name: string;
        company: string | null;
      }
    | {
        name: string;
        company: string | null;
      }[];
};

type FreelancerProfile = {
  displayName: string;
  businessName: string;
  headline: string;
  city: string;
  website: string;
  whatsapp: string;
  bio: string;
  proposalSignature: string;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return fallback;
}

function getAuthClient(authorizationHeader: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: authorizationHeader,
      },
    },
  });
}

const admin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function getString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function getRecord(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getDefaultDisplayName(email?: string | null) {
  if (!email) {
    return '';
  }

  return email.split('@')[0] ?? '';
}

function buildFreelancerProfile(user: {
  email?: string | null;
  user_metadata?: unknown;
} | null): FreelancerProfile {
  const metadataRecord = getRecord(user?.user_metadata);
  const profileRecord = getRecord(metadataRecord?.freelancer_profile);

  return {
    displayName:
      getString(profileRecord?.displayName) ||
      getDefaultDisplayName(user?.email ?? null),
    businessName: getString(profileRecord?.businessName),
    headline: getString(profileRecord?.headline),
    city: getString(profileRecord?.city),
    website: getString(profileRecord?.website),
    whatsapp: getString(profileRecord?.whatsapp),
    bio: getString(profileRecord?.bio),
    proposalSignature: getString(profileRecord?.proposalSignature),
  };
}

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(token),
  );

  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

function generateToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const binary = Array.from(bytes, (value) => String.fromCharCode(value)).join(
    '',
  );

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function getFutureIsoDate(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

function toProjectDeadline(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getClientRecord(
  clients: ProposalRow['clients'],
): { name: string; company: string | null } {
  if (Array.isArray(clients)) {
    return clients[0] ?? { name: 'Cliente', company: null };
  }

  return clients;
}

async function getAuthenticatedUser(request: Request) {
  const authorizationHeader = request.headers.get('Authorization');

  if (!authorizationHeader) {
    throw new Error('Faça login para gerar o link seguro da proposta.');
  }

  const authClient = getAuthClient(authorizationHeader);
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error || !user) {
    throw new Error('Sessão inválida. Faça login novamente.');
  }

  return {
    user,
    authClient,
  };
}

async function getProposalById(proposalId: string) {
  const { data, error } = await admin
    .from('proposals')
    .select(
      `
        id,
        user_id,
        client_id,
        project_id,
        title,
        description,
        amount,
        delivery_days,
        recipient_email,
        status,
        sent_at,
        accepted_at,
        rejected_at,
        client_responded_at,
        client_response_channel,
        created_at,
        clients (
          name,
          company
        )
      `,
    )
    .eq('id', proposalId)
    .single();

  if (error || !data) {
    throw new Error('Não foi possível localizar a proposta compartilhada.');
  }

  return data as ProposalRow;
}

async function getShareById(shareId: string) {
  const { data, error } = await admin
    .from('proposal_share_links')
    .select('*')
    .eq('id', shareId)
    .single();

  if (error || !data) {
    throw new Error('Esse link não existe ou já foi removido.');
  }

  return data as ProposalShareRow;
}

async function validateShareToken(shareId: string, token: string) {
  const share = await getShareById(shareId);

  if (share.revoked_at) {
    throw new Error('Esse link foi revogado. Solicite um novo ao freelancer.');
  }

  if (new Date(share.expires_at).getTime() < Date.now()) {
    throw new Error('Esse link expirou. Solicite um novo ao freelancer.');
  }

  const providedHash = await hashToken(token);

  if (providedHash !== share.token_hash) {
    throw new Error('Esse link é inválido ou foi alterado.');
  }

  return share;
}

async function markShareViewed(shareId: string) {
  await admin
    .from('proposal_share_links')
    .update({
      last_viewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', shareId);
}

async function buildSharedProposalPayload(share: ProposalShareRow) {
  const proposal = await getProposalById(share.proposal_id);
  const client = getClientRecord(proposal.clients);
  const { data: authUserResponse } = await admin.auth.admin.getUserById(
    proposal.user_id,
  );

  return {
    proposal: {
      shareId: share.id,
      title: proposal.title,
      description: proposal.description ?? '',
      amount: Number(proposal.amount),
      deliveryDays: proposal.delivery_days,
      status: proposal.status,
      sentAt: proposal.sent_at,
      acceptedAt: proposal.accepted_at,
      rejectedAt: proposal.rejected_at,
      clientRespondedAt: proposal.client_responded_at,
      clientResponseChannel: proposal.client_response_channel,
      createdAt: proposal.created_at,
      expiresAt: share.expires_at,
      lastViewedAt: share.last_viewed_at,
      canRespond:
        proposal.status !== 'accepted' &&
        proposal.status !== 'rejected' &&
        !share.revoked_at &&
        new Date(share.expires_at).getTime() >= Date.now(),
      clientName: client.name,
      clientCompany: client.company ?? '',
      freelancerProfile: buildFreelancerProfile(authUserResponse.user ?? null),
    },
  };
}

async function handleCreateShareLink(
  request: Request,
  payload: CreateShareLinkRequest,
) {
  const { user, authClient } = await getAuthenticatedUser(request);
  const expiresInDays = Number(payload.expiresInDays);

  if (!Number.isInteger(expiresInDays) || expiresInDays < 1 || expiresInDays > 30) {
    throw new Error('Defina uma expiração entre 1 e 30 dias.');
  }

  const { data: proposal, error: proposalError } = await authClient
    .from('proposals')
    .select('id, status')
    .eq('id', payload.proposalId)
    .single();

  if (proposalError || !proposal) {
    throw new Error('Não foi possível localizar essa proposta no seu painel.');
  }

  if (proposal.status === 'accepted') {
    throw new Error('Não é possível compartilhar novamente uma proposta já aceita.');
  }

  const now = new Date().toISOString();
  const token = generateToken();
  const tokenHash = await hashToken(token);
  const expiresAt = getFutureIsoDate(expiresInDays);

  const { error: updateProposalError } = await authClient
    .from('proposals')
    .update({
      status: 'sent',
      sent_at: now,
      accepted_at: null,
      rejected_at: null,
      client_responded_at: null,
      client_response_channel: null,
    })
    .eq('id', payload.proposalId);

  if (updateProposalError) {
    throw new Error('Não foi possível preparar a proposta para o compartilhamento.');
  }

  const { data: share, error: shareError } = await authClient
    .from('proposal_share_links')
    .upsert(
      {
        user_id: user.id,
        proposal_id: payload.proposalId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        last_viewed_at: null,
        revoked_at: null,
        updated_at: now,
      },
      { onConflict: 'proposal_id' },
    )
    .select('id, expires_at')
    .single();

  if (shareError || !share) {
    throw new Error('Não foi possível gerar o link seguro da proposta.');
  }

  const requestOrigin = request.headers.get('origin') ?? '';
  const baseUrl = publicAppUrl || requestOrigin;
  const sharedPath = `/propostas/compartilhadas/${share.id}#${encodeURIComponent(token)}`;
  const url = baseUrl ? new URL(sharedPath, baseUrl).toString() : sharedPath;

  return jsonResponse({
    shareLink: {
      shareId: share.id,
      url,
      expiresAt: share.expires_at,
    },
  });
}

async function handleGetSharedProposal(payload: GetSharedProposalRequest) {
  const share = await validateShareToken(payload.shareId, payload.token);
  await markShareViewed(share.id);
  return jsonResponse(await buildSharedProposalPayload(share));
}

async function acceptSharedProposal(proposal: ProposalRow) {
  if (proposal.status === 'accepted' && proposal.project_id) {
    return;
  }

  if (proposal.status === 'rejected') {
    throw new Error('Essa proposta já foi recusada e não aceita novas ações.');
  }

  const { data: createdProject, error: createProjectError } = await admin
    .from('projects')
    .insert({
      user_id: proposal.user_id,
      client_id: proposal.client_id,
      name: proposal.title,
      description: proposal.description ?? '',
      value: proposal.amount,
      deadline: toProjectDeadline(proposal.delivery_days),
      status: 'in_progress',
    })
    .select('id')
    .single();

  if (createProjectError || !createdProject) {
    throw new Error('Não foi possível gerar o projeto após o aceite da proposta.');
  }

  const responseTimestamp = new Date().toISOString();
  const { error: updateProposalError } = await admin
    .from('proposals')
    .update({
      status: 'accepted',
      accepted_at: responseTimestamp,
      rejected_at: null,
      project_id: createdProject.id,
      client_responded_at: responseTimestamp,
      client_response_channel: 'shared_link',
    })
    .eq('id', proposal.id);

  if (updateProposalError) {
    await admin.from('projects').delete().eq('id', createdProject.id);
    throw new Error('O aceite foi registrado, mas o projeto não conseguiu ser vinculado à proposta.');
  }
}

async function rejectSharedProposal(proposal: ProposalRow) {
  if (proposal.status === 'accepted') {
    throw new Error('Essa proposta já foi aceita e não pode mais ser recusada.');
  }

  const responseTimestamp = new Date().toISOString();
  const { error } = await admin
    .from('proposals')
    .update({
      status: 'rejected',
      rejected_at: responseTimestamp,
      accepted_at: null,
      client_responded_at: responseTimestamp,
      client_response_channel: 'shared_link',
    })
    .eq('id', proposal.id);

  if (error) {
    throw new Error('Não foi possível registrar a recusa da proposta.');
  }
}

async function handleSharedProposalResponse(
  payload: RespondToSharedProposalRequest,
) {
  const share = await validateShareToken(payload.shareId, payload.token);
  const proposal = await getProposalById(share.proposal_id);

  if (proposal.status === 'accepted' || proposal.status === 'rejected') {
    throw new Error('Essa proposta já recebeu uma resposta e não aceita novas ações.');
  }

  if (payload.decision === 'accept') {
    await acceptSharedProposal(proposal);
  } else {
    await rejectSharedProposal(proposal);
  }

  await markShareViewed(share.id);

  return jsonResponse(await buildSharedProposalPayload(share));
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = (await request.json()) as ProposalShareRequest;

    if (payload.action === 'create_share_link') {
      return await handleCreateShareLink(request, payload);
    }

    if (payload.action === 'get_shared_proposal') {
      return await handleGetSharedProposal(payload);
    }

    if (payload.action === 'respond_to_shared_proposal') {
      return await handleSharedProposalResponse(payload);
    }

    return jsonResponse({ error: 'Ação inválida.' }, 400);
  } catch (error) {
    return jsonResponse(
      {
        error: getErrorMessage(
          error,
          'Não foi possível concluir a operação da proposta compartilhada.',
        ),
      },
      400,
    );
  }
});
