import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { Seo } from '../seo/Seo';
import { formatCurrency, formatDateTime } from '../utils/formatting';
import {
  getSharedProposal,
  respondToSharedProposal,
} from '../services/proposalShareService';
import type { SharedProposal } from '../types/sharedProposal';
import {
  buildFreelancerIntro,
  buildFreelancerSignatureLines,
} from '../utils/freelancerProfile';
import {
  isAcceptedProposal,
  isRejectedProposal,
} from '../utils/proposalRules';

function getTokenFromHash() {
  if (typeof window === 'undefined') {
    return '';
  }

  return decodeURIComponent(window.location.hash.replace(/^#/, '').trim());
}

export function SharedProposalPage() {
  const { shareId = '' } = useParams();
  const [proposal, setProposal] = useState<SharedProposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = getTokenFromHash();

    if (!shareId || !token) {
      setError(
        'Esse link está incompleto ou inválido. Solicite um novo link ao freelancer.',
      );
      setLoading(false);
      return;
    }

    let isMounted = true;

    void getSharedProposal(shareId, token)
      .then((sharedProposal) => {
        if (!isMounted) {
          return;
        }

        setProposal(sharedProposal);
        setError(null);
      })
      .catch((currentError) => {
        if (!isMounted) {
          return;
        }

        setError(
          currentError instanceof Error
            ? currentError.message
            : 'Não foi possível carregar a proposta compartilhada.',
        );
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [shareId]);

  const freelancerIntro = useMemo(() => {
    if (!proposal) {
      return '';
    }

    return buildFreelancerIntro(proposal.freelancerProfile);
  }, [proposal]);

  const freelancerSignatureLines = useMemo(() => {
    if (!proposal) {
      return [];
    }

    return buildFreelancerSignatureLines(proposal.freelancerProfile);
  }, [proposal]);

  async function handleDecision(decision: 'accept' | 'reject') {
    const token = getTokenFromHash();

    if (!shareId || !token) {
      setError(
        'Esse link está incompleto ou inválido. Solicite um novo link ao freelancer.',
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const updatedProposal = await respondToSharedProposal(
        shareId,
        token,
        decision,
      );
      setProposal(updatedProposal);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : 'Não foi possível registrar sua resposta.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isAccepted = proposal ? isAcceptedProposal(proposal) : false;
  const isRejected = proposal ? isRejectedProposal(proposal) : false;
  const seoTitle = loading
    ? 'Proposta compartilhada | FreelancerOS'
    : error
      ? 'Link indisponivel | FreelancerOS'
      : proposal
        ? `${proposal.title} | FreelancerOS`
        : 'Proposta compartilhada | FreelancerOS';
  const seoDescription = error
    ? 'Esse link de proposta nao esta disponivel no momento.'
    : proposal
      ? 'Visualize a proposta compartilhada e responda diretamente pelo FreelancerOS.'
      : 'Visualize uma proposta compartilhada no FreelancerOS.';

  return (
    <>
      <Seo
        title={seoTitle}
        description={seoDescription}
        robots="index, follow"
        canonical={null}
      />
      <div className="motion-page min-h-screen bg-transparent px-5 py-6 text-slate-900 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-[30px] border border-slate-200 bg-white/85 px-5 py-4 shadow-sm shadow-slate-100 backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <BrandLogo variant="lockup" className="h-8 w-auto" />
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              <ShieldCheck size={16} />
              Visualização compartilhada e protegida
            </div>
          </div>
        </header>

        {loading ? (
          <section className="rounded-[32px] border border-slate-200 bg-white/85 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-sm font-medium text-slate-500">
              Proposta compartilhada
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Carregando proposta...
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Validando o link seguro e preparando a visualização.
            </p>
          </section>
        ) : error ? (
          <section className="rounded-[32px] border border-rose-200 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="inline-flex rounded-2xl bg-rose-50 p-3 text-rose-700">
              <AlertTriangle size={20} />
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
              Link indisponível
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              {error}
            </p>
          </section>
        ) : proposal ? (
          <>
            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <article className="overflow-hidden rounded-[34px] bg-[#635bff] p-6 text-white shadow-[0_28px_70px_rgba(99,91,255,0.28)] sm:p-8">
                <p className="text-sm font-medium text-indigo-100/90">
                  Proposta comercial
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {proposal.title}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-100/90 sm:text-base">
                  {freelancerIntro ||
                    'Você recebeu uma proposta comercial compartilhada com acesso protegido por link seguro.'}
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
                    <div className="mb-3 inline-flex rounded-2xl bg-white/12 p-2">
                      <FileText size={18} />
                    </div>
                    <p className="text-sm text-indigo-100/90">Valor</p>
                    <p className="mt-2 text-2xl font-semibold">
                      {formatCurrency(proposal.amount)}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
                    <div className="mb-3 inline-flex rounded-2xl bg-white/12 p-2">
                      <Clock3 size={18} />
                    </div>
                    <p className="text-sm text-indigo-100/90">Prazo</p>
                    <p className="mt-2 text-2xl font-semibold">
                      {proposal.deliveryDays} dia(s)
                    </p>
                  </div>

                  <div className="rounded-3xl bg-white/12 p-4 backdrop-blur-sm">
                    <div className="mb-3 inline-flex rounded-2xl bg-white/12 p-2">
                      {isAccepted ? (
                        <CheckCircle2 size={18} />
                      ) : isRejected ? (
                        <XCircle size={18} />
                      ) : (
                        <ShieldCheck size={18} />
                      )}
                    </div>
                    <p className="text-sm text-indigo-100/90">Status</p>
                    <p className="mt-2 text-lg font-semibold">
                      {isAccepted
                        ? 'Aceita'
                        : isRejected
                          ? 'Recusada'
                          : 'Aguardando resposta'}
                    </p>
                  </div>
                </div>
              </article>

              <article className="rounded-[34px] border border-slate-200 bg-white/88 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                <p className="text-sm font-medium text-slate-500">
                  Resposta do cliente
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {proposal.canRespond
                    ? 'Analise a proposta e escolha a resposta'
                    : isAccepted
                      ? 'Essa proposta já foi aceita'
                      : isRejected
                        ? 'Essa proposta já foi recusada'
                        : 'Esse link não aceita mais respostas'}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  O link expira em {formatDateTime(proposal.expiresAt)}. Depois
                  disso, um novo link precisa ser gerado pelo freelancer.
                </p>

                {proposal.clientRespondedAt ? (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Última resposta registrada em{' '}
                    <span className="font-semibold text-slate-900">
                      {formatDateTime(proposal.clientRespondedAt)}
                    </span>
                    .
                  </div>
                ) : null}

                {proposal.canRespond ? (
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => {
                        void handleDecision('accept');
                      }}
                      disabled={isSubmitting}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#635bff] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <CheckCircle2 size={18} />
                      Aceitar proposta
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleDecision('reject');
                      }}
                      disabled={isSubmitting}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <XCircle size={18} />
                      Recusar proposta
                    </button>
                  </div>
                ) : (
                  <div
                    className={`mt-6 rounded-2xl px-4 py-4 text-sm leading-7 ${
                      isAccepted
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                        : isRejected
                          ? 'border border-rose-200 bg-rose-50 text-rose-800'
                          : 'border border-amber-200 bg-amber-50 text-amber-800'
                    }`}
                  >
                    {isAccepted
                      ? 'A proposta foi aceita e o freelancer já pode transformar esse aceite em trabalho operacional no painel.'
                      : isRejected
                        ? 'A recusa foi registrada com sucesso. Se houver uma nova versão da proposta, um novo link poderá ser compartilhado.'
                        : 'Esse link não pode mais receber respostas. Solicite um novo link se precisar revisar a proposta novamente.'}
                  </div>
                )}
              </article>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <article className="rounded-[32px] border border-slate-200 bg-white/88 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                <p className="text-sm font-medium text-slate-500">Escopo</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  O que está incluído nesta proposta
                </h2>
                <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50/85 p-5 text-sm leading-7 text-slate-700">
                  {proposal.description || 'Escopo a definir.'}
                </div>
              </article>

              <article className="rounded-[32px] border border-slate-200 bg-white/88 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                <p className="text-sm font-medium text-slate-500">
                  Quem enviou
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {proposal.freelancerProfile.displayName || 'Freelancer'}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Proposta preparada para {proposal.clientName}
                  {proposal.clientCompany ? ` · ${proposal.clientCompany}` : ''}.
                </p>

                <div className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
                  {freelancerSignatureLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </article>
            </section>
          </>
        ) : null}
        </div>
      </div>
    </>
  );
}
