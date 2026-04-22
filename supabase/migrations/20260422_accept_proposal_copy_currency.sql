-- Fix accept_proposal to copy the proposal's currency to the created project.
-- Previously the INSERT omitted currency, so projects always defaulted to 'BRL'.

create or replace function public.accept_proposal(
  p_proposal_id uuid,
  p_project_status text default 'in_progress'
)
returns public.projects
language plpgsql
as $$
declare
  v_proposal public.proposals%rowtype;
  v_project  public.projects%rowtype;
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
    currency,
    deadline,
    status
  )
  values (
    v_proposal.user_id,
    v_proposal.client_id,
    v_proposal.title,
    v_proposal.description,
    v_proposal.amount,
    v_proposal.currency,
    current_date + v_proposal.delivery_days,
    p_project_status
  )
  returning *
  into v_project;

  update public.proposals
  set
    status                  = 'accepted',
    accepted_at             = timezone('utc', now()),
    rejected_at             = null,
    client_responded_at     = null,
    client_response_channel = null,
    project_id              = v_project.id
  where id = p_proposal_id
    and user_id = auth.uid();

  return v_project;
end;
$$;

grant execute on function public.accept_proposal(uuid, text) to authenticated;
