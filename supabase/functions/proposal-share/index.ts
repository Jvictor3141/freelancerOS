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

function getHttpUrl(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    const parsedUrl = new URL(value);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return null;
    }

    return parsedUrl;
  } catch {
    return null;
  }
}

function resolvePublicAppUrl(request: Request) {
  // Preferimos a origem configurada porque ela representa a URL publica canonica
  // do app; o origin da requisicao fica como fallback seguro para browser/dev.
  const configuredPublicAppUrl = getHttpUrl(publicAppUrl);

  if (configuredPublicAppUrl) {
    return configuredPublicAppUrl.toString();
  }

  const requestOrigin = getHttpUrl(request.headers.get('origin'));

  if (requestOrigin) {
    return requestOrigin.toString();
  }

  throw new Error(
    'Configure PUBLIC_APP_URL para gerar links compartilhados com origem confiavel.',
  );
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

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
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
    throw new Error('FaÃ§a login para gerar o link seguro da proposta.');
  }

  const authClient = getAuthClient(authorizationHeader);
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser();

  if (error || !user) {
    throw new Error('SessÃ£o invÃ¡lida. FaÃ§a login novamente.');
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
    throw new Error('NÃ£o foi possÃ­vel localizar a proposta compartilhada.');
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
    throw new Error('Esse link nÃ£o existe ou jÃ¡ foi removido.');
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

  // A comparacao constante evita vazar, por tempo de resposta, em que ponto a
  // verificacao do token publico falhou.
  if (!timingSafeEqual(providedHash, share.token_hash)) {
    throw new Error('Esse link Ã© invÃ¡lido ou foi alterado.');
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
  const sharedProposal = await getProposalById(share.proposal_id);
  const client = getClientRecord(sharedProposal.clients);
  const { data: authUserResponse } = await admin.auth.admin.getUserById(
    sharedProposal.user_id,
  );

  return {
    proposal: {
      shareId: share.id,
      title: sharedProposal.title,
      description: sharedProposal.description ?? '',
      amount: Number(sharedProposal.amount),
      deliveryDays: sharedProposal.delivery_days,
      status: sharedProposal.status,
      sentAt: sharedProposal.sent_at,
      acceptedAt: sharedProposal.accepted_at,
      rejectedAt: sharedProposal.rejected_at,
      clientRespondedAt: sharedProposal.client_responded_at,
      clientResponseChannel: sharedProposal.client_response_channel,
      createdAt: sharedProposal.created_at,
      expiresAt: share.expires_at,
      lastViewedAt: share.last_viewed_at,
      canRespond:
        sharedProposal.status !== 'accepted' &&
        sharedProposal.status !== 'rejected' &&
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

  if (
    !Number.isInteger(expiresInDays) ||
    expiresInDays < 1 ||
    expiresInDays > 30
  ) {
    throw new Error('Defina uma expiraÃ§Ã£o entre 1 e 30 dias.');
  }

  const { data: proposal, error: proposalError } = await authClient
    .from('proposals')
    .select('id, status')
    .eq('id', payload.proposalId)
    .single();

  if (proposalError || !proposal) {
    throw new Error('NÃ£o foi possÃ­vel localizar essa proposta no seu painel.');
  }

  if (proposal.status === 'accepted') {
    throw new Error(
      'NÃ£o Ã© possÃ­vel compartilhar novamente uma proposta jÃ¡ aceita.',
    );
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
    throw new Error(
      'NÃ£o foi possÃ­vel preparar a proposta para o compartilhamento.',
    );
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
    throw new Error('NÃ£o foi possÃ­vel gerar o link seguro da proposta.');
  }

  const baseUrl = resolvePublicAppUrl(request);
  const sharedPath = `/propostas/compartilhadas/${share.id}#${encodeURIComponent(token)}`;
  const url = new URL(sharedPath, baseUrl).toString();

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

async function handleSharedProposalResponse(
  payload: RespondToSharedProposalRequest,
) {
  const tokenHash = await hashToken(payload.token);

  // A RPC trava o link e a proposta na mesma transacao para evitar aceite/recusa
  // concorrentes gerarem projeto duplicado ou sobrescreverem o estado final.
  const { error } = await admin.rpc('respond_to_shared_proposal', {
    p_share_id: payload.shareId,
    p_token_hash: tokenHash,
    p_decision: payload.decision,
  });

  if (error) {
    throw new Error(
      getErrorMessage(
        error,
        'NÃ£o foi possÃ­vel registrar a resposta da proposta compartilhada.',
      ),
    );
  }

  const share = await getShareById(payload.shareId);
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

    return jsonResponse({ error: 'AÃ§Ã£o invÃ¡lida.' }, 400);
  } catch (error) {
    return jsonResponse(
      {
        error: getErrorMessage(
          error,
          'NÃ£o foi possÃ­vel concluir a operaÃ§Ã£o da proposta compartilhada.',
        ),
      },
      400,
    );
  }
});
