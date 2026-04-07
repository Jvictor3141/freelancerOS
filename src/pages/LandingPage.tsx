import { useRef, type CSSProperties } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Smartphone,
  // Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { useScrollReveal } from '../lib/useScrollReveal';
import { Seo } from '../seo/Seo';
import mockdashboardImg from '../assets/imagens/mock-dashboard.webp';
import clientsPageImg from '../assets/imagens/clients-page.webp';
import clientsDetailsImg from '../assets/imagens/clients-details.webp';
import projectsPageImg from '../assets/imagens/projects-page.webp';
import paymentsPageImg from '../assets/imagens/payments-page.webp';
import proposalsPageImg from '../assets/imagens/proposals-page.webp';
import mobileViewImg from '../assets/imagens/mobile-viewl.webp';

// ─── Types ────────────────────────────────────────────────────────────────────

type FeatureSection = {
  number: string;
  eyebrow: string;
  title: string;
  description: string;
  benefit: string;
  imageLabel: string;
  image: string;
};

// ─── Static data ──────────────────────────────────────────────────────────────

const marqueeItems = [
  'Gestão de Clientes',
  'Controle de Pagamentos',
  'Projetos com Status',
  'Propostas Profissionais',
  'Dashboard Integrado',
  'Sem Planilha Paralela',
  'Financeiro Claro',
  'Tudo Conectado',
  'Para Freelancers',
];

const featureSections: FeatureSection[] = [
  {
    number: '01',
    eyebrow: 'Gestão de clientes',
    title: 'Cada cliente com seu contexto completo',
    description:
      'Nome, histórico, projetos e observações em um lugar. Você para de reabrir conversa para lembrar quem pediu o quê e em que prazo estava.',
    benefit: 'Menos retrabalho para retomar conversas e definir próximos passos.',
    imageLabel: 'Tela de clientes — lista com histórico e contexto completo',
    image: clientsPageImg,
  },
  {
    number: '02',
    eyebrow: 'Controle de projetos',
    title: 'Projetos com escopo, prazo e status visíveis',
    description:
      'Cada entrega vinculada ao cliente certo. Andamento, valor e prazo ficam visíveis sem depender de memória ou anotação perdida em algum lugar aleatório.',
    benefit: 'Você sabe o que está em execução e o que precisa avançar hoje.',
    imageLabel: 'Tela de projetos — escopo, status e prazo por cliente',
    image: projectsPageImg,
  },
  {
    number: '03',
    eyebrow: 'Pagamentos e cobranças',
    title: 'O que está em aberto aparece antes que você esqueça',
    description:
      'Pendente, atrasado e recebido ficam separados e claros. Você cobra no momento certo porque o sistema mostra — não porque você lembrou de conferir.',
    benefit: 'Mais clareza para cobrar no tempo certo e fechar o mês sem surpresa.',
    imageLabel: 'Tela de pagamentos — status por cliente com alertas de atraso',
    image: paymentsPageImg,
  },
  {
    number: '04',
    eyebrow: 'Detalhes do cliente',
    title: 'Histórico completo de cada relação comercial',
    description:
      'Projetos, pagamentos e observações de cada cliente reunidos em um só lugar. Você abre e sabe tudo o que aconteceu antes de retomar qualquer conversa.',
    benefit: 'Contexto completo sem precisar buscar informação em vários lugares.',
    imageLabel: 'Tela de detalhes do cliente — projetos e pagamentos vinculados',
    image: clientsDetailsImg,
  },
];

const stats = [
  { value: '1', label: 'Painel único', detail: 'clientes, projetos e pagamentos' },
  { value: '0', label: 'Planilhas paralelas', detail: 'a operação fica dentro do sistema' },
  { value: '100%', label: 'Grátis para começar', detail: 'sem cartão de crédito' },
];

const footerLinks = [
  { label: 'O problema', href: '#problema' },
  { label: 'Como funciona', href: '#solucao' },
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Demonstração', href: '#demo' },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function getRevealStyle(delay: number, distance = 32): CSSProperties {
  return {
    '--reveal-delay': `${delay}ms`,
    '--reveal-distance': `${distance}px`,
  } as CSSProperties;
}

// ─── Internal components ──────────────────────────────────────────────────────

function MarqueeTicker() {
  const doubled = [...marqueeItems, ...marqueeItems];
  return (
    <div className="marquee-outer select-none overflow-hidden border-y border-slate-100 bg-white py-4">
      <div className="marquee-track flex w-max items-center">
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center">
            <span className="whitespace-nowrap px-7 text-xs font-bold uppercase tracking-widest text-slate-300">
              {item}
            </span>
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#635bff]/40"
              aria-hidden="true"
            />
          </span>
        ))}
      </div>
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="flex h-full items-center justify-center">
      <img
        src={mockdashboardImg}
        alt="Dashboard do FreelancerOS"
        className="w-full drop-shadow-[0_32px_48px_rgba(0,0,0,0.35)]"
        loading="eager"
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  useScrollReveal(pageRef);

  return (
    <>
      <Seo
        title="FreelancerOS | Organize clientes, projetos e pagamentos"
        description="FreelancerOS e o painel para freelancers centralizarem clientes, projetos, propostas e pagamentos em um unico lugar."
        robots="index, follow"
        canonical="/"
        openGraph={{
          title: 'FreelancerOS | Organize clientes, projetos e pagamentos',
          description:
            'FreelancerOS e o painel para freelancers centralizarem clientes, projetos, propostas e pagamentos em um unico lugar.',
          image: '/freelanceros-og.png',
          url: '/',
          type: 'website',
          siteName: 'FreelancerOS',
        }}
        twitter={{
          card: 'summary_large_image',
          title: 'FreelancerOS | Organize clientes, projetos e pagamentos',
          description:
            'FreelancerOS e o painel para freelancers centralizarem clientes, projetos, propostas e pagamentos em um unico lugar.',
          image: '/freelanceros-og.png',
        }}
      />

      <div
        ref={pageRef}
        id="top"
        className="landing-scroll-root motion-page relative isolate text-slate-900"
      >

        {/* ── HEADER ─────────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-30 border-b border-white/6 bg-slate-950/92 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8 lg:px-10">
            <Link to="/" className="inline-flex items-center">
              <BrandLogo variant="lockup" tone="inverse" className="h-7 w-auto sm:h-8" />
            </Link>

            <nav className="hidden items-center gap-7 text-sm font-medium text-white/50 lg:flex">
              {footerLinks.map(({ label, href }) => (
                <a key={label} href={href} className="transition hover:text-white">
                  {label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login?mode=sign_in"
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white/65 transition hover:bg-white/8 hover:text-white"
              >
                Entrar
              </Link>
              <Link
                to="/login?mode=sign_up"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#635bff] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Criar conta
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </header>

        {/* ── HERO ───────────────────────────────────────────────────────────── */}
        <section className="landing-hero-grid relative overflow-hidden bg-slate-950">
          {/* Ambient glows */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -left-40 -top-40 h-125 w-125 rounded-full bg-[#635bff]/12 blur-[120px]" />
            <div className="absolute -right-40 top-1/3 h-80 w-80 rounded-full bg-sky-500/8 blur-[100px]" />
            <div className="absolute bottom-0 left-1/2 h-60 w-96 -translate-x-1/2 rounded-full bg-violet-800/10 blur-[80px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-5 pb-0 pt-20 sm:px-8 lg:px-10 lg:pt-28">
            <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-14">

              {/* Left: Copy */}
              <div
                data-scroll-reveal
                style={getRevealStyle(0, 56)}
                className="space-y-8 pb-16 lg:pb-28"
              >
                <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-white/55 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Para freelancers que trabalham por projeto
                </div>

                <div className="space-y-5">
                  <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]">
                    Pare de operar
                    <br />
                    no modo{' '}
                    <em className="font-light italic text-white/30">bagunça.</em>
                  </h1>
                  <p className="max-w-lg text-base leading-7 text-white/50 sm:text-lg">
                    O FreelancerOS organiza clientes, projetos e pagamentos em um único painel
                    — para você saber o que está em andamento, o que falta cobrar e o que já
                    entrou.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/login?mode=sign_up"
                    className="inline-flex items-center gap-2 rounded-full bg-[#635bff] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(99,91,255,0.3)] transition hover:-translate-y-0.5 hover:brightness-110"
                  >
                    Criar conta grátis
                    <ArrowRight size={16} />
                  </Link>
                  <a
                    href="#demo"
                    className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-6 py-3.5 text-sm font-semibold text-white/65 backdrop-blur transition hover:bg-white/10 hover:text-white"
                  >
                    Ver o produto
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-6 border-t border-white/8 pt-8">
                  {[
                    { value: 'Grátis', label: 'para começar' },
                    { value: '1 painel', label: 'tudo conectado' },
                    { value: '< 5 min', label: 'para configurar' },
                  ].map(({ value, label }) => (
                    <div key={label}>
                      <p className="text-base font-bold text-white sm:text-lg">{value}</p>
                      <p className="mt-0.5 text-xs text-white/35">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Dashboard mock */}
              <div
                data-scroll-reveal
                style={getRevealStyle(100, 64)}
                className="relative pt-2 lg:-mb-8"
              >
                <DashboardMock />
              </div>
            </div>
          </div>
        </section>

        {/* ── MARQUEE ────────────────────────────────────────────────────────── */}
        <MarqueeTicker />

        {/* ── PROBLEM ────────────────────────────────────────────────────────── */}
        <section id="problema" className="bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">

              {/* Left: Statement */}
              <div data-scroll-reveal style={getRevealStyle(0, 48)} className="space-y-8">
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#635bff]">
                    O problema
                  </p>
                  <h2 className="text-4xl font-bold leading-[1.15] tracking-tight text-slate-950 sm:text-5xl">
                    Quando a operação fica espalhada, o prejuízo não é só visual.
                  </h2>
                  <p className="text-base leading-7 text-slate-500">
                    A bagunça custa tempo para encontrar contexto, atrasa cobrança e dificulta
                    saber o que realmente precisa de atenção no dia.
                  </p>
                </div>

                <div className="rounded-[28px] border border-slate-900 bg-slate-950 p-6 text-white">
                  <p className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
                    Você lembrou de cobrar todos esse mês?
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/55">
                    Sem controle central, você confere conversa por conversa, reabre planilha,
                    olha extrato e tenta lembrar o que ainda está em aberto. Isso consome tempo
                    e aumenta a chance de deixar dinheiro passar.
                  </p>
                </div>
              </div>

              {/* Right: Pain list */}
              <div className="space-y-4">
                {[
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
                ].map(({ title, description }, i) => (
                  <article
                    key={title}
                    data-scroll-reveal
                    style={getRevealStyle(60 + i * 50, 28)}
                    className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-5"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-600">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{title}</p>
                      <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PRODUCT IN ACTION ──────────────────────────────────────────────── */}
        <section id="solucao" className="bg-slate-50 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div
              data-scroll-reveal
              style={getRevealStyle(0, 44)}
              className="mx-auto mb-12 max-w-3xl space-y-4 text-center"
            >
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#635bff]">
                O produto por dentro
              </p>
              <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Um painel. Toda a sua operação.
              </h2>
              <p className="text-base leading-7 text-slate-500">
                O FreelancerOS conecta clientes, projetos e pagamentos em uma única interface.
                Você abre e sabe o que precisa de atenção — sem caçar informação.
              </p>
            </div>

            <div data-scroll-reveal style={getRevealStyle(80, 40)}>
              <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
                <img
                  src={proposalsPageImg}
                  alt="Tela de propostas do FreelancerOS"
                  className="block w-full"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { title: 'Métricas em tempo real', desc: 'Recebido, pendente e atrasado sempre visíveis.' },
                { title: 'Alertas de prioridade', desc: 'O sistema mostra o que precisa de ação hoje.' },
                { title: 'Tudo conectado', desc: 'Cada pagamento vinculado ao projeto e ao cliente.' },
              ].map(({ title, desc }, i) => (
                <div
                  key={title}
                  data-scroll-reveal
                  style={getRevealStyle(100 + i * 40, 28)}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="mb-4 h-1 w-8 rounded-full bg-[#635bff]" />
                  <p className="font-semibold text-slate-900">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FEATURES ───────────────────────────────────────────────────────── */}
        <section id="funcionalidades" className="bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div data-scroll-reveal style={getRevealStyle(0, 44)} className="mb-16 space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#635bff]">
                Funcionalidades
              </p>
              <h2 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                Cada área existe para resolver parte da sua rotina.
              </h2>
            </div>

            <div className="space-y-24 lg:space-y-32">
              {featureSections.map(
                ({ number, eyebrow, title, description, benefit, imageLabel, image }, i) => (
                  <div
                    key={number}
                    className={[
                      'grid items-center gap-10 lg:grid-cols-2 lg:gap-16',
                      i % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : '',
                    ].join(' ')}
                  >
                    {/* Text */}
                    <div
                      data-scroll-reveal
                      style={getRevealStyle(i % 2 === 0 ? 0 : 60, 44)}
                      className="space-y-6"
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="font-mono text-xs font-bold text-slate-300">
                          {number}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-[0.14em] text-[#635bff]">
                          {eyebrow}
                        </span>
                      </div>
                      <h3 className="text-3xl font-bold leading-snug tracking-tight text-slate-950 sm:text-4xl">
                        {title}
                      </h3>
                      <p className="text-base leading-7 text-slate-500">{description}</p>
                      <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#635bff]" />
                        <p className="text-sm font-medium leading-6 text-slate-700">{benefit}</p>
                      </div>
                    </div>

                    <div
                      data-scroll-reveal
                      style={getRevealStyle(i % 2 === 0 ? 60 : 0, 40)}
                      className="overflow-hidden rounded-2xl border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                    >
                      <img
                        src={image}
                        alt={imageLabel}
                        className="block w-full"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </section>

        {/* ── STATS ──────────────────────────────────────────────────────────── */}
        <section className="bg-slate-950 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div
              data-scroll-reveal
              style={getRevealStyle(0, 44)}
              className="mb-14 space-y-4 text-center"
            >
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#635bff]">
                Sem complicação
              </p>
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Feito para funcionar no dia a dia real.
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map(({ value, label, detail }, i) => (
                <div
                  key={label}
                  data-scroll-reveal
                  style={getRevealStyle(60 + i * 55, 36)}
                  className="rounded-2xl border border-white/8 bg-white/4 p-8 text-center backdrop-blur"
                >
                  <p className="text-6xl font-black tracking-tighter text-white">{value}</p>
                  <p className="mt-3 text-base font-semibold text-white/70">{label}</p>
                  <p className="mt-1 text-sm text-white/35">{detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MOBILE DEMO ────────────────────────────────────────────────────── */}
        <section id="demo" className="overflow-hidden bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

              {/* Left: Text */}
              <div data-scroll-reveal style={getRevealStyle(0, 44)} className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">
                    <Smartphone size={13} className="text-[#635bff]" />
                    <span className="text-xs font-semibold text-slate-600">
                      Funciona em qualquer dispositivo
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#635bff]">
                    Demonstração
                  </p>
                  <h2 className="text-4xl font-bold leading-snug tracking-tight text-slate-950 sm:text-5xl">
                    Sua operação
                    <br />
                    no celular também.
                  </h2>
                  <p className="text-base leading-7 text-slate-500">
                    O FreelancerOS é responsivo e funciona bem em qualquer tela — você
                    acompanha cobranças e projetos onde estiver, sem precisar estar na frente
                    do computador.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    'Painel com métricas acessível direto do celular',
                    'Cobranças e projetos com status visível em qualquer tela',
                    'Interface adaptada para uso rápido em mobilidade',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#635bff]" />
                      <p className="text-sm leading-6 text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>

                <Link
                  to="/login?mode=sign_up"
                  className="inline-flex items-center gap-2 rounded-full bg-[#635bff] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(99,91,255,0.28)] transition hover:-translate-y-0.5 hover:brightness-110"
                >
                  Criar conta grátis
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Right: Phone frame */}
              <div
                data-scroll-reveal
                style={getRevealStyle(80, 40)}
                className="flex justify-center"
              >
                <div className="relative w-70 sm:w-75">
                  <div className="relative overflow-hidden rounded-[3.5rem] border-4 border-slate-200 bg-white shadow-[0_40px_80px_rgba(15,23,42,0.12)]">
                    {/* Status bar + dynamic island */}
                    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 pb-2 pt-4">
                      <span className="text-[11px] font-semibold text-slate-900">9:41</span>
                      <div className="h-6 w-20 rounded-full bg-slate-900" />
                      <span className="text-[11px] font-semibold text-slate-900">100%</span>
                    </div>
                    <img
                      src={mobileViewImg}
                      alt="FreelancerOS no celular"
                      className="block w-full"
                      loading="lazy"
                    />
                    {/* Home indicator */}
                    <div className="flex h-8 items-center justify-center bg-white">
                      <div className="h-1 w-24 rounded-full bg-slate-200" />
                    </div>
                  </div>
                  {/* Decorative glow */}
                  <div
                    aria-hidden="true"
                    className="absolute -bottom-8 left-1/2 h-20 w-48 -translate-x-1/2 rounded-full bg-[#635bff]/15 blur-3xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIAL ────────────────────────────────────────────────────── 
        <section className="bg-slate-50 py-20 lg:py-28">
          <div className="mx-auto max-w-4xl px-5 sm:px-8 lg:px-10">
            <blockquote
              data-scroll-reveal
              style={getRevealStyle(0, 44)}
              className="space-y-8 text-center"
            >
              <div className="flex justify-center">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-2xl font-medium leading-snug text-slate-800 sm:text-3xl">
                &ldquo;Antes eu perdia pelo menos uma cobrança por mês. Agora o sistema mostra
                exatamente o que está em aberto. A diferença no fechamento do mês foi
                imediata.&rdquo;
              </p>
              <footer className="flex items-center justify-center gap-4">
                {/* Avatar placeholder 
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-dashed border-slate-300 bg-slate-200">
                  <div className="flex h-full w-full items-center justify-center">
                    <Users size={18} className="text-slate-400" />
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900">Nome do cliente</p>
                  <p className="text-sm text-slate-500">Freelancer · Área de atuação</p>
                </div>
              </footer>
            </blockquote>
          </div>
        </section> */}

        {/* ── CTA ────────────────────────────────────────────────────────────── */}
        <section
          data-scroll-reveal
          style={getRevealStyle(20, 44)}
          className="bg-[linear-gradient(135deg,#1e1b4b_0%,#312e81_40%,#4c1d95_100%)] py-20 lg:py-28"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-3xl space-y-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-300/60">
                Pronto para começar
              </p>
              <h2 className="text-4xl font-bold leading-snug tracking-tight text-white sm:text-5xl lg:text-6xl">
                Se hoje seu controle depende de planilha e memória, já está custando tempo
                demais.
              </h2>
              <p className="text-base leading-7 text-indigo-100/55">
                Centralize clientes, projetos e pagamentos no FreelancerOS. Grátis para começar,
                sem precisar de cartão.
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  to="/login?mode=sign_up"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-indigo-700 shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  Criar conta grátis
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/login?mode=sign_in"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/8 px-8 py-4 text-sm font-semibold text-white/75 backdrop-blur transition hover:bg-white/14 hover:text-white"
                >
                  Já tenho conta
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
        <footer className="bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
            <div className="grid gap-8 border-b border-white/8 pb-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(10rem,0.8fr)_minmax(10rem,0.8fr)_minmax(12rem,0.8fr)]">
              <div className="space-y-4">
                <BrandLogo variant="lockup" tone="inverse" className="h-8 w-auto" />
                <p className="max-w-xs text-sm leading-7 text-white/45">
                  Painel para freelancers organizarem clientes, projetos e pagamentos sem
                  depender de planilha ou memória.
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/25">
                  Produto
                </p>
                <div className="flex flex-col gap-3 text-sm text-white/50">
                  {footerLinks.map(({ label, href }) => (
                    <a key={label} href={href} className="transition hover:text-white">
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/25">
                  Acesso
                </p>
                <div className="flex flex-col gap-3 text-sm">
                  <Link
                    to="/login?mode=sign_in"
                    className="text-white/50 transition hover:text-white"
                  >
                    Entrar no painel
                  </Link>
                  <Link
                    to="/login?mode=sign_up"
                    className="text-white/50 transition hover:text-white"
                  >
                    Criar conta
                  </Link>
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/25">
                  Comece agora
                </p>
                <Link
                  to="/login?mode=sign_up"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-5 py-2.5 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"
                >
                  Criar conta grátis
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-6 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} FreelancerOS. Todos os direitos reservados.</p>
              <a href="#top" className="transition hover:text-white">
                Voltar ao topo ↑
              </a>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
