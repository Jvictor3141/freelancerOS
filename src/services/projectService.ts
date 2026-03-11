import { getStorageItem, setStorageItem } from '../lib/storage';
import type { Project } from '../types/project';

// essa constante é usada como chave para armazenar e buscar os projetos no localStorage. O prefixo 'freelanceros:' é uma convenção para evitar conflitos com outras chaves que possam existir no localStorage, garantindo que os dados relacionados aos projetos sejam organizados e facilmente identificáveis.
const PROJECTS_KEY = 'freelanceros:projects'; 

// essa função é responsável por buscar a lista de projetos do localStorage. Se não houver projetos salvos, ela retorna um array vazio como fallback. Se houver projetos salvos, ela os retorna como um array de objetos do tipo Project.
export function getProjects(): Project[] {
  return getStorageItem<Project[]>(PROJECTS_KEY, []);
}

// essa função é responsável por salvar a lista de projetos no localStorage usando a função setStorageItem e a chave PROJECTS_KEY. Ela recebe um array de objetos do tipo Project como parâmetro e salva esse array no localStorage para uso futuro.
export function saveProjects(projects: Project[]) {
  setStorageItem(PROJECTS_KEY, projects);
}

// essa função é responsável por criar um novo projeto. Ela recebe um objeto com os dados do projeto (exceto id e createdAt) como parâmetro, gera um ID único e a data de criação para o novo projeto, salva o novo projeto na lista de projetos existente no localStorage e retorna o novo projeto criado.
export function createProject(
  data: Omit<Project, 'id' | 'createdAt'>
): Project {
  const projects = getProjects();

  const newProject: Project = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...data,
  };

  const updatedProjects = [newProject, ...projects];
  saveProjects(updatedProjects);

  return newProject;
}

// essa função é responsável por atualizar um projeto existente. Ela recebe o ID do projeto a ser atualizado e um objeto com os novos dados do projeto (exceto id e createdAt) como parâmetros, busca a lista de projetos existente no localStorage, atualiza o projeto correspondente ao ID fornecido com os novos dados, salva a lista de projetos atualizada no localStorage e retorna o projeto atualizado. Se o projeto com o ID fornecido não for encontrado, a função retorna null.
export function updateProject(
  id: string,
  data: Omit<Project, 'id' | 'createdAt'>
): Project | null {
  const projects = getProjects();

  let updatedProject: Project | null = null;

  const updatedProjects = projects.map((project) => {
    if (project.id !== id) return project;

    updatedProject = {
      ...project,
      ...data,
    };

    return updatedProject;
  });

  saveProjects(updatedProjects);

  return updatedProject;
}

// essa função é responsável por deletar um projeto existente. Ela recebe o ID do projeto a ser deletado como parâmetro, busca a lista de projetos existente no localStorage, filtra a lista para remover o projeto correspondente ao ID fornecido e salva a lista de projetos atualizada no localStorage. A função não retorna nenhum valor.
export function deleteProject(id: string) {
  const projects = getProjects();
  const updatedProjects = projects.filter((project) => project.id !== id);
  saveProjects(updatedProjects);
}

// essa função é responsável por buscar os projetos associados a um cliente específico. Ela recebe o ID do cliente como parâmetro, busca a lista de projetos existente no localStorage e retorna um array de projetos que possuem o clientId correspondente ao ID do cliente fornecido. Se nenhum projeto for encontrado para o cliente, a função retorna um array vazio.
export function getProjectByClientId(clientId: string): Project[] {
  const projects = getProjects();
  return projects.filter((project) => project.clientId === clientId);
}
