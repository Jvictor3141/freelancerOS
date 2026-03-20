begin;

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

commit;
