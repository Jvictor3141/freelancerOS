import { Suspense, lazy, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, Route, Routes, useParams } from 'react-router-dom';
import { BrandLogo } from './components/BrandLogo';
import { RouteTransition } from './components/RouteTransition';
import { useSupabaseRealtimeSync } from './lib/useSupabaseRealtimeSync';
import { DashboardLayout } from './layout/DashboardLayout';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RecoveryPasswordPage } from './pages/RecoveryPasswordPage';
import { useAuthStore } from './stores/useAuthStore';
import { useClientStore } from './stores/useClientStore';
import { usePaymentStore } from './stores/usePaymentStore';
import { usePreferencesStore } from './stores/usePreferencesStore';
import { useProjectStore } from './stores/useProjectStore';
import { useProposalStore } from './stores/useProposalStore';
import { useRealtimeInvalidationStore } from './stores/useRealtimeInvalidationStore';
import { isSupportedLanguage, type SupportedLanguage } from './i18n/config';

const DashboardPage = lazy(async () => ({
  default: (await import('./pages/DashboardPage')).DashboardPage,
}));
const ClientsPage = lazy(async () => ({
  default: (await import('./pages/ClientsPage')).ClientsPage,
}));
const ClientDetailsPage = lazy(async () => ({
  default: (await import('./pages/ClientDetailsPage')).ClientDetailsPage,
}));
const ProjectsPage = lazy(async () => ({
  default: (await import('./pages/ProjectsPage')).ProjectsPage,
}));
const PaymentsPage = lazy(async () => ({
  default: (await import('./pages/PaymentsPage')).PaymentsPage,
}));
const ProposalsPage = lazy(async () => ({
  default: (await import('./pages/ProposalsPage')).ProposalsPage,
}));
const SharedProposalPage = lazy(async () => ({
  default: (await import('./pages/SharedProposalPage')).SharedProposalPage,
}));
const SettingsPage = lazy(async () => ({
  default: (await import('./pages/SettingsPage')).SettingsPage,
}));

type LoadingStateProps = {
  title: string;
  description: string;
};

function LoadingState({ title, description }: LoadingStateProps) {
  return (
    <div className="motion-surface rounded-4xl border border-slate-200 bg-white/85 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur">
      <BrandLogo variant="lockup" className="h-8 w-auto" />
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

/**
 * Validates the :lang URL param, syncs it to i18next, and sets <html lang="">.
 * Redirects to the default language if the param is invalid.
 */
function LangRouteProvider() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  const validLang: SupportedLanguage =
    lang && isSupportedLanguage(lang) ? lang : 'pt';

  // Sync URL lang to i18next (runs synchronously before render via effect)
  useEffect(() => {
    if (i18n.language !== validLang) {
      void i18n.changeLanguage(validLang);
    }
    document.documentElement.lang = validLang === 'pt' ? 'pt-BR' : 'en-US';
  }, [validLang, i18n]);

  // Redirect invalid lang segments to default
  if (lang && !isSupportedLanguage(lang)) {
    return <Navigate to={`/pt/${lang}`} replace />;
  }

  return <Outlet />;
}

function SharedProposalRoute() {
  const { t } = useTranslation();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent px-5 py-6 text-slate-900 sm:px-8">
          <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center">
            <LoadingState
              title={t('app.loading_shared_proposal_title')}
              description={t('app.loading_shared_proposal_description')}
            />
          </div>
        </div>
      }
    >
      <SharedProposalPage />
    </Suspense>
  );
}

function ProtectedAppShell() {
  const { user, authFlow } = useAuthStore();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang && isSupportedLanguage(lang) ? lang : 'pt';

  useSupabaseRealtimeSync(user?.id ?? null);

  if (!user) {
    return <Navigate to={`/${currentLang}/login?mode=sign_in`} replace />;
  }

  if (authFlow === 'recovery') {
    return (
      <Navigate to={`/${currentLang}/redefinir-senha?flow=recovery`} replace />
    );
  }

  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <AppPageLoadingFallback />
        }
      >
        <RouteTransition>
          <Outlet />
        </RouteTransition>
      </Suspense>
    </DashboardLayout>
  );
}

function AppPageLoadingFallback() {
  const { t } = useTranslation();
  return (
    <LoadingState
      title={t('app.loading_page_title')}
      description={t('app.loading_page_description')}
    />
  );
}

function AppInitLoading() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-transparent px-5 py-6 text-slate-900 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center">
        <LoadingState
          title={t('app.loading_session_title')}
          description={t('app.loading_session_description')}
        />
      </div>
    </div>
  );
}

function App() {
  const { user, initialized, initialize, authFlow } = useAuthStore();
  const { i18n } = useTranslation();
  const theme = usePreferencesStore((state) => state.theme);
  const previousUserIdRef = useRef<string | null>(null);

  // Detect default lang for root redirects
  const detectedLang: SupportedLanguage =
    isSupportedLanguage(i18n.resolvedLanguage ?? '') ? (i18n.resolvedLanguage as SupportedLanguage) : 'pt';

  const authenticatedHome =
    authFlow === 'recovery'
      ? `/${detectedLang}/redefinir-senha?flow=recovery`
      : `/${detectedLang}/dashboard`;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    void initialize().then((cleanup) => {
      if (isMounted) {
        unsubscribe = cleanup;
        return;
      }
      cleanup();
    });

    return () => {
      isMounted = false;
      unsubscribe?.();
    };
  }, [initialize]);

  useEffect(() => {
    const currentUserId = user?.id ?? null;
    if (previousUserIdRef.current === currentUserId) return;

    useClientStore.getState().resetStore();
    useProjectStore.getState().resetStore();
    usePaymentStore.getState().resetStore();
    useProposalStore.getState().resetStore();
    useRealtimeInvalidationStore.getState().reset();
    previousUserIdRef.current = currentUserId;
  }, [user?.id]);

  if (!initialized) {
    return <AppInitLoading />;
  }

  return (
    <Routes>
      {/* Root redirect → detected language */}
      <Route
        path="/"
        element={
          <Navigate
            to={user ? authenticatedHome : `/${detectedLang}/`}
            replace
          />
        }
      />

      {/* External entry points without /:lang for auth emails, old bookmarks,
          and shared links whose recipient language is unknown upfront. */}
      <Route
        path="/login"
        element={
          user ? <Navigate to={authenticatedHome} replace /> : <LoginPage />
        }
      />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/redefinir-senha" element={<RecoveryPasswordPage />} />
      <Route
        path="/propostas/compartilhadas/:shareId"
        element={<SharedProposalRoute />}
      />

      {/* Language-prefixed routes */}
      <Route path="/:lang" element={<LangRouteProvider />}>
        {/* Index: landing or redirect to dashboard */}
        <Route
          index
          element={
            user ? (
              <Navigate to={authenticatedHome} replace />
            ) : (
              <LandingPage />
            )
          }
        />

        <Route
          path="login"
          element={
            user ? <Navigate to={authenticatedHome} replace /> : <LoginPage />
          }
        />

        <Route path="auth/callback" element={<AuthCallbackPage />} />
        <Route path="redefinir-senha" element={<RecoveryPasswordPage />} />
        <Route
          path="propostas/compartilhadas/:shareId"
          element={<SharedProposalRoute />}
        />

        {/* Protected shell */}
        <Route element={<ProtectedAppShell />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="clientes" element={<ClientsPage />} />
          <Route path="clients/:id" element={<ClientDetailsPage />} />
          <Route path="projetos" element={<ProjectsPage />} />
          <Route path="pagamentos" element={<PaymentsPage />} />
          <Route path="propostas" element={<ProposalsPage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
        </Route>

        {/* Unknown sub-paths → home */}
        <Route
          path="*"
          element={
            <Navigate to={user ? authenticatedHome : `/${detectedLang}/`} replace />
          }
        />
      </Route>

      {/* Unknown root paths → detected lang home */}
      <Route
        path="*"
        element={
          <Navigate
            to={user ? authenticatedHome : `/${detectedLang}/`}
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
