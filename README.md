<div align="center">

<img src="src/assets/freelanceros-logo.svg" alt="FreelancerOS" width="200" />

# FreelancerOS

**O painel operacional do freelancer moderno.**  
Gerencie clientes, projetos, propostas e pagamentos em um único fluxo — com sincronização em tempo real e suporte multilíngue.

[![CI](https://github.com/Jvictor3141/freelanceros/actions/workflows/ci.yml/badge.svg)](https://github.com/Jvictor3141/freelanceros/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white)

[Demo](https://usefreelanceros.app) · [Reportar Bug](https://github.com/Jvictor3141/freelanceros/issues) · [Solicitar Feature](https://github.com/Jvictor3141/freelanceros/issues)

</div>

---

## Visão Geral

FreelancerOS é um SaaS para freelancers organizarem toda a sua operação comercial em um só lugar. O produto oferece um dashboard com métricas financeiras em tempo real, gerenciamento completo do ciclo de vida de propostas — incluindo compartilhamento seguro com links de expiração — e controle de clientes, projetos e pagamentos com suporte a múltiplas moedas.

## Funcionalidades

- **Dashboard** — métricas financeiras, gráfico de receita, alertas e atividades recentes, tudo calculado via read models SQL otimizados
- **Clientes** — CRUD com busca, página de detalhes com histórico financeiro consolidado por cliente
- **Projetos** — CRUD com filtros por status e vínculo a clientes
- **Pagamentos** — controle de vencimentos, marcação manual como pago e visão de pendências
- **Propostas** — ciclo completo (`draft → sent → accepted/rejected`), envio assistido via `mailto:` e aceite automático gerando projeto
- **Compartilhamento seguro** — links com expiração via Supabase Edge Function; aceite ou recusa sem necessidade de login
- **Múltiplas moedas** — `BRL`, `USD` e `EUR` com agregações separadas para evitar soma incorreta entre denominações
- **Tempo real** — sincronização das tabelas principais com invalidador de snapshots via Supabase Realtime
- **Internacionalização** — `pt` e `en` com rotas prefixadas por idioma (`/:lang/dashboard`)
- **Configurações** — perfil comercial do freelancer, preferências de tema, notificações e troca de senha
- **Migração automática** — dados legados do `localStorage` migrados para o Supabase na primeira sessão autenticada

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19, TypeScript, Vite 7 |
| Estilização | Tailwind CSS 4 |
| Roteamento | React Router 7 |
| Estado Global | Zustand |
| Backend / Auth | Supabase (PostgreSQL, Auth, RLS, Edge Functions) |
| Gráficos | Recharts |
| Ícones | Lucide React |
| i18n | i18next + react-i18next |
| Testes | Vitest |
| Linting | ESLint 9 |
| Package Manager | pnpm |
| Deploy | Vercel |

## Estrutura do Projeto

```
freelanceros/
├── .github/workflows/        # CI: lint + build no push/PR
├── supabase/
│   ├── schema.sql            # Schema consolidado para ambiente novo
│   ├── migrations/           # Histórico de evolução do banco
│   └── functions/
│       └── proposal-share/   # Edge Function para links seguros
├── src/
│   ├── pages/                # Componentes de rota (12 páginas)
│   ├── features/             # Composição por domínio
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── projects/
│   │   ├── payments/
│   │   └── proposals/
│   ├── components/           # Componentes reutilizáveis e formulários
│   ├── services/             # Integração com Supabase e lógica de negócio
│   ├── stores/               # Estado global com Zustand
│   ├── types/                # Interfaces TypeScript
│   ├── utils/                # Funções puras e regras de domínio
│   ├── i18n/                 # Configuração de idioma e moeda
│   ├── locales/              # Traduções (pt.json, en.json)
│   └── lib/                  # Helpers e hooks customizados
└── public/                   # Assets estáticos e SEO
```

## Começando

### Pré-requisitos

- Node.js 22+
- pnpm 10+
- Uma conta no [Supabase](https://supabase.com)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Jvictor3141/freelanceros.git
cd freelanceros

# Instale as dependências
pnpm install
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_publishable_key
VITE_SITE_URL=http://localhost:5173
```

> `VITE_SUPABASE_ANON_KEY` também é aceito como fallback, mas o projeto prioriza `VITE_SUPABASE_PUBLISHABLE_KEY`.

### Configuração do Banco de Dados

#### Ambiente novo

Execute o conteúdo de `supabase/schema.sql` no SQL Editor do Supabase. O arquivo inclui:

- Tabelas: `clients`, `projects`, `payments`, `proposals`, `proposal_share_links`
- View: `payments_read_model`
- Funções SQL: `get_dashboard_snapshot`, `get_client_details_snapshot`, `accept_proposal`, `respond_to_shared_proposal`
- Políticas RLS por `user_id` e índices

#### Ambiente existente

Aplique as migrations pendentes em `supabase/migrations/` em ordem cronológica. A migration mais relevante é:

```
supabase/migrations/20260413_supported_currencies_and_read_models.sql
```

Ela restringe moedas a `BRL`, `USD` e `EUR` e reconstrói os read models. Se sua base tiver registros com `GBP`, normalize esses dados antes de aplicá-la.

### Configuração do Auth

No painel do Supabase → Authentication:

1. Habilite **Email/Password** login
2. Configure a **Site URL** para a origem do front-end
3. Adicione `/auth/callback` como redirect URL permitida

### Edge Function de Compartilhamento

O módulo de links seguros de propostas depende da Edge Function `proposal-share`. Para publicá-la:

```bash
supabase functions deploy proposal-share
```

Configure os secrets da função:

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
PUBLIC_APP_URL=https://seu-dominio.com
```

> Sem esta função, o restante do painel continua funcional. Apenas o compartilhamento público de propostas ficará indisponível.

### Rodando Localmente

```bash
pnpm dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `pnpm dev` | Inicia o servidor de desenvolvimento |
| `pnpm build` | Gera o build de produção |
| `pnpm preview` | Pré-visualiza o build de produção |
| `pnpm lint` | Verifica o código com ESLint |
| `pnpm lint:fix` | Corrige problemas de lint automaticamente |
| `pnpm typecheck` | Verifica tipagem TypeScript |
| `pnpm test` | Executa a suíte de testes |
| `pnpm test:watch` | Executa testes em modo watch |
| `pnpm check` | Roda lint + typecheck + testes |

## Testes

A suíte de testes cobre regras de domínio puras e fluxos críticos de store:

- Agregações financeiras e formatação de moeda
- Datas sem drift de timezone (`dateOnly`)
- Validação de email usada no fluxo de `mailto:`
- Regras de status de pagamentos e projetos
- Regras de negócio de propostas
- Notificações operacionais do header
- Conciliação de recarga concorrente na `useProposalStore`

> A CI atual roda `lint` + `build`. Testes ainda não estão integrados ao pipeline.

## Roteamento

O app usa rotas prefixadas por idioma para as páginas autenticadas:

```
/:lang(pt|en)/dashboard
/:lang/clientes
/:lang/projetos
/:lang/pagamentos
/:lang/propostas
/:lang/configuracoes
```

As rotas externas (auth, callback, compartilhamento) não utilizam o prefixo de idioma para garantir compatibilidade com links de e-mail e callbacks de autenticação:

```
/login
/auth/callback
/redefinir-senha
/propostas/compartilhadas/:shareId
```

## Deploy

O projeto está configurado para deploy na Vercel via `vercel.json`:

- **SPA Rewrite**: todas as rotas são redirecionadas para `index.html`
- **Security Headers**: `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- **Cache**: rotas do dashboard com `Cache-Control: no-store`
- **SEO**: `X-Robots-Tag: noindex` em rotas autenticadas, callback e proposta pública

Em produção, `VITE_SITE_URL` e `PUBLIC_APP_URL` devem apontar para o domínio correto.

## Limitações Conhecidas

- O envio de proposta utiliza `mailto:` — o app não realiza envio de e-mail transacional por conta própria
- Testes automatizados não estão integrados ao pipeline de CI
- O compartilhamento seguro de propostas requer a Edge Function `proposal-share` deployada no mesmo projeto Supabase
