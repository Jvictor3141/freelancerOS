# FreelancerOS

FreelancerOS e um painel SaaS para freelancers organizarem clientes, propostas, projetos e pagamentos em um unico fluxo.

O projeto hoje e uma aplicacao React + Vite com autenticacao no Supabase, persistencia em banco, regras comerciais no front-end e um fluxo publico para compartilhamento seguro de propostas.

## O que existe no projeto atual

- landing page publica com CTA para cadastro e login
- autenticacao com email e senha, callback de auth e recuperacao de senha
- dashboard autenticado com metricas, grafico de receita, alertas e atividades recentes
- CRUD de clientes com busca e pagina de detalhes financeiros
- CRUD de projetos com filtros por status e cliente
- CRUD de pagamentos com filtros, marcacao manual como pago e leitura de pendencias
- CRUD de propostas com status `draft`, `sent`, `accepted` e `rejected`
- aceite de proposta gerando projeto automaticamente
- link seguro de proposta com expiracao e pagina publica para aceite ou recusa
- configuracoes de tema, perfil comercial do freelancer e atualizacao de senha
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
- `src/services`: integracao com Supabase e fluxos de negocio
- `src/stores`: estado global com Zustand
- `src/utils`: regras puras, formatacao e agregacoes
- `supabase/schema.sql`: schema consolidado, RLS e RPC `accept_proposal`
- `supabase/functions/proposal-share`: Edge Function para links seguros de propostas

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
- `VITE_SITE_URL` e usado para montar os redirects de autenticacao

### 3. Suba o schema no Supabase

Execute o conteudo de `supabase/schema.sql` no SQL Editor do projeto Supabase.

Esse arquivo ja inclui:

- tabelas de `clients`, `projects`, `payments`, `proposals` e `proposal_share_links`
- indices
- policies com RLS por `user_id`
- funcao SQL `accept_proposal`

As migrations em `supabase/migrations` existem como historico da evolucao, mas o ponto de entrada para um ambiente novo e o `schema.sql`.

### 4. Configure o Auth

No Supabase Auth:

- habilite login por email e senha
- configure a `Site URL` para a URL local ou de producao
- libere a rota de callback usada pelo app: `/auth/callback`

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

Sem essa function, o restante do painel funciona, mas o compartilhamento publico de propostas fica indisponivel.

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

Os testes automatizados atuais cobrem regras utilitarias centrais, principalmente:

- agregacoes financeiras
- regras de status de pagamentos
- regras comerciais de propostas

## Observacoes de deploy

- `vercel.json` ja trata o rewrite da SPA para `index.html`
- o link publico de proposta usa `PUBLIC_APP_URL` na Edge Function e `VITE_SITE_URL` no front-end, entao essas URLs precisam apontar para o dominio correto em producao
