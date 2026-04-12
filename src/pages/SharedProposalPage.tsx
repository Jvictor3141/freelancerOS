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
import { useTranslation } from 'react-i18next';
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
} from '../features/proposals/proposalRules';

function getTokenFromHash() {
  if (typeof window === 'undefined') {
    return '';
  }

  // O token fica no hash para não ir ao servidor nem aparecer em logs e referrers.
  // Se a URL vier malformada, tratamos como link inválido em vez de quebrar a tela.
  try {
    return decodeURIComponent(window.location.hash.replace(/^#/, '').trim());
  } catch {
    return '';
  }
}

export function SharedProposalPage() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.resolvedLanguage ?? 'pt';
  const { shareId = '' } = useParams();
  const [proposal, setProposal] = useState<SharedProposal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const token = getTokenFromHash();

    if (!shareId || !token) {
      setError(t('proposals.shared_invalid_link'));
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
            : t('proposals.shared_load_error'),
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
  }, [shareId, t]);

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
      setError(t('proposals.shared_invalid_link'));
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
          : t('proposals.shared_response_error'),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isAccepted = proposal ? isAcceptedProposal(proposal) : false;
  const isRejected = proposal ? isRejectedProposal(proposal) : false;
  const seoTitle = loading
    ? t('proposals.shared_seo_title')
    : error
      ? t('proposals.shared_seo_title_error')
      : proposal
        ? `${proposal.title} | FreelancerOS`
        : t('proposals.shared_seo_title');
  const seoDescription = error
    ? t('proposals.shared_seo_description_error')
    : proposal
      ? t('proposals.shared_seo_description_proposal')
      : t('proposals.shared_seo_description_loading');

  return (
    <>
      {/* Esse link e privado e protegido por token; manter fora do indice evita
          descoberta acidental por crawler caso a URL seja compartilhada indevidamente. */}
      <Seo
        title={seoTitle}
        description={seoDescription}
        robots="noindex, nofollow"
        canonical={null}
      />
      <div className="motion-page min-h-screen bg-transparent px-5 py-6 text-slate-900 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="rounded-[30px] border border-slate-200 bg-white/85 px-5 py-4 shadow-sm shadow-slate-100 backdrop-blur sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <BrandLogo variant="lockup" className="h-8 w-auto" />
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              <ShieldCheck size={16} />
              {t('proposals.shared_protected_badge')}
            </div>
          </div>
        </header>

        {loading ? (
          <section className="rounded-4xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <p className="text-sm font-medium text-slate-500">
              {t('proposals.shared_loading_label')}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              {t('proposals.shared_loading_heading')}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {t('proposals.shared_loading_description')}
            </p>
          </section>
        ) : error ? (
          <section className="rounded-4xl border border-rose-200 bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
            <div className="inline-flex rounded-2xl bg-rose-50 p-3 text-rose-700">
              <AlertTriangle size={20} />
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
              {t('proposals.shared_link_unavailable')}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              {error}
            </p>
          </section>
        ) : proposal ? (
          <>
            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <article className="overflow-hidden rounded-[34px] bg-[#635bff] p-5 text-white shadow-[0_28px_70px_rgba(99,91,255,0.28)] sm:p-8">
                <p className="text-sm font-medium text-indigo-100/90">
                  {t('proposals.shared_commercial_label')}
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {proposal.title}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-100/90 sm:text-base">
                  {freelancerIntro || t('proposals.shared_default_intro')}
                </p>

                <div className="mt-5 grid gap-2 grid-cols-3">
                  <div className="rounded-3xl bg-white/12 p-3 backdrop-blur-sm">
                    <div className='flex items-center'>
                      <div className="mr-0.5 md:mr-2 inline-flex rounded-2xl bg-white/12 p-2">
                        <FileText size={15} />
                      </div>
                      <p className="text-sm max-[374px]:hidden text-indigo-100">{t('proposals.shared_value_label')}</p>
                    </div>
                    <p className="mt-2 text-1xl font-semibold">
                      {formatCurrency(proposal.amount, currentLang)}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-white/12 p-3 backdrop-blur-sm">
                    <div className='flex items-center'>
                      <div className="mr-0.5 md:mr-2 inline-flex rounded-2xl bg-white/12 p-2">
                        <Clock3 size={15} />
                      </div>
                      <p className="text-sm max-[374px]:hidden text-indigo-100">{t('proposals.shared_deadline_label')}</p>
                    </div>
                    <p className="mt-2 text-1xl font-semibold">
                      {t('proposals.delivery_days', { count: proposal.deliveryDays })}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-white/12 p-3 backdrop-blur-sm">
                    <div className='flex items-center'>
                      <div className="mr-0.5 md:mr-2 inline-flex rounded-2xl bg-white/12 p-2">
                        {isAccepted ? (
                          <CheckCircle2 size={15} />
                        ) : isRejected ? (
                          <XCircle size={15} />
                        ) : (
                          <ShieldCheck size={15} />
                        )}
                      </div>
                      <p className="text-sm max-[374px]:hidden text-indigo-100">Status</p>
                    </div>
                    <p className="mt-2 text-xs font-semibold">
                      {isAccepted
                        ? t('proposals.notification_accepted_badge')
                        : isRejected
                          ? t('proposals.notification_rejected_badge')
                          : t('proposals.shared_awaiting_response')}
                    </p>
                  </div>
                </div>
              </article>

              <article className="rounded-[34px] border border-slate-200 bg-white/88 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                <p className="text-sm font-medium text-slate-500">
                  {t('proposals.shared_response_label')}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {proposal.canRespond
                    ? t('proposals.shared_response_heading')
                    : isAccepted
                      ? t('proposals.shared_already_accepted')
                      : isRejected
                        ? t('proposals.shared_already_rejected')
                        : t('proposals.shared_no_more_responses')}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {t('proposals.shared_link_expires', { date: formatDateTime(proposal.expiresAt, currentLang) })}
                </p>

                {proposal.clientRespondedAt ? (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {t('proposals.shared_last_response', { date: formatDateTime(proposal.clientRespondedAt, currentLang) })}
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
                      {t('proposals.shared_accept_button')}
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
                      {t('proposals.shared_reject_button')}
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
                      ? t('proposals.shared_accepted_info')
                      : isRejected
                        ? t('proposals.shared_rejected_info')
                        : t('proposals.shared_expired_info')}
                  </div>
                )}
              </article>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <article className="rounded-4xl border border-slate-200 bg-white/88 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                <p className="text-sm font-medium text-slate-500">{t('proposals.scope_label')}</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {t('proposals.shared_scope_heading')}
                </h2>
                <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50/85 p-5 text-sm leading-7 text-slate-700">
                  {proposal.description || t('proposals.shared_scope_empty')}
                </div>
              </article>

              <article className="rounded-4xl border border-slate-200 bg-white/88 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
                <p className="text-sm font-medium text-slate-500">
                  {t('proposals.shared_sender_label')}
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {proposal.freelancerProfile.displayName || 'Freelancer'}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {t('proposals.shared_prepared_for', {
                    name: proposal.clientName,
                    company: proposal.clientCompany ? ` · ${proposal.clientCompany}` : '',
                  })}
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
