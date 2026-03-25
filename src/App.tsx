import { Suspense, lazy, useEffect, useRef } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
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

function SharedProposalRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent px-5 py-6 text-slate-900 sm:px-8">
          <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center">
            <LoadingState
              title="Carregando proposta compartilhada"
              description="Validando o link seguro e preparando a visualizacao."
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
  useSupabaseRealtimeSync(user?.id ?? null);

  if (!user) {
    return <Navigate to="/login?mode=sign_in" replace />;
  }

  if (authFlow === 'recovery') {
    return <Navigate to="/redefinir-senha?flow=recovery" replace />;
  }

  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <LoadingState
            title="Carregando pagina"
            description="Montando a interface e buscando os modulos necessarios."
          />
        }
      >
        <RouteTransition>
          <Outlet />
        </RouteTransition>
      </Suspense>
    </DashboardLayout>
  );
}

function App() {
  const { user, initialized, initialize, authFlow } = useAuthStore();
  const theme = usePreferencesStore((state) => state.theme);
  const previousUserIdRef = useRef<string | null>(null);
  const authenticatedHome =
    authFlow === 'recovery'
      ? '/redefinir-senha?flow=recovery'
      : '/dashboard';

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

    if (previousUserIdRef.current === currentUserId) {
      return;
    }

    useClientStore.getState().resetStore();
    useProjectStore.getState().resetStore();
    usePaymentStore.getState().resetStore();
    useProposalStore.getState().resetStore();
    previousUserIdRef.current = currentUserId;
  }, [user?.id]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-transparent px-5 py-6 text-slate-900 sm:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center">
          <LoadingState
            title="Preparando sua sessao"
            description="Verificando autenticacao e conectando o painel ao Supabase."
          />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to={authenticatedHome} replace /> : <LandingPage />}
      />
      <Route
        path="/login"
        element={user ? <Navigate to={authenticatedHome} replace /> : <LoginPage />}
      />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/redefinir-senha" element={<RecoveryPasswordPage />} />
      <Route
        path="/propostas/compartilhadas/:shareId"
        element={<SharedProposalRoute />}
      />

      <Route element={<ProtectedAppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/clients/:id" element={<ClientDetailsPage />} />
        <Route path="/projetos" element={<ProjectsPage />} />
        <Route path="/pagamentos" element={<PaymentsPage />} />
        <Route path="/propostas" element={<ProposalsPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={user ? authenticatedHome : '/'} replace />}
      />
    </Routes>
  );
}

export default App;
