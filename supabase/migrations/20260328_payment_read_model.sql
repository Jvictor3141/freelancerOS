update public.payments
set status = 'paid'
where paid_at is not null
  and status <> 'paid';

update public.payments
set status = 'pending'
where status = 'overdue';

alter table public.payments
drop constraint if exists payments_status_check;

alter table public.payments
add constraint payments_status_check
check (status in ('pending', 'paid'));

drop view if exists public.payments_read_model;

create view public.payments_read_model
with (security_invoker = true) as
select
  id,
  user_id,
  project_id,
  amount,
  due_date,
  paid_at,
  case
    when paid_at is not null or status = 'paid' then 'paid'
    when due_date < timezone('America/Sao_Paulo', now())::date then 'overdue'
    else 'pending'
  end as status,
  method,
  notes,
  created_at
from public.payments;

grant select on public.payments_read_model to authenticated;
grant select on public.payments_read_model to service_role;
