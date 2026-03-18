import type { Client } from '../types/client'

export function getClientActionButtonClassName(
  tone: 'neutral' | 'danger',
) {
  if (tone === 'danger') {
    return 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
  }

  return 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
}

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
