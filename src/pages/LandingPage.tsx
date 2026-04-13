import { useRef, useState, useEffect, type CSSProperties } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Smartphone,
  X,
  // Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BrandLogo } from '../components/BrandLogo';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { useScrollReveal } from '../lib/useScrollReveal';
import { Seo } from '../seo/Seo';
import { useLang } from '../i18n/hooks/useLang';
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

// ─── Utilities ────────────────────────────────────────────────────────────────

function getRevealStyle(delay: number, distance = 32): CSSProperties {
  return {
    '--reveal-delay': `${delay}ms`,
    '--reveal-distance': `${distance}px`,
  } as CSSProperties;
}

// ─── Internal components ──────────────────────────────────────────────────────

function MarqueeTicker({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
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

function DashboardMock({ alt }: { alt: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <img
        src={mockdashboardImg}
        alt={alt}
        className="w-full drop-shadow-[0_32px_48px_rgba(0,0,0,0.35)]"
        loading="eager"
      />
    </div>
  );
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

type LightboxProps = {
  src: string;
  alt: string;
  closeLabel: string;
  onClose: () => void;
};

function ImageLightbox({ src, alt, closeLabel, onClose }: LightboxProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label={closeLabel}
      >
        <X size={20} />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LandingPage() {
  const { t } = useTranslation();
  const lang = useLang();
  const pageRef = useRef<HTMLDivElement>(null);
  useScrollReveal(pageRef);

  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const marqueeItems = [
    t('landing.marquee_1'),
    t('landing.marquee_2'),
    t('landing.marquee_3'),
    t('landing.marquee_4'),
    t('landing.marquee_5'),
    t('landing.marquee_6'),
    t('landing.marquee_7'),
    t('landing.marquee_8'),
    t('landing.marquee_9'),
  ];

  const navLinks = [
    { label: t('landing.nav_problem'), href: '#problema' },
    { label: t('landing.nav_solution'), href: '#solucao' },
    { label: t('landing.nav_features'), href: '#funcionalidades' },
    { label: t('landing.nav_demo'), href: '#demo' },
  ];

  const featureSections: FeatureSection[] = [
    {
      number: '01',
      eyebrow: t('landing.feature_1_eyebrow'),
      title: t('landing.feature_1_title'),
      description: t('landing.feature_1_desc'),
      benefit: t('landing.feature_1_benefit'),
      imageLabel: t('landing.feature_1_img'),
      image: clientsPageImg,
    },
    {
      number: '02',
      eyebrow: t('landing.feature_2_eyebrow'),
      title: t('landing.feature_2_title'),
      description: t('landing.feature_2_desc'),
      benefit: t('landing.feature_2_benefit'),
      imageLabel: t('landing.feature_2_img'),
      image: projectsPageImg,
    },
    {
      number: '03',
      eyebrow: t('landing.feature_3_eyebrow'),
      title: t('landing.feature_3_title'),
      description: t('landing.feature_3_desc'),
      benefit: t('landing.feature_3_benefit'),
      imageLabel: t('landing.feature_3_img'),
      image: paymentsPageImg,
    },
    {
      number: '04',
      eyebrow: t('landing.feature_4_eyebrow'),
      title: t('landing.feature_4_title'),
      description: t('landing.feature_4_desc'),
      benefit: t('landing.feature_4_benefit'),
      imageLabel: t('landing.feature_4_img'),
      image: clientsDetailsImg,
    },
  ];

  const stats = [
    { value: t('landing.stat_1_value'), label: t('landing.stat_1_label'), detail: t('landing.stat_1_detail') },
    { value: t('landing.stat_2_value'), label: t('landing.stat_2_label'), detail: t('landing.stat_2_detail') },
    { value: t('landing.stat_3_value'), label: t('landing.stat_3_label'), detail: t('landing.stat_3_detail') },
  ];

  const painItems = [
    { title: t('landing.pain_1_title'), description: t('landing.pain_1_desc') },
    { title: t('landing.pain_2_title'), description: t('landing.pain_2_desc') },
    { title: t('landing.pain_3_title'), description: t('landing.pain_3_desc') },
    { title: t('landing.pain_4_title'), description: t('landing.pain_4_desc') },
  ];

  const solutionCards = [
    { title: t('landing.solution_card_1_title'), desc: t('landing.solution_card_1_desc') },
    { title: t('landing.solution_card_2_title'), desc: t('landing.solution_card_2_desc') },
    { title: t('landing.solution_card_3_title'), desc: t('landing.solution_card_3_desc') },
  ];

  const heroMiniStats = [
    { value: t('landing.hero_mini_stat_1_value'), label: t('landing.hero_mini_stat_1_label') },
    { value: t('landing.hero_mini_stat_2_value'), label: t('landing.hero_mini_stat_2_label') },
    { value: t('landing.hero_mini_stat_3_value'), label: t('landing.hero_mini_stat_3_label') },
  ];

  const demoChecklist = [
    t('landing.demo_check_1'),
    t('landing.demo_check_2'),
    t('landing.demo_check_3'),
  ];

  return (
    <>
      {lightbox && (
        <ImageLightbox
          src={lightbox.src}
          alt={lightbox.alt}
          closeLabel={t('landing.lightbox_close')}
          onClose={() => setLightbox(null)}
        />
      )}
      <Seo
        title={t('landing.seo_title')}
        description={t('landing.seo_description')}
        robots="index, follow"
        canonical="/"
        openGraph={{
          title: t('landing.seo_title'),
          description: t('landing.seo_description'),
          image: '/freelanceros-og.png',
          url: '/',
          type: 'website',
          siteName: 'FreelancerOS',
        }}
        twitter={{
          card: 'summary_large_image',
          title: t('landing.seo_title'),
          description: t('landing.seo_description'),
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
            <Link to={`/${lang}`} className="inline-flex items-center">
              <BrandLogo variant="lockup" tone="inverse" className="h-7 w-auto sm:h-8" />
            </Link>

            <nav className="hidden items-center gap-7 text-sm font-medium text-white/50 lg:flex">
              {navLinks.map(({ label, href }) => (
                <a key={href} href={href} className="transition hover:text-white">
                  {label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="scale-[0.8] min-[495px]:scale-100 origin-left transition-transform">
                <LanguageSwitcher tone="dark" />
              </div>
              <Link
                to={`/${lang}/login?mode=sign_in`}
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white/65 transition hover:bg-white/8 hover:text-white"
              >
                {t('landing.header_sign_in')}
              </Link>
              <Link
                to={`/${lang}/login?mode=sign_up`}
                className="hidden min-[495px]:inline-flex items-center justify-center gap-2 rounded-full bg-[#635bff] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:-translate-y-0.5 hover:brightness-105"
              >
                {t('landing.header_sign_up')}
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
                  {t('landing.hero_badge')}
                </div>

                <div className="space-y-5">
                  <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]">
                    {t('landing.hero_h1_line1')}
                    <br />
                    {t('landing.hero_h1_line2')}{' '}
                    <em className="font-light italic text-white/30">{t('landing.hero_h1_chaos')}</em>
                  </h1>
                  <p className="max-w-lg text-base leading-7 text-white/50 sm:text-lg">
                    {t('landing.hero_description')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to={`/${lang}/login?mode=sign_up`}
                    className="inline-flex items-center gap-2 rounded-full bg-[#635bff] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(99,91,255,0.3)] transition hover:-translate-y-0.5 hover:brightness-110"
                  >
                    {t('landing.hero_cta_primary')}
                    <ArrowRight size={16} />
                  </Link>
                  <a
                    href="#demo"
                    className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/6 px-6 py-3.5 text-sm font-semibold text-white/65 backdrop-blur transition hover:bg-white/10 hover:text-white"
                  >
                    {t('landing.hero_cta_secondary')}
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-6 border-t border-white/8 pt-8">
                  {heroMiniStats.map(({ value, label }) => (
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
                <DashboardMock alt={t('landing.dashboard_mock_alt')} />
              </div>
            </div>
          </div>
        </section>

        {/* ── MARQUEE ────────────────────────────────────────────────────────── */}
        <MarqueeTicker items={marqueeItems} />

        {/* ── PROBLEM ────────────────────────────────────────────────────────── */}
        <section id="problema" className="bg-white py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">

              {/* Left: Statement */}
              <div data-scroll-reveal style={getRevealStyle(0, 48)} className="space-y-8">
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#635bff]">
                    {t('landing.problem_eyebrow')}
                  </p>
                  <h2 className="text-4xl font-bold leading-[1.15] tracking-tight text-slate-950 sm:text-5xl">
                    {t('landing.problem_heading')}
                  </h2>
                  <p className="text-base leading-7 text-slate-500">
                    {t('landing.problem_description')}
                  </p>
                </div>

                <div className="rounded-[28px] border border-slate-900 bg-slate-950 p-6 text-white">
                  <p className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
                    {t('landing.problem_quote_heading')}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-white/55">
                    {t('landing.problem_quote_description')}
                  </p>
                </div>
              </div>

              {/* Right: Pain list */}
              <div className="space-y-4">
                {painItems.map(({ title, description }, i) => (
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
                {t('landing.solution_eyebrow')}
              </p>
              <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                {t('landing.solution_heading')}
              </h2>
              <p className="text-base leading-7 text-slate-500">
                {t('landing.solution_description')}
              </p>
            </div>

            <div data-scroll-reveal style={getRevealStyle(80, 40)}>
              <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
                <img
                  src={proposalsPageImg}
                  alt={t('landing.solution_proposals_alt')}
                  className="block w-full"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {solutionCards.map(({ title, desc }, i) => (
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
                {t('landing.features_eyebrow')}
              </p>
              <h2 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                {t('landing.features_heading')}
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
                      className="group cursor-zoom-in overflow-hidden rounded-2xl border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
                      onClick={() => setLightbox({ src: image, alt: imageLabel })}
                    >
                      <img
                        src={image}
                        alt={imageLabel}
                        className="block w-full transition-transform duration-500 ease-in-out group-hover:scale-105"
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
                {t('landing.stats_eyebrow')}
              </p>
              <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                {t('landing.stats_heading')}
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
                      {t('landing.demo_device_badge')}
                    </span>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#635bff]">
                    {t('landing.demo_eyebrow')}
                  </p>
                  <h2 className="text-4xl font-bold leading-snug tracking-tight text-slate-950 sm:text-5xl">
                    {t('landing.demo_h2_line1')}
                    <br />
                    {t('landing.demo_h2_line2')}
                  </h2>
                  <p className="text-base leading-7 text-slate-500">
                    {t('landing.demo_description')}
                  </p>
                </div>

                <div className="space-y-3">
                  {demoChecklist.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#635bff]" />
                      <p className="text-sm leading-6 text-slate-600">{item}</p>
                    </div>
                  ))}
                </div>

                <Link
                  to={`/${lang}/login?mode=sign_up`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#635bff] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_rgba(99,91,255,0.28)] transition hover:-translate-y-0.5 hover:brightness-110"
                >
                  {t('landing.demo_cta')}
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
                      alt={t('landing.demo_mobile_alt')}
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
          ...
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
                {t('landing.cta_eyebrow')}
              </p>
              <h2 className="text-4xl font-bold leading-snug tracking-tight text-white sm:text-5xl lg:text-6xl">
                {t('landing.cta_heading')}
              </h2>
              <p className="text-base leading-7 text-indigo-100/55">
                {t('landing.cta_description')}
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  to={`/${lang}/login?mode=sign_up`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-indigo-700 shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:brightness-105"
                >
                  {t('landing.cta_primary')}
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to={`/${lang}/login?mode=sign_in`}
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/8 px-8 py-4 text-sm font-semibold text-white/75 backdrop-blur transition hover:bg-white/14 hover:text-white"
                >
                  {t('landing.cta_secondary')}
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
                  {t('landing.footer_tagline')}
                </p>
              </div>

              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/25">
                  {t('landing.footer_product_heading')}
                </p>
                <div className="flex flex-col gap-3 text-sm text-white/50">
                  {navLinks.map(({ label, href }) => (
                    <a key={href} href={href} className="transition hover:text-white">
                      {label}
                    </a>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/25">
                  {t('landing.footer_access_heading')}
                </p>
                <div className="flex flex-col gap-3 text-sm">
                  <Link
                    to={`/${lang}/login?mode=sign_in`}
                    className="text-white/50 transition hover:text-white"
                  >
                    {t('landing.footer_sign_in')}
                  </Link>
                  <Link
                    to={`/${lang}/login?mode=sign_up`}
                    className="text-white/50 transition hover:text-white"
                  >
                    {t('landing.footer_create_account')}
                  </Link>
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/25">
                  {t('landing.footer_start_heading')}
                </p>
                <Link
                  to={`/${lang}/login?mode=sign_up`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-5 py-2.5 text-sm font-semibold text-white/65 transition hover:bg-white/10 hover:text-white"
                >
                  {t('landing.footer_cta')}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-6 text-xs text-white/25 sm:flex-row sm:items-center sm:justify-between">
              <p>{t('landing.footer_copyright', { year: new Date().getFullYear() })}</p>
              <a href="#top" className="transition hover:text-white">
                {t('landing.footer_back_to_top')}
              </a>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
