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
    coalesce(sum(case when status = 'paid' then amount else 0 end), 0) as received_amount,
    coalesce(sum(case when status = 'pending' then amount else 0 end), 0) as pending_amount,
    coalesce(sum(case when status = 'overdue' then amount else 0 end), 0) as overdue_amount
  from public.payments_read_model
  where user_id = auth.uid()
),
revenue_buckets as (
  select month_start::date
  from generate_series(
    date_trunc('month', timezone('America/Sao_Paulo', now()))::date - interval '5 months',
    date_trunc('month', timezone('America/Sao_Paulo', now()))::date,
    interval '1 month'
  ) as month_start
),
revenue as (
  select
    bucket.month_start,
    coalesce(sum(payment.amount), 0) as revenue
  from revenue_buckets bucket
  left join public.payments_read_model payment
    on payment.user_id = auth.uid()
   and payment.status = 'paid'
   and payment.paid_at is not null
   and date_trunc('month', payment.paid_at::timestamp)::date = bucket.month_start
  group by bucket.month_start
),
recent_activities as (
  select
    project.id,
    project.name as title,
    client.name as client_name,
    project.status,
    project.created_at,
    project.value
  from public.projects project
  join public.clients client
    on client.id = project.client_id
   and client.user_id = project.user_id
  where project.user_id = auth.uid()
  order by project.created_at desc
  limit 4
),
payment_alerts as (
  select
    payment.id,
    client.name as client_name,
    project.name as project_name,
    payment.amount,
    payment.due_date,
    payment.status,
    payment.created_at
  from public.payments_read_model payment
  join public.projects project
    on project.id = payment.project_id
   and project.user_id = payment.user_id
  join public.clients client
    on client.id = project.client_id
   and client.user_id = project.user_id
  where payment.user_id = auth.uid()
    and payment.status in ('pending', 'overdue')
  order by payment.due_date asc, payment.created_at desc
  limit 4
)
select jsonb_build_object(
  'metrics',
  (
    select jsonb_build_object(
      'totalClients', total_clients,
      'projectsInProgress', projects_in_progress,
      'completedProjects', completed_projects,
      'averageTicket', average_ticket
    )
    from metrics
  ),
  'paymentMetrics',
  (
    select jsonb_build_object(
      'receivedAmount', received_amount,
      'pendingAmount', pending_amount,
      'overdueAmount', overdue_amount
    )
    from payment_metrics
  ),
  'revenue',
  coalesce(
    (
      select jsonb_agg(
        jsonb_build_object(
          'month', to_char(month_start, 'YYYY-MM-DD'),
          'revenue', revenue
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
          'id', id,
          'title', title,
          'clientName', client_name,
          'status', status,
          'createdAt', created_at,
          'value', value
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
          'id', id,
          'clientName', client_name,
          'projectName', project_name,
          'amount', amount,
          'dueDate', to_char(due_date, 'YYYY-MM-DD'),
          'status', status
        )
        order by due_date asc, created_at desc
      )
      from payment_alerts
    ),
    '[]'::jsonb
  )
);
$$;

grant execute on function public.get_dashboard_snapshot() to authenticated;
grant execute on function public.get_dashboard_snapshot() to service_role;

drop function if exists public.get_client_details_snapshot(uuid);

create or replace function public.get_client_details_snapshot(p_client_id uuid)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
with selected_client as (
  select *
  from public.clients
  where id = p_client_id
    and user_id = auth.uid()
),
client_projects as (
  select project.*
  from public.projects project
  join selected_client client
    on client.id = project.client_id
  where project.user_id = auth.uid()
),
client_payments as (
  select payment.*
  from public.payments_read_model payment
  join client_projects project
    on project.id = payment.project_id
  where payment.user_id = auth.uid()
)
select case
  when not exists (select 1 from selected_client) then null
  else jsonb_build_object(
    'client',
    (
      select jsonb_build_object(
        'id', client.id,
        'name', client.name,
        'company', coalesce(client.company, ''),
        'email', client.email,
        'phone', coalesce(client.phone, ''),
        'notes', coalesce(client.notes, ''),
        'createdAt', client.created_at
      )
      from selected_client client
    ),
    'summary',
    jsonb_build_object(
      'totalContracted', coalesce((select sum(value) from client_projects), 0),
      'totalReceived', coalesce((select sum(amount) from client_payments where status = 'paid'), 0),
      'totalPending', coalesce((select sum(amount) from client_payments where status = 'pending'), 0),
      'totalOverdue', coalesce((select sum(amount) from client_payments where status = 'overdue'), 0),
      'totalOutstanding', coalesce((select sum(amount) from client_payments where status in ('pending', 'overdue')), 0),
      'completedProjects', coalesce((select count(*) from client_projects where status = 'completed'), 0)
    ),
    'projects',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'clientId', client_id,
            'name', name,
            'description', coalesce(description, ''),
            'value', value,
            'deadline', coalesce(to_char(deadline, 'YYYY-MM-DD'), ''),
            'status', status,
            'createdAt', created_at
          )
          order by created_at desc
        )
        from client_projects
      ),
      '[]'::jsonb
    ),
    'payments',
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', id,
            'projectId', project_id,
            'amount', amount,
            'dueDate', to_char(due_date, 'YYYY-MM-DD'),
            'paidAt', case
              when paid_at is null then null
              else to_char(paid_at, 'YYYY-MM-DD')
            end,
            'status', status,
            'method', method,
            'notes', coalesce(notes, ''),
            'createdAt', created_at
          )
          order by created_at desc
        )
        from client_payments
      ),
      '[]'::jsonb
    )
  )
end;
$$;

grant execute on function public.get_client_details_snapshot(uuid) to authenticated;
grant execute on function public.get_client_details_snapshot(uuid) to service_role;
