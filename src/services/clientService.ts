import { seedClients } from "../data/seedClients";
import { getStorageItem, setStorageItem } from "../lib/storage";
import type { Client } from "../types/client";

const CLIENTS_KEY = 'freelanceros:clients'; // essa constante é usada como chave para armazenar e buscar os clientes no localStorage. O prefixo 'freelanceros:' é uma convenção para evitar conflitos com outras chaves que possam existir no localStorage, garantindo que os dados relacionados aos clientes sejam organizados e facilmente identificáveis.

export function getClients(): Client[] { // essa função é responsável por buscar a lista de clientes do localStorage. Se não houver clientes salvos, ela retorna uma lista de clientes de exemplo (seedClients) e salva essa lista no localStorage para uso futuro. Se houver clientes salvos, ela os retorna como um array de objetos do tipo Client.
    const clients = getStorageItem<Client[]>(CLIENTS_KEY, []); // essa linha chama a função getStorageItem para buscar os clientes do localStorage usando a chave CLIENTS_KEY. Se não houver clientes salvos, ela retorna um array vazio como fallback.

    if (clients.length === 0) { // essa condição verifica se a lista de clientes está vazia. Se estiver vazia, significa que não há clientes salvos no localStorage, então a função salva a lista de clientes de exemplo (seedClients) no localStorage usando a função setStorageItem e retorna essa lista de clientes de exemplo.
        setStorageItem(CLIENTS_KEY, seedClients);
        return seedClients;
    }

    return clients;
}

// essa função é responsável por salvar a lista de clientes no localStorage usando a função setStorageItem e a chave CLIENTS_KEY. Ela recebe um array de objetos do tipo Client como parâmetro e salva esse array no localStorage para uso futuro.
export function saveClients(clients: Client[]) {
    setStorageItem(CLIENTS_KEY, clients);
}

// essa função é responsável por criar um novo cliente. Ela recebe um objeto com os dados do cliente (exceto id e createdAt) como parâmetro, gera um ID único e a data de criação para o novo cliente, salva o novo cliente na lista de clientes existente no localStorage e retorna o novo cliente criado.
export function createClient(data: Omit<Client, 'id' | 'createdAt'>) {
    const clients = getClients();

    const newClient: Client = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...data,
    };

    const updateClients = [newClient, ...clients]; // essa linha cria uma nova lista de clientes que inclui o novo cliente criado (newClient) seguido pelos clientes existentes (clients). O operador spread (...) é usado para combinar o novo cliente com a lista de clientes existente, garantindo que o novo cliente seja adicionado ao início da lista.
    saveClients(updateClients);

    return newClient;
}

// essa função é responsável por atualizar um cliente existente. Ela recebe o ID do cliente a ser atualizado e um objeto com os novos dados do cliente (exceto id e createdAt) como parâmetros, busca a lista de clientes existente no localStorage, atualiza o cliente correspondente ao ID fornecido com os novos dados, salva a lista de clientes atualizada no localStorage e retorna o cliente atualizado. Se o cliente com o ID fornecido não for encontrado, a função retorna null.
export function updateClient(id: string, data: Omit<Client, 'id' | 'createdAt'>): Client | null {
    const clients = getClients();

    let updatedClient: Client | null = null; // essa variável é usada para armazenar o cliente atualizado durante o processo de atualização. Ela é inicializada como null e será atribuída ao cliente atualizado quando o cliente correspondente ao ID fornecido for encontrado e atualizado na lista de clientes.

    // essa parte percorre a lista de clientes existente (clients) usando o método map para criar uma nova lista de clientes atualizada. Para cada cliente na lista, a função verifica se o ID do cliente corresponde ao ID fornecido como parâmetro. Se o ID não corresponder, o cliente é retornado sem alterações. Se o ID corresponder, um novo objeto de cliente é criado combinando os dados existentes do cliente com os novos dados fornecidos (usando o operador spread ...), e esse novo objeto de cliente atualizado é retornado. A variável updatedClient é usada para armazenar o cliente atualizado para que possa ser retornado no final da função.
    const updatedClients = clients.map((client) => {
        if (client.id !== id) return client;

        // essa parte cria um novo objeto de cliente atualizado combinando os dados existentes do cliente com os novos dados fornecidos. O operador spread (...) é usado para combinar as propriedades do cliente existente com as propriedades do objeto de dados fornecido, garantindo que o cliente atualizado mantenha suas propriedades originais (como id e createdAt) enquanto atualiza as propriedades que foram modificadas.
        updatedClient = { 
            ...client,
            ...data,
        };

        return updatedClient;
    });

    saveClients(updatedClients);

    return updatedClient;
}

// essa função é responsável por deletar um cliente existente. Ela recebe o ID do cliente a ser deletado como parâmetro, busca a lista de clientes existente no localStorage, filtra a lista para remover o cliente correspondente ao ID fornecido, salva a lista de clientes atualizada no localStorage e não retorna nenhum valor. Se o cliente com o ID fornecido não for encontrado, a função simplesmente salva a lista de clientes sem alterações.
export function deleteClient(id: string) {
    const clients = getClients();
    const updatedClients = clients.filter((client) => client.id !== id);
    saveClients(updatedClients);
}