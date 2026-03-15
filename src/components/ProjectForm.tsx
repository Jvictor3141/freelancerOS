import { useEffect, useState } from 'react';
import type { Client } from '../types/client';
import type { Project, ProjectStatus } from '../types/project';
import { projectStatusLabel } from '../utils/projectStatus';

//aqui definimos os tipos para os valores do formulário de projeto e as props do componente ProjectForm. O tipo ProjectFormValues é uma versão simplificada do tipo Project, omitindo os campos id e createdAt, que são gerados automaticamente. O tipo ProjectFormProps define as propriedades que o componente espera receber, incluindo a lista de clientes, os valores iniciais do projeto (se houver), a função de callback para quando o formulário for submetido e a função de callback para quando o formulário for cancelado.
type ProjectFormValues = Omit<Project, 'id' | 'createdAt'>;

// nesse tipo, definimos as propriedades que o componente ProjectForm espera receber. Ele inclui uma lista de clientes (clients), os valores iniciais do projeto (initialValues) que podem ser nulos, uma função de callback (onSubmit) que é chamada quando o formulário é submetido com os valores do formulário, e uma função de callback (onCancel) que é chamada quando o formulário é cancelado. Essas props permitem que o componente ProjectForm seja reutilizável para criar ou editar projetos, dependendo dos valores iniciais fornecidos.
type ProjectFormProps = {
  clients: Client[];
  initialValues?: Project | null;
  onSubmit: (values: ProjectFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
};

// aqui definimos os valores iniciais do formulário de projeto, que são usados para preencher os campos do formulário quando o componente é montado ou quando os valores iniciais são atualizados. Esses valores incluem um clientId vazio, um nome vazio, uma descrição vazia, um valor de 0, um prazo vazio e um status inicial de 'proposal'. Esses valores garantem que o formulário comece com campos vazios ou com um status padrão quando for usado para criar um novo projeto.
const emptyValues: ProjectFormValues = {
  clientId: '',
  name: '',
  description: '',
  value: 0,
  deadline: '',
  status: 'proposal',
};

// aqui definimos as opções de status para os projetos, que são usadas para preencher o campo de seleção de status no formulário. Essas opções incluem os status 'proposal', 'in_progress', 'review' e 'completed', que correspondem aos diferentes estágios do ciclo de vida de um projeto. Essas opções permitem que os usuários do aplicativo selecionem o status apropriado para cada projeto ao criar ou editar um projeto.
const statusOptions: ProjectStatus[] = [
  'proposal',
  'in_progress',
  'review',
  'completed',
];

//essa função é o componente ProjectForm, que é um formulário para criar ou editar projetos. Ele recebe uma lista de clientes, os valores iniciais do projeto (se houver), uma função de callback para quando o formulário for submetido e uma função de callback para quando o formulário for cancelado. O componente usa o hook useState para gerenciar os valores do formulário e o hook useEffect para definir os valores iniciais quando o componente é montado ou quando os valores iniciais ou a lista de clientes mudam. O formulário inclui campos para selecionar o cliente, inserir o nome do projeto, a descrição, o valor, o prazo e o status do projeto. Quando o formulário é submetido, ele valida os campos e chama a função de callback onSubmit com os valores do formulário.
export function ProjectForm({
  clients,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ProjectFormProps) {
  const [values, setValues] = useState<ProjectFormValues>(emptyValues);

  useEffect(() => {
    if (initialValues) {
      setValues({
        clientId: initialValues.clientId,
        name: initialValues.name,
        description: initialValues.description,
        value: initialValues.value,
        deadline: initialValues.deadline,
        status: initialValues.status,
      });
      return;
    }

    setValues((prev) => ({
      ...emptyValues,
      clientId: clients[0]?.id ?? '',
      status: prev.status,
    }));
  }, [initialValues, clients]);

  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = event.target;

    setValues((prev) => ({
      ...prev,
      [name]:
        name === 'value'
          ? Number(value)
          : value,
    }));
  }

  // O envio assincromo garante que a interface espere o banco concluir antes de fechar o formulario.
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.clientId) {
      alert('Selecione um cliente.');
      return;
    }

    if (!values.name.trim()) {
      alert('O nome do projeto é obrigatório.');
      return;
    }

    if (values.value < 0) {
      alert('O valor do projeto não pode ser negativo.');
      return;
    }

    await onSubmit({
      clientId: values.clientId,
      name: values.name.trim(),
      description: values.description.trim(),
      value: Number(values.value),
      deadline: values.deadline,
      status: values.status,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Cliente
        </span>
        <select
          name="clientId"
          value={values.clientId}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
        >
          <option value="">Selecione um cliente</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} {client.company ? `• ${client.company}` : ''}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Nome do projeto
        </span>
        <input
          name="name"
          value={values.name}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder="Ex.: Landing page institucional"
        />
      </label>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Descrição
        </span>
        <textarea
          name="description"
          value={values.description}
          onChange={handleChange}
          className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          placeholder="Descreva o escopo do projeto..."
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Valor
          </span>
          <input
            name="value"
            type="number"
            min="0"
            step="0.01"
            value={values.value}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
            placeholder="0,00"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Prazo
          </span>
          <input
            name="deadline"
            type="date"
            value={values.deadline}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
          />
        </label>
      </div>

      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          Status
        </span>
        <select
          name="status"
          value={values.status}
          onChange={handleChange}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {projectStatusLabel[status]}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar projeto'}
        </button>
      </div>
    </form>
  );
}
