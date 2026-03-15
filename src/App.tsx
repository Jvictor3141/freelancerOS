import { useEffect, useRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './layout/DashboardLayout';
import { ClientDetailsPage } from './pages/ClientDetailsPage';
import { ClientsPage } from './pages/ClientsPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProposalsPage } from './pages/ProposalsPage';
import { SettingsPage } from './pages/SettingsPage';
import { useAuthStore } from './store/useAuthStore';
import { useClientStore } from './store/useClientStore';
import { usePaymentStore } from './store/usePaymentStore';
import { useProjectStore } from './store/useProjectStore';

function App() {
  const { user, initialized, initialize } = useAuthStore();
  const previousUserIdRef = useRef<string | null>(null);

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

  // Quando a conta muda, limpamos as stores para nao reaproveitar dados de outra sessao.
  useEffect(() => {
    const currentUserId = user?.id ?? null;

    if (previousUserIdRef.current === currentUserId) {
      return;
    }

    useClientStore.getState().resetStore();
    useProjectStore.getState().resetStore();
    usePaymentStore.getState().resetStore();
    previousUserIdRef.current = currentUserId;
  }, [user?.id]);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-transparent px-5 py-6 text-slate-900 sm:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl items-center justify-center rounded-[36px] border border-slate-200 bg-white/80 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="space-y-3 text-center">
            <p className="text-sm font-medium text-slate-500">
              FreelancerOS
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
              Preparando sua sessao
            </h1>
            <p className="text-sm text-slate-500">
              Verificando autenticacao e conectando o painel ao Supabase.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/clientes" element={<ClientsPage />} />
        <Route path="/clients/:id" element={<ClientDetailsPage />} />
        <Route path="/projetos" element={<ProjectsPage />} />
        <Route path="/pagamentos" element={<PaymentsPage />} />
        <Route path="/propostas" element={<ProposalsPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
      </Routes>
    </DashboardLayout>
  );
}

export default App;
