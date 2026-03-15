import { supabase, getSupabaseErrorMessage } from '../lib/supabase';
import {
  toClientPayload,
  toPaymentPayload,
  toProjectPayload,
} from '../lib/database';
import { getCurrentUserId } from './authService';
import type { Client } from '../types/client';
import type { Payment } from '../types/payment';
import type { Project } from '../types/project';

const CLIENTS_KEY = 'freelanceros:clients';
const PROJECTS_KEY = 'freelanceros:projects';
const PAYMENTS_KEY = 'freelanceros:payments';
const MIGRATION_STATE_PREFIX = 'freelanceros:supabase-migration-state';

let bootstrapPromise: Promise<void> | null = null;
let bootstrapUserId: string | null = null;

type MigrationState = 'started' | 'completed' | null;

function getMigrationStateKey(userId: string) {
  return `${MIGRATION_STATE_PREFIX}:${userId}`;
}

function getMigrationState(userId: string): MigrationState {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(getMigrationStateKey(userId));
  return value === 'started' || value === 'completed' ? value : null;
}

function setMigrationState(userId: string, state: Exclude<MigrationState, null>) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(getMigrationStateKey(userId), state);
}

function readLegacyCollection<T>(key: string): T[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? (parsedValue as T[]) : [];
  } catch {
    return [];
  }
}

async function getTableCount(
  table: 'clients' | 'projects' | 'payments',
  userId: string,
) {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        `Nao foi possivel verificar os dados de ${table} no Supabase.`,
      ),
    );
  }

  return count ?? 0;
}

async function migrateLegacyData(userId: string) {
  const migrationState = getMigrationState(userId);

  if (migrationState === 'completed') {
    return;
  }

  const legacyClients = readLegacyCollection<Client>(CLIENTS_KEY);
  const legacyProjects = readLegacyCollection<Project>(PROJECTS_KEY);
  const legacyPayments = readLegacyCollection<Payment>(PAYMENTS_KEY);

  if (
    legacyClients.length === 0 &&
    legacyProjects.length === 0 &&
    legacyPayments.length === 0
  ) {
    setMigrationState(userId, 'completed');
    return;
  }

  // A migracao local acontece uma unica vez por usuario autenticado.
  if (migrationState !== 'started') {
    const counts = await Promise.all([
      getTableCount('clients', userId),
      getTableCount('projects', userId),
      getTableCount('payments', userId),
    ]);

    if (counts.some((count) => count > 0)) {
      setMigrationState(userId, 'completed');
      return;
    }
  }

  setMigrationState(userId, 'started');

  if (legacyClients.length > 0) {
    const { error } = await supabase.from('clients').upsert(
      legacyClients.map((client) =>
        toClientPayload(
          {
            name: client.name,
            company: client.company,
            email: client.email,
            phone: client.phone,
            notes: client.notes,
          },
          {
            id: client.id,
            createdAt: client.createdAt,
            userId,
          },
        ),
      ),
      { onConflict: 'id' },
    );

    if (error) {
      throw new Error(
        getSupabaseErrorMessage(
          error,
          'Nao foi possivel migrar os clientes salvos localmente.',
        ),
      );
    }
  }

  if (legacyProjects.length > 0) {
    const { error } = await supabase.from('projects').upsert(
      legacyProjects.map((project) =>
        toProjectPayload(
          {
            clientId: project.clientId,
            name: project.name,
            description: project.description,
            value: project.value,
            deadline: project.deadline,
            status: project.status,
          },
          {
            id: project.id,
            createdAt: project.createdAt,
            userId,
          },
        ),
      ),
      { onConflict: 'id' },
    );

    if (error) {
      throw new Error(
        getSupabaseErrorMessage(
          error,
          'Nao foi possivel migrar os projetos salvos localmente.',
        ),
      );
    }
  }

  if (legacyPayments.length > 0) {
    const { error } = await supabase.from('payments').upsert(
      legacyPayments.map((payment) =>
        toPaymentPayload(
          {
            projectId: payment.projectId,
            amount: payment.amount,
            dueDate: payment.dueDate,
            paidAt: payment.paidAt,
            status: payment.status,
            method: payment.method,
            notes: payment.notes,
          },
          {
            id: payment.id,
            createdAt: payment.createdAt,
            userId,
          },
        ),
      ),
      { onConflict: 'id' },
    );

    if (error) {
      throw new Error(
        getSupabaseErrorMessage(
          error,
          'Nao foi possivel migrar os pagamentos salvos localmente.',
        ),
      );
    }
  }

  setMigrationState(userId, 'completed');
}

// Este helper garante sessao autenticada e roda a migracao local uma unica vez por usuario.
export async function ensureDatabaseBootstrap() {
  const userId = await getCurrentUserId();

  if (!bootstrapPromise || bootstrapUserId !== userId) {
    bootstrapUserId = userId;
    bootstrapPromise = migrateLegacyData(userId);
  }

  await bootstrapPromise;
  return userId;
}
