-- Fix upcoming_payments in get_dashboard_snapshot:
-- 1. Include 'overdue' payments (previously only 'pending' were returned).
-- 2. Remove the lower-bound date filter so past-overdue items are visible.
--    Upper bound stays at +30 days to cap future pending entries.

drop function if exists public.get_dashboard_snapshot();

create or replace function public.get_dashboard_snapshot()
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
with metrics as (
  select
    (
      select count(*)::int
      from public.clients
      where user_id = auth.uid()
    ) as total_clients,
    (
      select count(*)::int
      from public.projects
      where user_id = auth.uid()
        and status in ('in_progress', 'review')
    ) as projects_in_progress,
    (
      select count(*)::int
      from public.projects
      where user_id = auth.uid()
        and status = 'completed'
    ) as completed_projects,
    coalesce(
      (
        select avg(value)
        from public.projects
        where user_id = auth.uid()
      ),
      0
    ) as average_ticket
),
payment_metrics as (
  select
    currency,
    coalesce(sum(case when status = 'paid'    then amount else 0 end), 0) as received_amount,
    coalesce(sum(case when status = 'pending' then amount else 0 end), 0) as pending_amount,
    coalesce(sum(case when status = 'overdue' then amount else 0 end), 0) as overdue_amount
  from public.payments_read_model
  where user_id = auth.uid()
  group by currency
),
revenue as (
  select
    date_trunc('month', paid_at::timestamp)::date as month_start,
    currency,
    sum(amount) as revenue
  from public.payments_read_model
  where user_id = auth.uid()
    and status = 'paid'
    and paid_at is not null
    and date_trunc('month', paid_at::timestamp)::date
        >= (date_trunc('month', timezone('America/Sao_Paulo', now())) - interval '5 months')::date
  group by date_trunc('month', paid_at::timestamp)::date, currency
),
recent_activities as (
  select
    project.id,
    project.name      as title,
    client.name       as client_name,
    project.status,
    project.created_at,
    project.value,
    project.currency
  from public.projects project
  join public.clients client
    on client.id       = project.client_id
   and client.user_id  = project.user_id
  where project.user_id = auth.uid()
  order by project.created_at desc
  limit 4
),
payment_alerts as (
  select
    payment.id,
    client.name   as client_name,
    project.name  as project_name,
    payment.amount,
    payment.currency,
    payment.due_date,
    payment.status,
    payment.created_at
  from public.payments_read_model payment
  join public.projects project
    on project.id       = payment.project_id
   and project.user_id  = payment.user_id
  join public.clients client
    on client.id        = project.client_id
   and client.user_id   = project.user_id
  where payment.user_id = auth.uid()
    and payment.status in ('pending', 'overdue')
  order by payment.due_date asc, payment.created_at desc
  limit 4
),
upcoming_payments as (
  select
    payment.id,
    client.name   as client_name,
    project.name  as project_name,
    payment.amount,
    payment.currency,
    payment.due_date,
    payment.status,
    payment.created_at
  from public.payments_read_model payment
  join public.projects project
    on project.id       = payment.project_id
   and project.user_id  = payment.user_id
  join public.clients client
    on client.id        = project.client_id
   and client.user_id   = project.user_id
  where payment.user_id = auth.uid()
    and payment.status in ('pending', 'overdue')
    and payment.due_date <= (timezone('America/Sao_Paulo', now())::date + interval '30 days')
  order by payment.due_date asc
  limit 10
)
select jsonb_build_object(
  'metrics',
  (
    select jsonb_build_object(
      'totalClients',       total_clients,
      'projectsInProgress', projects_in_progress,
      'completedProjects',  completed_projects,
      'averageTicket',      average_ticket
    )
    from metrics
  ),
  'paymentMetrics',
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'currency',       currency,
          'receivedAmount', received_amount,
          'pendingAmount',  pending_amount,
          'overdueAmount',  overdue_amount
        )
      )
      from payment_metrics
    ),
    '[]'::jsonb
  ),
  'revenue',
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'month',    to_char(month_start, 'YYYY-MM-DD'),
          'currency', currency,
          'revenue',  revenue
        )
        order by month_start
      )
      from revenue
    ),
    '[]'::jsonb
  ),
  'recentActivities',
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id',         id,
          'title',      title,
          'clientName', client_name,
          'status',     status,
          'createdAt',  created_at,
          'value',      value,
          'currency',   currency
        )
        order by created_at desc
      )
      from recent_activities
    ),
    '[]'::jsonb
  ),
  'paymentAlerts',
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id',          id,
          'clientName',  client_name,
          'projectName', project_name,
          'amount',      amount,
          'currency',    currency,
          'dueDate',     to_char(due_date, 'YYYY-MM-DD'),
          'status',      status
        )
        order by due_date asc, created_at desc
      )
      from payment_alerts
    ),
    '[]'::jsonb
  ),
  'upcomingPayments',
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'id',          id,
          'clientName',  client_name,
          'projectName', project_name,
          'amount',      amount,
          'currency',    currency,
          'dueDate',     to_char(due_date, 'YYYY-MM-DD'),
          'status',      status
        )
        order by due_date asc
      )
      from upcoming_payments
    ),
    '[]'::jsonb
  )
);
$$;

grant execute on function public.get_dashboard_snapshot() to authenticated;
grant execute on function public.get_dashboard_snapshot() to service_role;
