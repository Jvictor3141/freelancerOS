-- Este schema cria as tabelas usadas pelo app e deixa politicas abertas para o MVP.
-- Quando a autenticacao entrar no fluxo principal, troque essas policies por regras por usuario.

create extension if not exists pgcrypto;

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text not null default '',
  email text not null,
  phone text not null default '',
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  name text not null,
  description text not null default '',
  value numeric(12, 2) not null default 0,
  deadline date,
  status text not null check (status in ('proposal', 'in_progress', 'review', 'completed')),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  amount numeric(12, 2) not null default 0,
  due_date date not null,
  paid_at date,
  status text not null check (status in ('pending', 'paid', 'overdue')),
  method text not null check (method in ('pix', 'card', 'bank_transfer', 'cash')),
  notes text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists projects_client_id_idx on public.projects (client_id);
create index if not exists payments_project_id_idx on public.payments (project_id);
create index if not exists payments_status_idx on public.payments (status);

alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.payments enable row level security;

create policy "Public read clients" on public.clients
for select using (true);

create policy "Public insert clients" on public.clients
for insert with check (true);

create policy "Public update clients" on public.clients
for update using (true) with check (true);

create policy "Public delete clients" on public.clients
for delete using (true);

create policy "Public read projects" on public.projects
for select using (true);

create policy "Public insert projects" on public.projects
for insert with check (true);

create policy "Public update projects" on public.projects
for update using (true) with check (true);

create policy "Public delete projects" on public.projects
for delete using (true);

create policy "Public read payments" on public.payments
for select using (true);

create policy "Public insert payments" on public.payments
for insert with check (true);

create policy "Public update payments" on public.payments
for update using (true) with check (true);

create policy "Public delete payments" on public.payments
for delete using (true);
