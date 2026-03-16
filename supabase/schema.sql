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
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now())
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

alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.payments enable row level security;
alter table public.proposals enable row level security;

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
    project_id = v_project.id
  where id = v_proposal.id
    and user_id = auth.uid();

  return v_project;
end;
$$;
