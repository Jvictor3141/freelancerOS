import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CreditCard,
  FolderKanban,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import freelancerosLogo from '../assets/freelanceros-logo.svg';

const featureCards = [
  {
    title: 'Operação em um único painel',
    description:
      'Clientes, projetos, propostas e pagamentos ficam conectados no mesmo fluxo.',
    icon: FolderKanban,
  },
  {
    title: 'Decisão com base no que está acontecendo',
    description:
      'Dashboard com visão clara de pipeline, entregas e financeiro sem depender de planilhas paralelas.',
    icon: ChartNoAxesCombined,
  },
  {
    title: 'Acesso protegido por conta',
    description:
      'Cada dado fica vinculado ao usuário autenticado, com policies do Supabase protegendo a base.',
    icon: ShieldCheck,
  },
];

const workflowSteps = [
  {
    title: 'Organize os contatos',
    description:
      'Cadastre clientes com contexto comercial e mantenha o relacionamento centralizado.',
    icon: Users,
  },
  {
    title: 'Converta em projetos',
    description:
      'Transforme propostas em execução com status, prazo, valor e próxima ação claros.',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Acompanhe os recebimentos',
    description:
      'Controle pagamentos previstos, pendentes e concluídos sem improviso.',
    icon: CreditCard,
  },
];

const metrics = [
  { value: '4 frentes', label: 'clientes, projetos, propostas e pagamentos' },
  { value: '1 conta', label: 'dados isolados por usuário autenticado' },
  { value: '0 planilhas soltas', label: 'operação concentrada no mesmo lugar' },
];

export function LandingPage() {
  return (
    <div
      id="top"
      className="motion-page min-h-screen bg-transparent text-slate-900"
    >
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_top_left,rgba(99,91,255,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.72))]" />
        <div className="absolute left-1/2 top-28 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />

        <header className="sticky top-0 z-30 border-b border-white/60 bg-white/75 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-full px-2 py-1"
            >
              <img
                src={freelancerosLogo}
                alt="FreelancerOS"
                className="h-9 w-auto sm:h-10"
              />
            </Link>

            <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
              <a href="#produto" className="transition hover:text-slate-950">
                Produto
              </a>
              <a href="#fluxo" className="transition hover:text-slate-950">
                Fluxo
              </a>
              <a href="#seguranca" className="transition hover:text-slate-950">
                Segurança
              </a>
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login?mode=sign_in"
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              >
                Entrar
              </Link>
              <Link
                to="/login?mode=sign_up"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#635bff] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Registrar
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </header>

        <main className="px-5 pb-14 pt-6 sm:px-8 lg:px-10 lg:pb-20 lg:pt-10">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:gap-12">
            <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:gap-12">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm shadow-slate-200/70 backdrop-blur">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#635bff] text-white shadow-lg shadow-indigo-200">
                    <BadgeCheck size={18} />
                  </span>
                  Sistema operacional para freelancers e operações enxutas
                </div>

                <div className="max-w-3xl space-y-4">
                  <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                    Apresente, organize e acompanhe seu negócio em um único
                    lugar.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                    O FreelancerOS centraliza o trabalho comercial e
                    operacional para quem precisa vender, executar e receber sem
                    fragmentar o processo entre apps soltos.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/login?mode=sign_up"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#635bff] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(99,91,255,0.28)] transition hover:-translate-y-0.5 hover:brightness-105"
                  >
                    Criar conta
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/login?mode=sign_in"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/85 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200/70 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    Entrar no painel
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {metrics.map(({ value, label }) => (
                    <article
                      key={value}
                      className="motion-surface rounded-[28px] border border-slate-200 bg-white/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur"
                    >
                      <p className="text-2xl font-semibold tracking-tight text-slate-950">
                        {value}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {label}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-6 top-8 hidden h-24 w-24 rounded-full bg-sky-200/40 blur-2xl sm:block" />
                <div className="absolute -right-4 bottom-6 hidden h-28 w-28 rounded-full bg-indigo-200/60 blur-2xl sm:block" />

                <div className="relative overflow-hidden rounded-[36px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)] sm:p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(99,91,255,0.38),transparent_30%)]" />

                  <div className="relative space-y-5">
                    <div className="flex items-center justify-between gap-4 rounded-[28px] border border-white/10 bg-white/8 p-4 backdrop-blur">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                          Visão central
                        </p>
                        <p className="mt-2 text-lg font-semibold">
                          Painel operacional pronto para uso
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#635bff] shadow-lg shadow-indigo-950/30">
                        <ChartNoAxesCombined size={22} />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <article className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur">
                        <p className="text-sm font-medium text-white/70">
                          Pipeline
                        </p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">
                          Propostas e projetos
                        </p>
                        <p className="mt-3 text-sm leading-6 text-white/70">
                          Entenda o que está em negociação, execução ou pronto
                          para faturar.
                        </p>
                      </article>

                      <article className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur">
                        <p className="text-sm font-medium text-white/70">
                          Financeiro
                        </p>
                        <p className="mt-3 text-3xl font-semibold tracking-tight">
                          Receitas sob controle
                        </p>
                        <p className="mt-3 text-sm leading-6 text-white/70">
                          Evite esquecimentos e acompanhe pendências com mais
                          clareza.
                        </p>
                      </article>
                    </div>

                    <div className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur">
                      <p className="text-sm font-medium text-white/70">
                        Estrutura do produto
                      </p>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {workflowSteps.map(({ title, icon: Icon }) => (
                          <div
                            key={title}
                            className="rounded-3xl border border-white/8 bg-black/18 p-4"
                          >
                            <div className="inline-flex rounded-2xl bg-white/12 p-3 text-white">
                              <Icon size={18} />
                            </div>
                            <p className="mt-4 text-sm font-semibold leading-6">
                              {title}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section
              id="produto"
              className="grid gap-4 lg:grid-cols-3"
            >
              {featureCards.map(({ title, description, icon: Icon }) => (
                <article
                  key={title}
                  className="motion-surface rounded-[32px] border border-slate-200 bg-white/82 p-6 shadow-[0_24px_56px_rgba(15,23,42,0.06)] backdrop-blur"
                >
                  <div className="inline-flex rounded-2xl bg-indigo-50 p-3 text-[#635bff] shadow-sm shadow-slate-200">
                    <Icon size={20} />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
                    {title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {description}
                  </p>
                </article>
              ))}
            </section>

            <section
              id="fluxo"
              className="grid gap-6 rounded-[36px] border border-slate-200 bg-white/78 p-6 shadow-[0_24px_64px_rgba(15,23,42,0.06)] backdrop-blur lg:grid-cols-[0.9fr_1.1fr] lg:p-8"
            >
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Como funciona
                </p>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  O projeto organiza a rotina comercial e operacional em etapas
                  simples.
                </h2>
                <p className="text-sm leading-7 text-slate-600 sm:text-base">
                  Em vez de abrir uma ferramenta para cada parte do processo, o
                  FreelancerOS junta cadastro, execução e recebimento em uma
                  mesma experiência.
                </p>
              </div>

              <div className="grid gap-4">
                {workflowSteps.map(({ title, description, icon: Icon }, index) => (
                  <article
                    key={title}
                    className="flex gap-4 rounded-[28px] border border-slate-200 bg-slate-50/85 p-5"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-[#635bff] shadow-sm shadow-slate-200">
                      <Icon size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        Etapa {index + 1}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="seguranca"
              className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]"
            >
              <article className="overflow-hidden rounded-[36px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.14)] sm:p-8">
                <div className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/55">
                    Segurança e estrutura
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    O acesso ao painel depende da conta autenticada.
                  </h2>
                  <p className="max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                    O projeto usa Supabase para sessão e armazenamento, mantendo
                    os dados vinculados ao usuário logado e respeitando as
                    regras de acesso do banco.
                  </p>
                </div>
              </article>

              <div className="grid gap-4">
                <article className="rounded-[32px] border border-slate-200 bg-white/82 p-6 shadow-[0_24px_56px_rgba(15,23,42,0.06)] backdrop-blur">
                  <div className="inline-flex rounded-2xl bg-indigo-50 p-3 text-[#635bff] shadow-sm shadow-slate-200">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
                    Dados vinculados ao usuário
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Cada sessão carrega apenas o que pertence à conta ativa,
                    reduzindo mistura de dados entre ambientes ou usuários.
                  </p>
                </article>

                <article className="rounded-[32px] border border-slate-200 bg-white/82 p-6 shadow-[0_24px_56px_rgba(15,23,42,0.06)] backdrop-blur">
                  <div className="inline-flex rounded-2xl bg-indigo-50 p-3 text-[#635bff] shadow-sm shadow-slate-200">
                    <BriefcaseBusiness size={20} />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
                    Fluxo consistente do login ao dashboard
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Quem não está autenticado conhece o projeto pela landing. Ao
                    entrar, o sistema leva direto ao painel principal.
                  </p>
                </article>
              </div>
            </section>

            <section className="rounded-[36px] border border-slate-200 bg-[linear-gradient(135deg,rgba(99,91,255,0.95),rgba(79,70,229,0.92))] p-6 text-white shadow-[0_28px_70px_rgba(79,70,229,0.28)] sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                    Pronto para entrar
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Acesse o FreelancerOS e centralize a apresentação do seu
                    trabalho.
                  </h2>
                  <p className="text-sm leading-7 text-white/80 sm:text-base">
                    Se você já tem conta, entre no painel. Se ainda não tem,
                    abra o fluxo de cadastro em um clique.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/login?mode=sign_in"
                    className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/16"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/login?mode=sign_up"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#4f46e5] shadow-lg shadow-indigo-950/20 transition hover:-translate-y-0.5"
                  >
                    Registrar agora
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </main>

        <footer className="border-t border-slate-200/70 bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(12rem,0.8fr)_minmax(12rem,0.8fr)]">
              <div className="space-y-4">
                <img
                  src={freelancerosLogo}
                  alt="FreelancerOS"
                  className="h-10 w-auto brightness-0 invert"
                />
                <p className="max-w-xl text-sm leading-7 text-white/72">
                  FreelancerOS organiza apresentação comercial, execução de
                  projetos e controle financeiro em uma experiência única para
                  operações enxutas.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
                  Navegação
                </p>
                <div className="mt-4 flex flex-col gap-3 text-sm text-white/72">
                  <a href="#produto" className="transition hover:text-white">
                    Produto
                  </a>
                  <a href="#fluxo" className="transition hover:text-white">
                    Fluxo
                  </a>
                  <a href="#seguranca" className="transition hover:text-white">
                    Segurança
                  </a>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
                  Acesso
                </p>
                <div className="mt-4 flex flex-col gap-3 text-sm">
                  <Link
                    to="/login?mode=sign_in"
                    className="text-white/72 transition hover:text-white"
                  >
                    Entrar no painel
                  </Link>
                  <Link
                    to="/login?mode=sign_up"
                    className="text-white/72 transition hover:text-white"
                  >
                    Criar conta
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} FreelancerOS. Todos os direitos reservados.</p>
              <a href="#top" className="transition hover:text-white">
                Voltar ao topo
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
