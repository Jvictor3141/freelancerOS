import { Database, ShieldCheck, UserRound, Workflow } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useClientStore } from '../store/useClientStore';
import { usePaymentStore } from '../store/usePaymentStore';
import { useProjectStore } from '../store/useProjectStore';

type StatusItem = {
  label: string;
  value: string;
  tone?: 'default' | 'success';
};

function StatusList({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: StatusItem[];
}) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
      <p className="text-sm font-medium text-slate-500">{description}</p>
      <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
        {title}
      </h3>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex flex-col gap-2 rounded-2xl border border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm font-medium text-slate-700">
              {item.label}
            </span>
            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                item.tone === 'success'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

export function SettingsPage() {
  const { user } = useAuthStore();
  const {
    clients,
    initialized: clientsInitialized,
    loadClients,
  } = useClientStore();
  const {
    projects,
    initialized: projectsInitialized,
    loadProjects,
  } = useProjectStore();
  const {
    payments,
    initialized: paymentsInitialized,
    loadPayments,
  } = usePaymentStore();

  useEffect(() => {
    if (!clientsInitialized) {
      void loadClients();
    }

    if (!projectsInitialized) {
      void loadProjects();
    }

    if (!paymentsInitialized) {
      void loadPayments();
    }
  }, [
    clientsInitialized,
    loadClients,
    loadPayments,
    loadProjects,
    paymentsInitialized,
    projectsInitialized,
  ]);

  const accountItems = useMemo<StatusItem[]>(() => {
    return [
      {
        label: 'Conta ativa',
        value: user?.email ?? 'Usuario autenticado',
        tone: 'success',
      },
      {
        label: 'Sessao protegida',
        value: 'Supabase Auth',
        tone: 'success',
      },
      {
        label: 'Modo de acesso',
        value:
          import.meta.env.VITE_SUPABASE_AUTO_ANON_AUTH === 'true'
            ? 'Login ou sessao anonima'
            : 'Login obrigatorio',
      },
    ];
  }, [user?.email]);

  const workspaceItems = useMemo<StatusItem[]>(() => {
    return [
      {
        label: 'Clientes cadastrados',
        value: String(clients.length),
      },
      {
        label: 'Projetos ativos no workspace',
        value: String(projects.length),
      },
      {
        label: 'Pagamentos registrados',
        value: String(payments.length),
      },
    ];
  }, [clients.length, payments.length, projects.length]);

  const infraItems = useMemo<StatusItem[]>(() => {
    return [
      {
        label: 'VITE_SUPABASE_URL',
        value: import.meta.env.VITE_SUPABASE_URL ? 'Configurada' : 'Ausente',
        tone: import.meta.env.VITE_SUPABASE_URL ? 'success' : 'default',
      },
      {
        label: 'Publishable key',
        value:
          import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
          import.meta.env.VITE_SUPABASE_ANON_KEY
            ? 'Configurada'
            : 'Ausente',
        tone:
          import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
          import.meta.env.VITE_SUPABASE_ANON_KEY
            ? 'success'
            : 'default',
      },
      {
        label: 'Persistencia de sessao',
        value: 'Ativa no cliente',
        tone: 'success',
      },
    ];
  }, []);

  const recommendations = useMemo(() => {
    const items: string[] = [];

    if (clients.length === 0) {
      items.push('Cadastrar a primeira base de clientes.');
    }

    if (projects.length === 0) {
      items.push('Criar projetos para alimentar dashboard e propostas.');
    }

    if (payments.length === 0) {
      items.push('Registrar pagamentos para ativar o controle financeiro.');
    }

    if (items.length === 0) {
      items.push(
        'A estrutura minima do app esta preenchida. O proximo ganho real esta em relatorios e automacoes.',
      );
    }

    return items;
  }, [clients.length, payments.length, projects.length]);

  if (!clientsInitialized || !projectsInitialized || !paymentsInitialized) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">Configuracoes</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
          Carregando dados do ambiente...
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Validando conta ativa, estrutura do workspace e configuracao do
          Supabase.
        </p>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
          <div className="mb-5 inline-flex rounded-2xl bg-indigo-50 p-3 text-[#635bff]">
            <UserRound size={18} />
          </div>
          <p className="text-sm font-medium text-slate-500">Conta e acesso</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Configuracao real do painel
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Esta pagina deixou de ser um conjunto de toggles estaticos. Agora
            ela mostra o estado real da conta, do ambiente e do workspace.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 inline-flex rounded-2xl bg-white p-3 text-slate-700 shadow-sm shadow-slate-200">
                <ShieldCheck size={18} />
              </div>
              <p className="text-sm text-slate-500">Autenticacao</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                Ativa
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 inline-flex rounded-2xl bg-white p-3 text-slate-700 shadow-sm shadow-slate-200">
                <Database size={18} />
              </div>
              <p className="text-sm text-slate-500">Banco</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                Supabase
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 inline-flex rounded-2xl bg-white p-3 text-slate-700 shadow-sm shadow-slate-200">
                <Workflow size={18} />
              </div>
              <p className="text-sm text-slate-500">Workspace</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {clients.length + projects.length + payments.length} registros
              </p>
            </div>
          </div>
        </article>

        <StatusList
          title="Checklist da conta"
          description="Status atual"
          items={accountItems}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <StatusList
          title="Volume do workspace"
          description="Uso atual"
          items={workspaceItems}
        />

        <StatusList
          title="Infraestrutura"
          description="Ambiente"
          items={infraItems}
        />
      </section>

      <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
        <p className="text-sm font-medium text-slate-500">
          Proximos passos recomendados
        </p>
        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          O que move o produto daqui para frente
        </h3>

        <ul className="mt-6 space-y-3 text-sm leading-6 text-slate-600">
          {recommendations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </article>
    </div>
  );
}
