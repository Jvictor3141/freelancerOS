create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  company text not null default '',
  email text not null,
  phone text not null default '',
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  description text not null default '',
  value numeric(12, 2) not null default 0,
  deadline date,
  status text not null check (status in ('in_progress', 'review', 'completed')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  amount numeric(12, 2) not null default 0,
  due_date date not null,
  paid_at date,
  status text not null check (status in ('pending', 'paid', 'overdue')),
  method text not null check (method in ('pix', 'card', 'bank_transfer', 'cash')),
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title text not null,
  description text not null default '',
  amount numeric(12, 2) not null default 0,
  delivery_days integer not null default 7 check (delivery_days > 0),
  recipient_email text not null,
  status text not null check (status in ('draft', 'sent', 'accepted', 'rejected')),
  sent_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  client_responded_at timestamptz,
  client_response_channel text check (
    client_response_channel in ('shared_link') or client_response_channel is null
  ),
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists proposals_id_user_id_unique_idx on public.proposals (id, user_id);

create table if not exists public.proposal_share_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  proposal_id uuid not null unique,
  token_hash text not null,
  expires_at timestamptz not null,
  last_viewed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint proposal_share_links_proposal_owner_fk
    foreign key (proposal_id, user_id)
    references public.proposals (id, user_id)
    on delete cascade
);

create index if not exists clients_user_id_idx on public.clients (user_id);
create index if not exists projects_user_id_idx on public.projects (user_id);
create index if not exists projects_client_id_idx on public.projects (client_id);
create index if not exists payments_user_id_idx on public.payments (user_id);
create index if not exists payments_project_id_idx on public.payments (project_id);
create index if not exists payments_status_idx on public.payments (status);
create index if not exists proposals_user_id_idx on public.proposals (user_id);
create index if not exists proposals_client_id_idx on public.proposals (client_id);
create index if not exists proposals_status_idx on public.proposals (status);
create unique index if not exists proposals_project_id_unique_idx on public.proposals (project_id)
where project_id is not null;
create index if not exists proposal_share_links_user_id_idx on public.proposal_share_links (user_id);
create index if not exists proposal_share_links_expires_at_idx on public.proposal_share_links (expires_at);

do $$
declare
  realtime_table text;
begin
  if not exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) then
    create publication supabase_realtime;
  end if;

  foreach realtime_table in array array[
    'clients',
    'projects',
    'payments',
    'proposals'
  ] loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = realtime_table
    ) then
      execute format(
        'alter publication supabase_realtime add table public.%I',
        realtime_table
      );
    end if;
  end loop;
end;
$$;

alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.payments enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_share_links enable row level security;

drop policy if exists "Users manage own clients" on public.clients;
create policy "Users manage own clients" on public.clients
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own projects" on public.projects;
create policy "Users manage own projects" on public.projects
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own payments" on public.payments;
create policy "Users manage own payments" on public.payments
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own proposals" on public.proposals;
create policy "Users manage own proposals" on public.proposals
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users manage own proposal share links" on public.proposal_share_links;
create policy "Users manage own proposal share links" on public.proposal_share_links
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop function if exists public.accept_proposal(uuid, text);

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

drop function if exists public.respond_to_shared_proposal(uuid, text, text);

create or replace function public.respond_to_shared_proposal(
  p_share_id uuid,
  p_token_hash text,
  p_decision text
)
returns table (proposal_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_share public.proposal_share_links%rowtype;
  v_proposal public.proposals%rowtype;
  v_response_timestamp timestamptz := timezone('utc', now());
  v_project_id uuid;
begin
  -- A funcao abaixo concentra a resposta publica em uma unica transacao para
  -- evitar concorrencia entre cliques repetidos ou requests simultaneos.
  if p_decision not in ('accept', 'reject') then
    raise exception 'Decisao invalida para a proposta compartilhada.';
  end if;

  select *
  into v_share
  from public.proposal_share_links
  where id = p_share_id
  for update;

  if not found then
    raise exception 'Esse link nao existe ou ja foi removido.';
  end if;

  if v_share.revoked_at is not null then
    raise exception 'Esse link foi revogado. Solicite um novo ao freelancer.';
  end if;

  if v_share.expires_at < v_response_timestamp then
    raise exception 'Esse link expirou. Solicite um novo ao freelancer.';
  end if;

  if v_share.token_hash <> p_token_hash then
    raise exception 'Esse link e invalido ou foi alterado.';
  end if;

  select *
  into v_proposal
  from public.proposals
  where id = v_share.proposal_id
  for update;

  if not found then
    raise exception 'Nao foi possivel localizar a proposta compartilhada.';
  end if;

  if v_proposal.status in ('accepted', 'rejected') then
    raise exception 'Essa proposta ja recebeu uma resposta e nao aceita novas acoes.';
  end if;

  if p_decision = 'accept' then
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
      coalesce(v_proposal.description, ''),
      v_proposal.amount,
      current_date + v_proposal.delivery_days,
      'in_progress'
    )
    returning id
    into v_project_id;

    update public.proposals
    set
      status = 'accepted',
      accepted_at = v_response_timestamp,
      rejected_at = null,
      project_id = v_project_id,
      client_responded_at = v_response_timestamp,
      client_response_channel = 'shared_link'
    where id = v_proposal.id;
  else
    update public.proposals
    set
      status = 'rejected',
      rejected_at = v_response_timestamp,
      accepted_at = null,
      client_responded_at = v_response_timestamp,
      client_response_channel = 'shared_link'
    where id = v_proposal.id;
  end if;

  update public.proposal_share_links
  set
    last_viewed_at = v_response_timestamp,
    updated_at = v_response_timestamp
  where id = v_share.id;

  return query
  select v_proposal.id;
end;
$$;

revoke all on function public.respond_to_shared_proposal(uuid, text, text) from public;
revoke all on function public.respond_to_shared_proposal(uuid, text, text) from anon;
revoke all on function public.respond_to_shared_proposal(uuid, text, text) from authenticated;
grant execute on function public.respond_to_shared_proposal(uuid, text, text) to service_role;
