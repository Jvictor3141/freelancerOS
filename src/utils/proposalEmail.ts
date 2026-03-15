import type { Proposal } from '../types/proposal';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function buildProposalEmail(
  proposal: Proposal,
  clientName: string,
): { subject: string; body: string } {
  const subject = `Proposta comercial - ${proposal.title}`;
  const body = [
    `Ola, ${clientName}.`,
    '',
    `Segue a proposta do projeto "${proposal.title}".`,
    '',
    `Valor: ${formatCurrency(proposal.amount)}`,
    `Prazo estimado: ${proposal.deliveryDays} dia(s)`,
    '',
    'Escopo:',
    proposal.description || 'Escopo a definir.',
    '',
    proposal.notes ? `Observacoes: ${proposal.notes}` : null,
    '',
    'Se estiver de acordo, posso marcar a proposta como aceita e gerar o projeto no painel.',
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, body };
}

export function buildMailtoLink(
  recipientEmail: string,
  subject: string,
  body: string,
) {
  const query = new URLSearchParams({
    subject,
    body,
  });

  return `mailto:${encodeURIComponent(recipientEmail)}?${query.toString()}`;
}
