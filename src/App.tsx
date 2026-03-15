import { Suspense, lazy, useEffect, useRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RouteTransition } from './components/RouteTransition';
import { DashboardLayout } from './layout/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { usePreferencesStore } from './store/usePreferencesStore';
import { useAuthStore } from './store/useAuthStore';
import { useClientStore } from './store/useClientStore';
import { usePaymentStore } from './store/usePaymentStore';
import { useProposalStore } from './store/useProposalStore';
import { useProjectStore } from './store/useProjectStore';

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
      <p className="text-sm font-medium text-slate-500">FreelancerOS</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function App() {
  const { user, initialized, initialize } = useAuthStore();
  const theme = usePreferencesStore((state) => state.theme);
  const previousUserIdRef = useRef<string | null>(null);

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

  if (!user) {
    return <LoginPage />;
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
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/clientes" element={<ClientsPage />} />
            <Route path="/clients/:id" element={<ClientDetailsPage />} />
            <Route path="/projetos" element={<ProjectsPage />} />
            <Route path="/pagamentos" element={<PaymentsPage />} />
            <Route path="/propostas" element={<ProposalsPage />} />
            <Route path="/configuracoes" element={<SettingsPage />} />
          </Routes>
        </RouteTransition>
      </Suspense>
    </DashboardLayout>
  );
}

export default App;
