import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  CheckCircle2,
  Clock3,
  CreditCard,
  FolderKanban,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';

type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

type SimpleCard = {
  title: string;
  description: string;
};

type IconCard = SimpleCard & {
  icon: LucideIcon;
};

type FeatureCard = {
  eyebrow: string;
  title: string;
  description: string;
  benefit: string;
  icon: LucideIcon;
};

type PreviewPayment = {
  client: string;
  amount: string;
  detail: string;
  status: string;
  tone: StatusTone;
};

type PreviewProject = {
  title: string;
  client: string;
  status: string;
  tone: StatusTone;
};

const heroPoints = [
  'Clientes, projetos e pagamentos no mesmo fluxo.',
  'Visão rápida do que está pendente, em andamento e recebido.',
  'Menos planilha, menos WhatsApp perdido, mais clareza.',
];

const painCards: SimpleCard[] = [
  {
    title: 'Cobrança esquecida no meio da correria',
    description:
      'Você entrega, troca de contexto e percebe tarde demais que faltou cobrar ou confirmar um pagamento.',
  },
  {
    title: 'Financeiro sem status confiável',
    description:
      'Parte está na planilha, parte no banco e parte no WhatsApp. No fim, ninguém sabe ao certo o que já entrou.',
  },
  {
    title: 'Clientes e projetos espalhados',
    description:
      'Briefing, valor, prazo e histórico ficam quebrados entre vários lugares e o contexto se perde.',
  },
  {
    title: 'Dia sem visão clara de prioridade',
    description:
      'Sem um painel central, você gasta tempo descobrindo o que está em andamento e quem precisa de retorno.',
  },
];

const solutionCards: IconCard[] = [
  {
    title: 'Clientes organizados',
    description: 'Cada cliente com histórico, contexto e relacionamento no mesmo lugar.',
    icon: Users,
  },
  {
    title: 'Projetos vinculados',
    description: 'Escopo, valor e andamento ligados ao cliente certo, sem ruído.',
    icon: FolderKanban,
  },
  {
    title: 'Pagamentos com status',
    description: 'Recebido, pendente e atrasado ficam claros para você agir no tempo certo.',
    icon: CreditCard,
  },
  {
    title: 'Painel com visão objetiva',
    description: 'Você abre o sistema e entende rápido onde está o dinheiro e onde está o trabalho.',
    icon: ChartNoAxesCombined,
  },
];

const featureCards: FeatureCard[] = [
  {
    eyebrow: 'Gestão de clientes',
    title: 'Menos tempo procurando contexto antes de responder',
    description:
      'Centralize nome, serviço, histórico e observações para saber com quem você está lidando e em que pé a relação está.',
    benefit: 'Benefício direto: menos retrabalho para retomar conversas e próximos passos.',
    icon: Users,
  },
  {
    eyebrow: 'Gestão de projetos',
    title: 'Cada entrega ligada ao cliente, valor e status corretos',
    description:
      'Organize projetos com prazo, escopo e andamento visíveis sem depender de memória ou anotação solta.',
    benefit: 'Benefício direto: você sabe o que está em execução e o que precisa avançar.',
    icon: BriefcaseBusiness,
  },
  {
    eyebrow: 'Controle de pagamentos',
    title: 'Cobranças deixam de depender de conferência manual',
    description:
      'Acompanhe pagamentos previstos, pendentes e atrasados com um status claro para agir antes que a receita escape.',
    benefit: 'Benefício direto: mais clareza para cobrar no momento certo e fechar o mês.',
    icon: CreditCard,
  },
  {
    eyebrow: 'Dashboard',
    title: 'Visão consolidada para decidir sem abrir cinco ferramentas',
    description:
      'Tenha métricas e alertas para enxergar rapidamente clientes ativos, projetos em andamento e valores que ainda não entraram.',
    benefit: 'Benefício direto: prioridade diária e visão financeira no mesmo lugar.',
    icon: ChartNoAxesCombined,
  },
];

const benefits = [
  'Você para de descobrir cobranças atrasadas tarde demais.',
  'Seu financeiro fica claro: recebido, pendente e atrasado.',
  'A operação deixa de depender de planilha, memória e conversa solta.',
  'Sua gestão fica mais profissional sem criar um processo pesado.',
];

const previewPayments: PreviewPayment[] = [
  {
    client: 'Studio Norte',
    amount: 'R$ 2.400',
    detail: 'vence hoje',
    status: 'Pendente',
    tone: 'warning',
  },
  {
    client: 'Ateliê Aurora',
    amount: 'R$ 3.200',
    detail: 'recebido ontem',
    status: 'Pago',
    tone: 'success',
  },
  {
    client: 'Clínica Prisma',
    amount: 'R$ 1.800',
    detail: 'atrasado 4 dias',
    status: 'Atrasado',
    tone: 'danger',
  },
];

const previewProjects: PreviewProject[] = [
  {
    title: 'Redesign do site',
    client: 'Clínica Prisma',
    status: 'Em andamento',
    tone: 'warning',
  },
  {
    title: 'Pacote de social media',
    client: 'Studio Norte',
    status: 'Em revisão',
    tone: 'neutral',
  },
  {
    title: 'Branding completo',
    client: 'Ateliê Aurora',
    status: 'Pronto para cobrar',
    tone: 'success',
  },
];

const footerLinks = [
  { label: 'Problema', href: '#problema' },
  { label: 'Solução', href: '#solucao' },
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Demonstração', href: '#demo' },
];

function LandingBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="landing-ambient-base absolute inset-0" />
      <div className="landing-ambient-wave absolute inset-0" />
      <div className="landing-ambient-orb landing-ambient-orb-one" />
      <div className="landing-ambient-orb landing-ambient-orb-two" />
      <div className="landing-ambient-orb landing-ambient-orb-three" />
      <div className="landing-ambient-vignette absolute inset-0" />
    </div>
  );
}

export function LandingPage() {
  return (
    <div
      id="top"
      className="motion-page relative isolate min-h-screen bg-transparent text-slate-900"
    >
      <LandingBackground />
      <div className="relative z-10 overflow-hidden">
        <header className="sticky top-0 z-30 border-b border-white/70 bg-white/78 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
            <Link to="/" className="inline-flex items-center rounded-full px-2 py-1">
              <BrandLogo variant="lockup" className="h-7 w-auto sm:h-8" />
            </Link>

            <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex">
              {footerLinks.map(({ label, href }) => (
                <a key={label} href={href} className="transition hover:text-slate-950">
                  {label}
                </a>
              ))}
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
                Criar conta
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </header>

        <main className="px-5 pb-16 pt-6 sm:px-8 lg:px-10 lg:pb-24 lg:pt-10">
          <div className="page-stack mx-auto flex max-w-7xl flex-col gap-18 lg:gap-24">
            <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.96fr)] lg:gap-12">
              <div className="space-y-7">
                <div className="inline-flex items-start gap-3 rounded-full border border-slate-200 bg-white/84 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm shadow-slate-200/70 backdrop-blur sm:items-center">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#635bff] text-white shadow-lg shadow-indigo-200">
                    <BadgeCheck size={18} />
                  </span>
                  Controle operacional para freelancers que trabalham por projeto
                </div>

                <div className="max-w-3xl space-y-4">
                  <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                    Pare de perder cobranças, projetos e contexto no meio da bagunça.
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                    O FreelancerOS organiza clientes, projetos e pagamentos em um único painel
                    para você saber, sem caçar informação, o que está em andamento, o que falta
                    cobrar e o que já entrou.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/login?mode=sign_up"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#635bff] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(99,91,255,0.28)] transition hover:-translate-y-0.5 hover:brightness-105"
                  >
                    Criar minha conta
                    <ArrowRight size={16} />
                  </Link>
                  <a
                    href="#demo"
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white/88 px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200/70 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    Ver o produto por dentro
                  </a>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {heroPoints.map((item) => (
                    <article
                      key={item}
                      className="motion-surface rounded-[28px] border border-slate-200 bg-white/82 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur"
                    >
                      <div className="inline-flex rounded-2xl bg-indigo-50 p-2 text-[#635bff] shadow-sm shadow-slate-200">
                        <CheckCircle2 size={18} />
                      </div>
                      <p className="mt-4 text-sm leading-7 text-slate-600">{item}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="relative rounded-[36px] border border-slate-200 bg-white/88 p-5 shadow-[0_28px_80px_rgba(15,23,42,0.1)] backdrop-blur sm:p-6">
                <div className="mb-5 space-y-2">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Exemplo visual do painel
                  </p>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                    O tipo de visão que evita cobrança esquecida e operação espalhada.
                  </h2>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    { label: 'Recebido no mês', value: 'R$ 14.800', detail: 'valor confirmado', icon: BadgeCheck },
                    { label: 'Cobranças pendentes', value: '3', detail: 'pedem ação hoje', icon: Clock3 },
                    { label: 'Projetos em andamento', value: '5', detail: 'com status visível', icon: FolderKanban },
                  ].map(({ label, value, detail, icon: Icon }) => (
                    <article key={label} className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
                      <div className="inline-flex rounded-2xl bg-white p-2 text-[#635bff] shadow-sm shadow-slate-200">
                        <Icon size={16} />
                      </div>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        {label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                        {value}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{detail}</p>
                    </article>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)]">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-100">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-500">Pagamentos que pedem ação</p>
                        <p className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                          Quem precisa ser cobrado hoje
                        </p>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 self-start items-center justify-center rounded-2xl bg-indigo-50 text-[#635bff] shadow-sm shadow-slate-200">
                        <CreditCard size={18} />
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {previewPayments.map(({ client, amount, detail, status, tone }) => (
                        <div
                          key={`${client}-${status}`}
                          className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">{client}</p>
                              <p className="mt-1 text-sm text-slate-500">{detail}</p>
                            </div>
                            <StatusPill label={status} tone={tone} />
                          </div>
                          <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
                            {amount}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-slate-900 bg-slate-950 p-5 text-white shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white/60">Projetos ativos</p>
                        <p className="mt-1 text-lg font-semibold tracking-tight">
                          O que está em andamento agora
                        </p>
                      </div>
                      <div className="flex h-11 w-11 shrink-0 self-start items-center justify-center rounded-2xl bg-white text-[#635bff] shadow-lg shadow-indigo-950/30">
                        <FolderKanban size={18} />
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {previewProjects.map(({ title, client, status, tone }) => (
                        <div
                          key={`${title}-${client}`}
                          className="rounded-2xl border border-white/10 bg-white/8 p-4"
                        >
                          <div className="flex flex-col gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold leading-6">{title}</p>
                              <p className="mt-1 text-sm text-white/65">{client}</p>
                            </div>
                            <StatusPill label={status} tone={tone} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section
              id="problema"
              className="grid gap-8 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)]"
            >
              <div className="space-y-6">
                <SectionHeader
                  eyebrow="O problema"
                  title="Quando a operação fica espalhada, o prejuízo não é só visual."
                  description="A bagunça custa tempo para encontrar contexto, atrasa cobrança e dificulta saber o que realmente precisa de atenção no dia."
                />

                <article className="rounded-4xl border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
                  <div className="inline-flex rounded-2xl bg-white/10 p-3 text-white">
                    <AlertTriangle size={20} />
                  </div>
                  <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                    Sem controle central, cobrar vira esforço manual.
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/72 sm:text-base">
                    Você acaba conferindo conversa por conversa, reabrindo planilha,
                    olhando extrato e tentando lembrar o que ainda está em aberto.
                    Isso consome tempo e aumenta a chance de deixar dinheiro passar.
                  </p>
                </article>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {painCards.map(({ title, description }) => (
                  <article
                    key={title}
                    className="motion-surface rounded-4xl border border-slate-200 bg-white/86 p-6 shadow-[0_24px_56px_rgba(15,23,42,0.06)] backdrop-blur"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Dor real
                    </p>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="solucao"
              className="rounded-[40px] border border-slate-200 bg-white/84 p-6 shadow-[0_24px_64px_rgba(15,23,42,0.06)] backdrop-blur sm:p-8"
            >
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <div className="space-y-6">
                  <SectionHeader
                    eyebrow="A solução"
                    title="O FreelancerOS junta cliente, projeto e pagamento no mesmo fluxo."
                    description="Em vez de reconstruir o contexto a cada entrega, cobrança ou fechamento do mês, você passa a operar com tudo conectado em uma única interface."
                  />

                  <div className="rounded-4xl border border-slate-200 bg-slate-50/90 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Ao abrir o painel
                    </p>
                    <div className="mt-4 grid gap-3">
                      {[
                        'Você enxerga quais cobranças estão pendentes ou atrasadas.',
                        'Você sabe quais projetos estão em andamento e com quem.',
                        'Você localiza rapidamente o contexto de cada cliente.',
                        'Você acompanha o financeiro sem depender de planilha paralela.',
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                        >
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-[#635bff] shadow-sm shadow-slate-200">
                            <CheckCircle2 size={16} />
                          </div>
                          <p className="text-sm leading-7 text-slate-600">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {solutionCards.map(({ title, description, icon: Icon }) => (
                    <article
                      key={title}
                      className="motion-surface rounded-4xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100"
                    >
                      <div className="inline-flex rounded-2xl bg-indigo-50 p-3 text-[#635bff] shadow-sm shadow-slate-200">
                        <Icon size={20} />
                      </div>
                      <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
                        {title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section id="funcionalidades" className="space-y-8">
              <SectionHeader
                eyebrow="Funcionalidades principais"
                title="Cada área do produto existe para resolver uma parte da rotina do freelancer."
                description="Aqui, a feature importa porque reduz retrabalho, melhora a visibilidade e deixa a operação menos dependente de memória."
                align="center"
              />

              <div className="grid gap-4 lg:grid-cols-2">
                {featureCards.map(({ eyebrow, title, description, benefit, icon: Icon }) => (
                  <article
                    key={title}
                    className="motion-surface rounded-4xl border border-slate-200 bg-white/86 p-6 shadow-[0_24px_56px_rgba(15,23,42,0.06)] backdrop-blur"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          {eyebrow}
                        </p>
                        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                          {title}
                        </h3>
                      </div>

                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-indigo-50 text-[#635bff] shadow-sm shadow-slate-200">
                        <Icon size={22} />
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                      {description}
                    </p>
                    <p className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 text-sm font-medium text-slate-700">
                      {benefit}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="beneficios"
              className="rounded-[40px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.16)] sm:p-8"
            >
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)]">
                <div className="space-y-5">
                  <SectionHeader
                    eyebrow="Ganhos reais"
                    title="O ganho não é só organização. É clareza para cobrar, entregar e fechar o mês."
                    description="O FreelancerOS reduz a fricção operacional para você dedicar menos energia a conferir contexto e mais energia ao trabalho que gera receita."
                    tone="dark"
                  />

                  <Link
                    to="/login?mode=sign_up"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#4f46e5] shadow-lg shadow-indigo-950/20 transition hover:-translate-y-0.5"
                  >
                    Começar agora
                    <ArrowRight size={16} />
                  </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {benefits.map((item) => (
                    <article
                      key={item}
                      className="rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur"
                    >
                      <div className="inline-flex rounded-2xl bg-white/12 p-3 text-white">
                        <CheckCircle2 size={18} />
                      </div>
                      <p className="mt-4 text-base leading-7 text-white/82">{item}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section id="demo" className="space-y-8">
              <SectionHeader
                eyebrow="Demonstração visual"
                title="Veja como o produto se organiza por dentro."
                description="A estrutura abaixo mostra como o FreelancerOS apresenta clientes, projetos e pagamentos com a mesma linguagem visual do restante do sistema."
                align="center"
              />

              <div className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
                <article className="rounded-[36px] border border-slate-200 bg-white/88 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.1)] backdrop-blur">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Dashboard
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                        O que precisa de atenção aparece sem esforço.
                      </h3>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 self-start items-center justify-center rounded-2xl bg-indigo-50 text-[#635bff] shadow-sm shadow-slate-200">
                      <ChartNoAxesCombined size={20} />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {[
                      { label: 'Recebido', value: 'R$ 14.800' },
                      { label: 'A receber', value: 'R$ 4.200' },
                      { label: 'Projetos ativos', value: '5' },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4">
                        <p className="text-sm font-medium text-slate-500">{label}</p>
                        <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <p className="min-w-0 font-semibold text-slate-900">Cobrar Studio Norte</p>
                        <StatusPill label="Hoje" tone="warning" />
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        Parcela da landing institucional em aberto.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <p className="min-w-0 font-semibold text-slate-900">Revisar entrega da Clínica Prisma</p>
                        <StatusPill label="Projeto" tone="neutral" />
                      </div>
                      <p className="mt-2 text-sm text-slate-500">
                        Página em andamento com prazo definido no painel.
                      </p>
                    </div>
                  </div>
                </article>

                <article className="rounded-[36px] border border-slate-900 bg-slate-950 p-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.18)]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/55">
                        Operação por dentro
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                        Clientes, projetos e pagamentos na mesma estrutura.
                      </h3>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 self-start items-center justify-center rounded-2xl bg-white text-[#635bff] shadow-lg shadow-indigo-950/30">
                      <Users size={20} />
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {[
                      'Ateliê Aurora · Branding e site',
                      'Studio Norte · Retainer mensal',
                      'Clínica Prisma · Landing page',
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white/82"
                      >
                        {item}
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 space-y-3">
                    {previewPayments.map(({ client, amount, detail, status, tone }) => (
                      <div
                        key={`${client}-${amount}`}
                        className="rounded-2xl border border-white/10 bg-white/8 p-4"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold">{client}</p>
                            <p className="mt-1 text-sm text-white/65">{detail}</p>
                          </div>
                          <StatusPill label={status} tone={tone} />
                        </div>
                        <p className="mt-3 text-xl font-semibold tracking-tight">{amount}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </section>

            <section className="rounded-[40px] border border-slate-200 bg-[linear-gradient(135deg,rgba(99,91,255,0.95),rgba(79,70,229,0.92))] p-6 text-white shadow-[0_28px_70px_rgba(79,70,229,0.28)] sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
                    CTA final
                  </p>
                  <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                    Se hoje seu controle depende de planilha, mensagem e memória,
                    já está custando tempo demais.
                  </h2>
                  <p className="text-sm leading-7 text-white/82 sm:text-base">
                    Centralize clientes, projetos e pagamentos no FreelancerOS para
                    trabalhar com uma visão mais clara do seu negócio desde a próxima cobrança.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/login?mode=sign_up"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#4f46e5] shadow-lg shadow-indigo-950/20 transition hover:-translate-y-0.5"
                  >
                    Criar conta
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/login?mode=sign_in"
                    className="inline-flex items-center justify-center rounded-full border border-white/18 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/16"
                  >
                    Entrar no painel
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
                <BrandLogo variant="lockup" tone="inverse" className="h-8 w-auto" />
                <p className="max-w-xl text-sm leading-7 text-white/72">
                  FreelancerOS é o painel para freelancers organizarem clientes,
                  projetos e pagamentos sem depender de planilha paralela,
                  anotação solta ou memória.
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/45">
                  Navegação
                </p>
                <div className="mt-4 flex flex-col gap-3 text-sm text-white/72">
                  {footerLinks.map(({ label, href }) => (
                    <a key={label} href={href} className="transition hover:text-white">
                      {label}
                    </a>
                  ))}
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

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
};

function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  tone = 'light',
}: SectionHeaderProps) {
  const alignmentClassName =
    align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl';
  const eyebrowClassName = tone === 'dark' ? 'text-white/55' : 'text-slate-400';
  const titleClassName = tone === 'dark' ? 'text-white' : 'text-slate-950';
  const descriptionClassName = tone === 'dark' ? 'text-white/72' : 'text-slate-600';

  return (
    <div className={['space-y-4', alignmentClassName].join(' ')}>
      <p className={['text-sm font-semibold uppercase tracking-[0.24em]', eyebrowClassName].join(' ')}>
        {eyebrow}
      </p>
      <h2 className={['text-3xl font-semibold tracking-tight sm:text-4xl', titleClassName].join(' ')}>
        {title}
      </h2>
      <p className={['text-sm leading-7 sm:text-base', descriptionClassName].join(' ')}>
        {description}
      </p>
    </div>
  );
}

type StatusPillProps = {
  label: string;
  tone: StatusTone;
};

function StatusPill({ label, tone }: StatusPillProps) {
  const toneClassName = {
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    neutral: 'bg-slate-100 text-slate-600',
  } satisfies Record<StatusTone, string>;

  return (
    <span
      className={[
        'inline-flex w-fit max-w-full shrink-0 rounded-full px-3.5 py-1.5 text-center text-xs font-semibold leading-4 whitespace-nowrap',
        toneClassName[tone],
      ].join(' ')}
    >
      {label}
    </span>
  );
}
