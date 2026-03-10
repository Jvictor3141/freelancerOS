import { create } from 'zustand';
import { Client } from '../types/client';
import {
    createClient as createClientService,
    deleteClient as deleteClientService,
    getClients,
    updateClient as updateClientService,
} from '../services/clientService';

// essa função é responsável por criar uma loja de estado usando a biblioteca Zustand para gerenciar o estado dos clientes no aplicativo. A loja de estado inclui a lista de clientes, o cliente selecionado, e as funções para carregar os clientes, selecionar um cliente, adicionar um novo cliente, editar um cliente existente e remover um cliente. Cada função interage com os serviços correspondentes para realizar as operações necessárias e atualiza o estado da loja de acordo.
type ClientInput = Omit<Client, 'id' | 'createdAt'>;

// essa parte define o tipo ClientStore, que descreve a estrutura do estado e das funções disponíveis na loja de clientes. O estado inclui uma lista de clientes (clients) e um cliente selecionado (selectedClient), enquanto as funções permitem carregar os clientes, selecionar um cliente, adicionar um novo cliente, editar um cliente existente e remover um cliente.
type ClientStore = {
    clients: Client[];
    selectedClient: Client | null;
    loadClients: () => void;
    selectClient: (client: Client | null) => void;
    addClient: (data: ClientInput) => void;
    editClient: (id: string, data: ClientInput) => void;
    removeClient: (id: string) => void;
};

// essa parte cria a loja de clientes usando a função create da biblioteca Zustand. A função recebe um callback que define o estado inicial da loja e as funções para manipular o estado. O estado inicial inclui uma lista vazia de clientes e um cliente selecionado nulo. As funções são implementadas para interagir com os serviços correspondentes e atualizar o estado da loja conforme necessário.
export const useClientStore = create<ClientStore>((set) => ({
    clients: [],
    selectedClient: null,

    //A função loadClients busca a lista de clientes do serviço e atualiza o estado da loja com os clientes obtidos. Ela chama a função getClients para obter a lista de clientes e, em seguida, usa a função set para atualizar o estado da loja com a lista de clientes obtida.
    loadClients: () => {
        const clients = getClients();
        set({ clients});
    },

    //A função selectClient é responsável por atualizar o cliente selecionado no estado da loja. Ela recebe um cliente como parâmetro e usa a função set para atualizar o estado da loja com o cliente selecionado. Se o cliente passado for nulo, o estado do cliente selecionado será atualizado para null, indicando que nenhum cliente está selecionado.
    selectClient: (client) => {
        set({ selectedClient: client});
    },

    //A função addClient é responsável por criar um novo cliente usando os dados fornecidos e atualizar a lista de clientes no estado da loja. Ela chama a função createClientService para criar um novo cliente com os dados fornecidos, e em seguida, usa a função set para atualizar o estado da loja adicionando o novo cliente à lista de clientes existente.
    addClient: (data) => {
        const newClient = createClientService(data);

        set((state) => ({
            clients: [newClient, ...state.clients],
        }));
    },

    //A função editClient é responsável por atualizar um cliente existente com os novos dados fornecidos. Ela recebe o ID do cliente a ser atualizado e os novos dados do cliente como parâmetros. A função chama updateClientService para atualizar o cliente com o ID fornecido usando os novos dados, e se a atualização for bem-sucedida, ela usa a função set para atualizar o estado da loja, substituindo o cliente atualizado na lista de clientes e atualizando o cliente selecionado, se ele for o cliente que foi atualizado.
    editClient: (id, data) => {
        const updatedClient = updateClientService(id, data);

        if (!updatedClient) return;

        set((state) => ({
            clients: state.clients.map((client) => 
                client.id === id ? updatedClient : client
            ),
            selectedClient:
                state.selectedClient?.id === id ? updatedClient : state.selectedClient,
        }));
    },

    //A função removeClient é responsável por deletar um cliente existente com base no ID fornecido. Ela chama deleteClientService para deletar o cliente com o ID fornecido, e em seguida, usa a função set para atualizar o estado da loja, removendo o cliente da lista de clientes e atualizando o cliente selecionado, se ele for o cliente que foi deletado.
    removeClient: (id) => {
        deleteClientService(id);

        set((state) => ({
            clients: state.clients.filter((client) => client.id !== id),
            selectedClient:
                state.selectedClient?.id === id ? null : state.selectedClient,
        }));
    },
}));