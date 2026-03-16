import type { Proposal } from '../types/proposal';
import type { FreelancerProfile } from '../types/freelancerProfile';
import {
  buildFreelancerIntro,
  buildFreelancerSignatureLines,
} from './freelancerProfile';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function buildProposalEmail(
  proposal: Proposal,
  clientName: string,
  senderProfile?: FreelancerProfile | null,
): { subject: string; body: string } {
  const subject = `Proposta comercial - ${proposal.title}`;
  const freelancerIntro = senderProfile
    ? buildFreelancerIntro(senderProfile)
    : '';
  const signatureLines = senderProfile
    ? buildFreelancerSignatureLines(senderProfile)
    : [];
  const body = [
    `Olá, ${clientName}.`,
    '',
    freelancerIntro || null,
    freelancerIntro ? '' : null,
    `Segue a proposta do projeto "${proposal.title}".`,
    '',
    `Valor: ${formatCurrency(proposal.amount)}`,
    `Prazo estimado: ${proposal.deliveryDays} dia(s)`,
    '',
    'Escopo:',
    proposal.description || 'Escopo a definir.',
    '',
    proposal.notes ? `Observações: ${proposal.notes}` : null,
    '',
    'Se estiver de acordo, posso marcar a proposta como aceita e gerar o projeto no painel.',
    signatureLines.length > 0 ? '' : null,
    ...signatureLines,
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
  const normalizedRecipientEmail = recipientEmail.trim();
  const query = [
    `subject=${encodeMailtoValue(subject)}`,
    `body=${encodeMailtoValue(body)}`,
  ].join('&');

  return `mailto:${normalizedRecipientEmail}?${query}`;
}

function encodeMailtoValue(value: string) {
  return encodeURIComponent(value).replace(/%0A/g, '%0D%0A');
}
