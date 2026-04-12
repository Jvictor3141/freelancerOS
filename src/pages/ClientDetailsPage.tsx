import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Wallet,
} from 'lucide-react'
import { useClientDetailsData } from '../features/clients/useClientDetailsData'
import { formatCurrencyCode, formatDate } from '../utils/formatting'
import { usePreferencesStore } from '../stores/usePreferencesStore'
import {
  paymentStatusClassName,
  paymentStatusLabel,
} from '../utils/paymentStatus'
import {
  projectStatusClassName,
  projectStatusLabel,
} from '../utils/projectStatus'
import { isSupportedLanguage } from '../i18n/config'

const CLIENT_PROJECTS_VISIBLE_COUNT = 2
const CLIENT_PAYMENTS_VISIBLE_COUNT = 3
const CLIENT_DETAILS_LIST_GAP = 12
const CLIENT_PROJECT_CARD_MIN_HEIGHT = 144
const CLIENT_PAYMENT_CARD_MIN_HEIGHT = 92
const CLIENT_DETAILS_LIST_MAX_HEIGHT = Math.max(
  CLIENT_PROJECTS_VISIBLE_COUNT * CLIENT_PROJECT_CARD_MIN_HEIGHT +
    (CLIENT_PROJECTS_VISIBLE_COUNT - 1) * CLIENT_DETAILS_LIST_GAP,
  CLIENT_PAYMENTS_VISIBLE_COUNT * CLIENT_PAYMENT_CARD_MIN_HEIGHT +
    (CLIENT_PAYMENTS_VISIBLE_COUNT - 1) * CLIENT_DETAILS_LIST_GAP,
)

export function ClientDetailsPage() {
  const { t, i18n } = useTranslation()
  const { id, lang } = useParams<{ id?: string; lang?: string }>()
  const currentLang = lang && isSupportedLanguage(lang) ? lang : (i18n.resolvedLanguage ?? 'pt')
  const defaultCurrency = usePreferencesStore((s) => s.defaultCurrency)
  const navigate = useNavigate()
  const { snapshot, combinedError, hasLoadError, isLoading, retryLoad } =
    useClientDetailsData(id)

  const client = snapshot?.client ?? null
  const clientProjects = snapshot?.projects ?? []
  const clientPayments = snapshot?.payments ?? []
  const summary = snapshot?.summary ?? {
    totalContracted: 0,
    totalReceived: 0,
    totalPending: 0,
    totalOverdue: 0,
    totalOutstanding: 0,
    completedProjects: 0,
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">{t('clients.details_label')}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          {t('common.loading_db')}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {t('clients.details_loading_description')}
        </p>
      </section>
    )
  }

  if (!client) {
    return (
      <div className="page-stack space-y-6">
        {combinedError ? (
          <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>{combinedError}</div>
              {hasLoadError ? (
                <button
                  type="button"
                  onClick={() => {
                    void retryLoad()
                  }}
                  className="inline-flex w-fit items-center justify-center rounded-2xl border border-rose-300 bg-white/80 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-white"
                >
                  {t('common.retry')}
                </button>
              ) : null}
            </div>
          </section>
        ) : null}

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-100">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
            {t('clients.details_not_found_title')}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {t('clients.details_not_found_description')}
          </p>
          <button
            type="button"
            onClick={() => navigate(`/${currentLang}/clientes`)}
            className="mt-6 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white"
          >
            {t('clients.details_back_to_clients')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-stack space-y-6">
      {combinedError ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>{combinedError}</div>
            {hasLoadError ? (
              <button
                type="button"
                onClick={() => {
                  void retryLoad()
                }}
                className="inline-flex w-fit items-center justify-center rounded-2xl border border-rose-300 bg-white/80 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-white"
              >
                {t('common.retry')}
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <button
          type="button"
          onClick={() => navigate(`/${currentLang}/clientes`)}
          className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          {t('common.back')}
        </button>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">{t('clients.details_label')}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
              {client.name}
            </h1>
            <div className="mt-3 space-y-1 text-sm text-slate-500">
              <p>{client.company || t('common.no_company')}</p>
              <p className="break-all">{client.email}</p>
              <p>{client.phone || t('common.no_phone')}</p>
            </div>
          </div>

          <div className="max-w-xl rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
            <p className="font-medium text-slate-800">{t('clients.details_notes_label')}</p>
            <p className="mt-2 leading-6">
              {client.notes || t('clients.details_no_notes')}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="flex items-center">
            <div className="mr-2 inline-flex rounded-2xl bg-blue-100 p-3 text-blue-700">
              <FolderKanban size={16} />
            </div>
            <p className="text-sm font-medium text-slate-500">{t('clients.details_metric_projects')}</p>
          </div>
          <p className="mt-2 flex items-end justify-end text-lg font-semibold tracking-tight text-slate-950 sm:text-xl md:text-2xl lg:text-3xl">
            {clientProjects.length}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="flex items-center">
            <div className="mr-2 inline-flex rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <Wallet size={16} />
            </div>
            <p className="text-sm font-medium text-slate-500">{t('clients.details_metric_received')}</p>
          </div>
          <p className="mt-2 flex items-end justify-end text-lg font-semibold tracking-tight text-slate-950 sm:text-xl md:text-2xl lg:text-3xl">
            {formatCurrencyCode(summary.totalReceived, defaultCurrency)}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="flex items-center">
            <div className="mr-2 inline-flex rounded-2xl bg-amber-100 p-3 text-amber-700">
              <Clock3 size={16} />
            </div>
            <p className="text-sm font-medium text-slate-500">{t('clients.details_metric_pending')}</p>
          </div>
          <p className="mt-2 flex items-end justify-end text-lg font-semibold tracking-tight text-slate-950 sm:text-xl md:text-2xl lg:text-3xl">
            {formatCurrencyCode(summary.totalOutstanding, defaultCurrency)}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
          <div className="flex items-center">
            <div className="mr-2 inline-flex rounded-2xl bg-violet-100 p-3 text-violet-700">
              <CheckCircle2 size={16} />
            </div>
            <p className="text-sm font-medium text-slate-500">{t('clients.details_metric_completed')}</p>
          </div>
          <p className="mt-2 flex items-end justify-end text-lg font-semibold tracking-tight text-slate-950 sm:text-xl md:text-2xl lg:text-3xl">
            {summary.completedProjects}
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-sm font-medium text-slate-500">{t('clients.details_projects_label')}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              {t('clients.details_projects_heading')}
            </h2>
          </div>

          <div className="p-4">
            <div
              className="space-y-3 overflow-y-auto pr-1"
              style={{ maxHeight: `${CLIENT_DETAILS_LIST_MAX_HEIGHT}px` }}
              aria-label={t('clients.details_projects_aria')}
            >
              {clientProjects.length > 0 ? (
                clientProjects.map((project) => (
                  <div
                    key={project.id}
                    className="min-h-36 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4"
                  >
                    <div className="flex justify-between gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {project.name}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {project.description || t('clients.details_no_description')}
                        </p>
                      </div>

                      <span
                        className={`inline-flex h-6.5 shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${projectStatusClassName[project.status]}`}
                      >
                        {t(projectStatusLabel[project.status])}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                      <span>{t('clients.details_project_deadline', { date: formatDate(project.deadline, currentLang) })}</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrencyCode(project.value, project.currency)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  {t('clients.details_no_projects')}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-100">
          <div className="border-b border-slate-200 px-6 py-5">
            <p className="text-sm font-medium text-slate-500">{t('clients.details_payments_label')}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              {t('clients.details_payments_heading')}
            </h2>
          </div>

          <div className="p-4">
            <div
              className="space-y-3 overflow-y-auto pr-1"
              style={{ maxHeight: `${CLIENT_DETAILS_LIST_MAX_HEIGHT}px` }}
              aria-label={t('clients.details_payments_aria')}
            >
              {clientPayments.length > 0 ? (
                clientPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="min-h-23 rounded-2xl border border-slate-200 bg-slate-50/70 px-5 py-4"
                  >
                    <div className="flex justify-between gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">
                          {formatCurrencyCode(payment.amount, payment.currency)}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {t('clients.details_payment_due', { date: formatDate(payment.dueDate, currentLang) })}
                        </p>
                      </div>

                      <span
                        className={`inline-flex h-6.5 shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${paymentStatusClassName[payment.status]}`}
                      >
                        {t(paymentStatusLabel[payment.status])}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                  {t('clients.details_no_payments')}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
