import type { Client } from '../types/client'

export function getFilteredClients(clients: Client[], search: string) {
  const term = search.trim().toLowerCase()

  if (!term) {
    return clients
  }

  return clients.filter((client) => {
    return (
      client.name.toLowerCase().includes(term) ||
      client.company.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term)
    )
  })
}
