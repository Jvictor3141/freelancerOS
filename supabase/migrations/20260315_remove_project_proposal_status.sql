begin;

with legacy_projects as (
  select
    projects.id,
    projects.user_id,
    projects.client_id,
    projects.name,
    projects.description,
    projects.value,
    projects.deadline,
    projects.created_at,
    clients.email as client_email,
    exists (
      select 1
      from public.payments
      where payments.project_id = projects.id
    ) as has_payments
  from public.projects
  join public.clients on clients.id = projects.client_id
  where projects.status = 'proposal'
)
insert into public.proposals (
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
  notes,
  created_at
)
select
  legacy_projects.user_id,
  legacy_projects.client_id,
  legacy_projects.id,
  legacy_projects.name,
  coalesce(legacy_projects.description, ''),
  coalesce(legacy_projects.value, 0),
  greatest(1, coalesce(legacy_projects.deadline - legacy_projects.created_at::date, 7)),
  legacy_projects.client_email,
  case
    when legacy_projects.has_payments then 'accepted'
    else 'draft'
  end,
  case
    when legacy_projects.has_payments then legacy_projects.created_at
    else null
  end,
  case
    when legacy_projects.has_payments then legacy_projects.created_at
    else null
  end,
  null,
  case
    when legacy_projects.has_payments then
      'Migrada automaticamente de um projeto legado com pagamentos vinculados.'
    else
      'Migrada automaticamente de um projeto legado com status proposal.'
  end,
  legacy_projects.created_at
from legacy_projects
where not exists (
  select 1
  from public.proposals
  where proposals.project_id = legacy_projects.id
);

delete from public.projects as legacy_project
where legacy_project.status = 'proposal'
  and not exists (
    select 1
    from public.payments
    where payments.project_id = legacy_project.id
  );

update public.projects
set status = 'in_progress'
where status = 'proposal';

alter table public.projects
  drop constraint if exists projects_status_check;

alter table public.projects
  add constraint projects_status_check
  check (status in ('in_progress', 'review', 'completed'));

commit;

-- Verificacao opcional apos a migracao:
-- select status, count(*) from public.projects group by status order by status;
-- select status, count(*) from public.proposals group by status order by status;
