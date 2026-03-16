begin;

alter table public.proposals
  add column if not exists client_responded_at timestamptz,
  add column if not exists client_response_channel text;

alter table public.proposals
  drop constraint if exists proposals_client_response_channel_check;

alter table public.proposals
  add constraint proposals_client_response_channel_check
  check (
    client_response_channel in ('shared_link') or client_response_channel is null
  );

create unique index if not exists proposals_id_user_id_unique_idx
  on public.proposals (id, user_id);

create table if not exists public.proposal_share_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  proposal_id uuid not null unique,
  token_hash text not null,
  expires_at timestamptz not null,
  last_viewed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.proposal_share_links
  drop constraint if exists proposal_share_links_proposal_owner_fk;

alter table public.proposal_share_links
  add constraint proposal_share_links_proposal_owner_fk
  foreign key (proposal_id, user_id)
  references public.proposals (id, user_id)
  on delete cascade;

create index if not exists proposal_share_links_user_id_idx
  on public.proposal_share_links (user_id);

create index if not exists proposal_share_links_expires_at_idx
  on public.proposal_share_links (expires_at);

alter table public.proposal_share_links enable row level security;

drop policy if exists "Users manage own proposal share links" on public.proposal_share_links;

create policy "Users manage own proposal share links" on public.proposal_share_links
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.accept_proposal(
  p_proposal_id uuid,
  p_project_status text default 'in_progress'
)
returns public.projects
language plpgsql
as $$
declare
  v_proposal public.proposals%rowtype;
  v_project public.projects%rowtype;
begin
  if p_project_status not in ('in_progress', 'review', 'completed') then
    raise exception 'Status de projeto inválido para aceite de proposta.';
  end if;

  select *
  into v_proposal
  from public.proposals
  where id = p_proposal_id
    and user_id = auth.uid();

  if not found then
    raise exception 'Proposta não encontrada ou sem permissão.';
  end if;

  if v_proposal.status = 'accepted' and v_proposal.project_id is not null then
    select *
    into v_project
    from public.projects
    where id = v_proposal.project_id
      and user_id = auth.uid();

    if found then
      return v_project;
    end if;
  end if;

  if v_proposal.status = 'rejected' then
    raise exception 'Não é possível aceitar uma proposta recusada.';
  end if;

  insert into public.projects (
    user_id,
    client_id,
    name,
    description,
    value,
    deadline,
    status
  )
  values (
    v_proposal.user_id,
    v_proposal.client_id,
    v_proposal.title,
    v_proposal.description,
    v_proposal.amount,
    current_date + v_proposal.delivery_days,
    p_project_status
  )
  returning *
  into v_project;

  update public.proposals
  set
    status = 'accepted',
    accepted_at = timezone('utc', now()),
    rejected_at = null,
    client_responded_at = null,
    client_response_channel = null,
    project_id = v_project.id
  where id = v_proposal.id
    and user_id = auth.uid();

  return v_project;
end;
$$;

commit;
