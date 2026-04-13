# FreelancerOS

FreelancerOS e um painel SaaS para freelancers organizarem clientes, propostas, projetos e pagamentos em um unico fluxo.

Hoje o projeto e uma aplicacao React + Vite com autenticacao no Supabase, persistencia em banco, sincronizacao realtime, read models SQL para dashboard/detalhes e um fluxo publico para compartilhamento seguro de propostas.

## O que existe no projeto atual

- landing page publica com suporte a `pt` e `en`
- autenticacao com email e senha, callback de auth e recuperacao de senha
- dashboard autenticado com metricas, grafico de receita, alertas e atividades recentes
- CRUD de clientes com busca e pagina de detalhes financeiros
- CRUD de projetos com filtros por status e cliente
- CRUD de pagamentos com filtros, marcacao manual como pago e leitura de pendencias
- CRUD de propostas com status `draft`, `sent`, `accepted` e `rejected`
- envio assistido de propostas via `mailto:` com assunto e corpo preenchidos
- aceite de proposta gerando projeto automaticamente
- link seguro de proposta com expiracao e pagina publica para aceite ou recusa sem login
- configuracoes de tema, perfil comercial do freelancer, notificacoes e atualizacao de senha
- sincronizacao realtime das tabelas principais com invalidador de snapshots
- migracao automatica de dados legados do `localStorage` para o Supabase na primeira sessao autenticada

## Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- React Router 7
- Zustand
- Supabase Auth
- Supabase Postgres + RLS
- Supabase Edge Functions
- Recharts
- Vitest
- ESLint

## Estrutura principal

- `src/pages`: rotas principais da aplicacao
- `src/features`: composicao por dominio (`dashboard`, `clients`, `projects`, `payments`, `proposals`)
- `src/components`: componentes reutilizaveis, formularios e modais
- `src/services`: integracao com Supabase, RPCs e fluxos de negocio
- `src/stores`: estado global com Zustand
- `src/utils`: regras puras, formatacao e agregacoes
- `src/i18n`: configuracao de idioma, moeda e navegacao com `/:lang`
- `supabase/schema.sql`: schema consolidado para ambiente novo
- `supabase/migrations`: historico de evolucao do banco para ambientes existentes
- `supabase/functions/proposal-share`: Edge Function para links seguros de propostas

## Idiomas e moedas

- idiomas suportados: `pt` e `en`
- moedas suportadas na aplicacao: `BRL`, `USD` e `EUR`
- o dashboard e os detalhes financeiros trabalham por moeda para evitar soma incorreta entre valores de denominacoes diferentes

## Rotas importantes

- o app principal usa rotas com prefixo de idioma, por exemplo `/:lang/dashboard`
- para links externos, o app tambem aceita entradas sem `/:lang` em:
  - `/login`
  - `/auth/callback`
  - `/redefinir-senha`
  - `/propostas/compartilhadas/:shareId`

Isso evita quebrar links de email, callback de autenticacao e compartilhamento publico quando o idioma do usuario ainda nao e conhecido.

## Como rodar localmente

### 1. Instale as dependencias

```bash
pnpm install
```

### 2. Configure o `.env`

Use estas variaveis no front-end:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_publishable_key
VITE_SITE_URL=http://localhost:5173

# opcional: cria sessao anonima automaticamente se nao houver login
VITE_SUPABASE_AUTO_ANON_AUTH=false
```

Observacoes:

- `VITE_SUPABASE_ANON_KEY` tambem e aceito como fallback no cliente, mas o projeto hoje prioriza `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SITE_URL` deve apontar para a origem publica do front-end
- o callback externo usado pelo auth continua sendo `/auth/callback`

### 3. Configure o banco no Supabase

#### Ambiente novo

Execute o conteudo de `supabase/schema.sql` no SQL Editor do projeto Supabase.

Esse arquivo ja inclui:

- tabelas de `clients`, `projects`, `payments`, `proposals` e `proposal_share_links`
- colunas de moeda alinhadas ao app atual
- indices
- policies com RLS por `user_id`
- view `payments_read_model`
- funcoes SQL `get_dashboard_snapshot` e `get_client_details_snapshot`
- funcoes SQL `accept_proposal` e `respond_to_shared_proposal`

#### Ambiente existente

Se o projeto Supabase ja existe e voce esta atualizando uma base antiga, aplique as migrations pendentes em `supabase/migrations`.

Para alinhar o estado atual do app com as moedas suportadas e os read models, a migration mais importante neste momento e:

```text
supabase/migrations/20260413_supported_currencies_and_read_models.sql
```

Essa migration:

- restringe moedas a `BRL`, `USD` e `EUR`
- reconstrui `payments_read_model`
- reconstrui `get_dashboard_snapshot`
- reconstrui `get_client_details_snapshot`

Importante:

- se sua base ainda tiver registros com `GBP`, normalize esses dados antes de aplicar essa migration
- se voce estiver provisionando um ambiente novo, use `supabase/schema.sql` em vez de aplicar migrations manualmente uma por uma

### 4. Configure o Auth

No Supabase Auth:

- habilite login por email e senha
- configure a `Site URL` para a origem do front-end
- garanta que o callback externo usado pelo app esteja permitido: `/auth/callback`

Se for usar `VITE_SUPABASE_AUTO_ANON_AUTH=true`, tambem e necessario habilitar Anonymous Sign-Ins no Supabase.

### 5. Publique a Edge Function de compartilhamento

O modulo de link seguro de propostas depende da function `proposal-share`.

Publique a function no mesmo projeto Supabase do front-end e configure os secrets abaixo:

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
PUBLIC_APP_URL=http://localhost:5173
```

Observacoes:

- `PUBLIC_APP_URL` deve apontar para a origem publica do front-end
- o link compartilhado usa a rota externa `/propostas/compartilhadas/:shareId`
- sem essa function, o restante do painel funciona, mas o compartilhamento publico de propostas fica indisponivel

### 6. Rode o projeto

```bash
pnpm dev
```

## Scripts

```bash
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm lint:fix
pnpm typecheck
pnpm test
pnpm test:watch
pnpm check
```

## Testes

Os testes automatizados atuais cobrem principalmente regras puras e alguns fluxos criticos de store:

- agregacoes financeiras
- datas sem drift de timezone
- validacao de email usada no fluxo de `mailto:`
- regras de status de pagamentos
- regras comerciais de propostas
- notificacoes operacionais do header
- conciliacao de recarga concorrente na `useProposalStore`

Hoje a suite nao cobre interface via browser nem testes E2E.

## Limites atuais importantes

- o envio de proposta abre o cliente de email do usuario via `mailto:`; o app nao envia email transacional por conta propria
- a CI em `.github/workflows/ci.yml` roda `lint` e `build`, mas ainda nao executa `pnpm test`
- a feature de compartilhamento seguro depende da Edge Function `proposal-share`; sem ela, o restante do painel continua funcional

## Observacoes de deploy

- `vercel.json` trata o rewrite da SPA para `index.html`
- `vercel.json` aplica headers de seguranca como `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options` e `Referrer-Policy`
- o deploy cobre rotas com e sem `/:lang` para auth, painel e compartilhamento publico
- `VITE_SITE_URL` e `PUBLIC_APP_URL` precisam apontar para o dominio correto em producao
