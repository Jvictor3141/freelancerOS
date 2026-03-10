import type { Client } from '../types/client';

export const seedClients: Client[] = [ // essa função é responsável por criar uma lista de clientes de exemplo para ser usada como dados iniciais no aplicativo. Cada cliente tem um ID único, nome, empresa, email, telefone, notas e data de criação.
    
    {
        id: crypto.randomUUID(), // gera um ID único para cada cliente usando a função crypto.randomUUID(), que é uma forma segura de gerar identificadores únicos.
        name: 'João Silva',
        company: 'Studion Bloom',
        email: 'joao@studioblooom.com',
        phone: '(83) 99999-9999',
        notes: 'Cliente recorrente, costuma pedir revisões rápidas.',
        createdAt: new Date().toISOString(), // armazena a data de criação do cliente como uma string no formato ISO usando new Date().toISOString(), o que facilita a ordenação e exibição das datas posteriormente.
    },
    {
        id: crypto.randomUUID(), 
        name: 'Maria Souza',
        company: 'Souza Marketing',
        email: 'maria@souzamarketing.com',
        phone: '(83) 98888-8888',
        notes: 'Prefere contato por email.',
        createdAt: new Date().toISOString(),
    }
]