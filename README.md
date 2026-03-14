# FreelancerOS

FreelancerOS é um dashboard SaaS para freelancers organizarem clientes, projetos e pagamentos em um único lugar.

O projeto começou como um MVP visual e evoluiu para uma aplicação front-end funcional com persistência local, CRUD real e dashboard conectado aos dados da operação.

## Funcionalidades atuais

- cadastro, edição e exclusão de clientes
- cadastro, edição e exclusão de projetos
- vínculo entre projetos e clientes
- cadastro, edição e exclusão de pagamentos
- marcação de pagamento como pago
- identificação de pagamentos pendentes e atrasados
- dashboard com métricas reais
- gráfico de entradas de dinheiro com base em pagamentos recebidos
- alertas de clientes com cobranças pendentes ou vencidas
- persistência no `localStorage`

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS v4
- React Router
- Zustand
- Recharts
- Lucide React

## Rodar localmente

```bash
pnpm install
pnpm dev