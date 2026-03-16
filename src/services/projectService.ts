import { supabase, getSupabaseErrorMessage } from '../lib/supabase';
import {
  mapProjectRecord,
  toProjectPayload,
  type ProjectInput,
  type ProjectRecord,
} from '../lib/database';
import { ensureDatabaseBootstrap } from './bootstrapService';
import type { Project } from '../types/project';

// O service de projetos agora filtra e grava usando user_id para respeitar as policies do banco.
export async function getProjects(): Promise<Project[]> {
  const userId = await ensureDatabaseBootstrap();

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível carregar os projetos no banco.',
      ),
    );
  }

  return (data as ProjectRecord[] | null)?.map(mapProjectRecord) ?? [];
}

export async function createProject(data: ProjectInput): Promise<Project> {
  const userId = await ensureDatabaseBootstrap();

  const { data: createdProject, error } = await supabase
    .from('projects')
    .insert(toProjectPayload(data, { userId }))
    .select()
    .single();

  if (error || !createdProject) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível criar o projeto no banco.',
      ),
    );
  }

  return mapProjectRecord(createdProject as ProjectRecord);
}

export async function updateProject(
  id: string,
  data: ProjectInput,
): Promise<Project> {
  const userId = await ensureDatabaseBootstrap();

  const { data: updatedProject, error } = await supabase
    .from('projects')
    .update(toProjectPayload(data, { userId }))
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error || !updatedProject) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível atualizar o projeto no banco.',
      ),
    );
  }

  return mapProjectRecord(updatedProject as ProjectRecord);
}

export async function deleteProject(id: string) {
  const userId = await ensureDatabaseBootstrap();

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new Error(
      getSupabaseErrorMessage(
        error,
        'Não foi possível excluir o projeto no banco.',
      ),
    );
  }
}
