export type Metric = {
  label: string;
  value: string;
  change: string;
  positive: boolean;
};

export type Activity = {
  id: string;
  title: string;
  description: string;
  time: string;
};

// Estes mocks mantem componentes legados compilando enquanto o dashboard principal usa dados reais do banco.
export const activities: Activity[] = [
  {
    id: 'activity-1',
    title: 'Projeto atualizado',
    description: 'O status do projeto Landing Page Institucional mudou para Revisao.',
    time: '09:15',
  },
  {
    id: 'activity-2',
    title: 'Pagamento recebido',
    description: 'Um pagamento via Pix foi confirmado no valor de R$ 2.400.',
    time: '11:40',
  },
  {
    id: 'activity-3',
    title: 'Novo cliente cadastrado',
    description: 'A empresa Studio Bloom entrou para a base ativa de clientes.',
    time: '14:05',
  },
];
