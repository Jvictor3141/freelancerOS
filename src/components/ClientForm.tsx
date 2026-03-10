import { useEffect, useState } from "react";
import type { Client } from "../types/client";

// essa linha define um tipo ClientFormValues que é uma versão do tipo Client, mas sem as propriedades id e createdAt. O operador Omit é usado para criar um novo tipo que exclui as propriedades especificadas (id e createdAt) do tipo original (Client). Isso é útil porque essas propriedades são geradas automaticamente pelo sistema e não precisam ser fornecidas pelo usuário ao preencher o formulário de cliente.
type ClientFormValues = Omit<Client, "id" | "createdAt">;

// essa parte define as propriedades esperadas para o componente ClientForm. O componente espera receber um objeto de propriedades do tipo ClientFormProps, que inclui as seguintes propriedades:
// - initialValues: um objeto do tipo Client ou null, que representa os valores iniciais do formulário. Se for fornecido, o formulário será preenchido com esses valores; caso contrário, o formulário começará vazio.
// - onSubmit: uma função que será chamada quando o formulário for submetido. Ela recebe um objeto do tipo ClientFormValues como argumento, que contém os valores do formulário (exceto id e createdAt) que foram preenchidos pelo usuário.
// - onCancel: uma função que será chamada quando o usuário clicar no botão de cancelar. Essa função é responsável por lidar com a ação de cancelamento, como fechar o formulário ou limpar os valores preenchidos.
type ClientFormProps = {
    initialValues?: Client | null;
    onSubmit: (values: ClientFormValues) => void;
    onCancel: () => void;
};


//essa parte define um objeto emptyValues do tipo ClientFormValues, que contém valores vazios para cada campo do formulário de cliente. Esse objeto é usado para inicializar o estado do formulário quando não há valores iniciais fornecidos (ou seja, quando initialValues é null ou undefined). Ele garante que o formulário comece com campos vazios, prontos para serem preenchidos pelo usuário.
const emptyValues: ClientFormValues = {
    name: "",
    company: "",
    email: "",
    phone: "",
    notes: "",
};

// essa função é o componente ClientForm, que é um formulário para criar ou editar um cliente. Ele recebe as propriedades definidas em ClientFormProps e usa o estado local para gerenciar os valores do formulário. O componente utiliza o hook useEffect para atualizar os valores do formulário sempre que as initialValues forem alteradas, garantindo que o formulário seja preenchido corretamente quando um cliente for selecionado para edição. O handleChange é uma função que atualiza o estado do formulário conforme o usuário digita nos campos, e o handleSubmit é responsável por validar os campos obrigatórios (nome e email) e chamar a função onSubmit com os valores do formulário quando o usuário submeter o formulário. O componente retorna um formulário JSX com campos para nome, empresa, email, telefone e notas, além de botões para cancelar e salvar o cliente.
export function ClientForm({
    initialValues,
    onSubmit,
    onCancel,
}: ClientFormProps) {
    const [values, setValues] = useState<ClientFormValues>(emptyValues);

    useEffect(() => {
        if (initialValues) {
            setValues({
                name: initialValues.name,
                company: initialValues.company,
                email: initialValues.email,
                phone: initialValues.phone,
                notes: initialValues.notes,
            });
            return;
        }

        setValues(emptyValues);
    }, [initialValues]);

    // essa função é responsável por lidar com as mudanças nos campos do formulário. Ela recebe um evento de mudança (change event) como parâmetro, extrai o nome e o valor do campo que foi alterado, e atualiza o estado do formulário (values) usando a função setValues. O estado é atualizado de forma imutável, criando um novo objeto que combina os valores anteriores com o novo valor do campo alterado, garantindo que o estado seja atualizado corretamente conforme o usuário interage com o formulário.
    function handleChange(
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) {
        const { name, value } = event.target;

        setValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    // essa função é responsável por lidar com a submissão do formulário. Ela recebe um evento de submissão (submit event) como parâmetro, impede o comportamento padrão de recarregar a página, valida os campos obrigatórios (nome e email) para garantir que não estejam vazios, e se a validação passar, chama a função onSubmit com os valores do formulário (name, company, email, phone e notes) para que o cliente seja salvo ou atualizado conforme necessário. Se a validação falhar (ou seja, se o nome ou email estiverem vazios), a função exibe um alerta para o usuário informando que esses campos são obrigatórios e não chama a função onSubmit.
    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!values.name.trim() || !values.email.trim()) {
            alert("Nome e email são obrigatórios.");
            return;
        }

        // essa parte chama a função onSubmit, passando um objeto com os valores do formulário (name, company, email, phone e notes) como argumento. Antes de passar os valores para onSubmit, a função trim() é usada para remover quaisquer espaços em branco extras no início ou no final dos valores, garantindo que os dados enviados sejam limpos e formatados corretamente. A função onSubmit é responsável por lidar com a lógica de salvar ou atualizar o cliente com os valores fornecidos, e é chamada apenas se a validação dos campos obrigatórios for bem-sucedida.
        onSubmit({
            name: values.name.trim(),
            company: values.company.trim(),
            email: values.email.trim(),
            phone: values.phone.trim(),
            notes: values.notes.trim(),
        });
    }

    // essa parte retorna o JSX do formulário, que inclui campos de entrada para nome, empresa, email, telefone e notas, cada um com seus respectivos rótulos. Os campos de entrada estão vinculados ao estado do formulário (values) e usam a função handleChange para atualizar o estado conforme o usuário digita. O formulário também inclui dois botões: um para cancelar a ação (que chama a função onCancel quando clicado) e outro para salvar o cliente (que é do tipo submit e aciona a função handleSubmit quando o formulário é submetido). O layout do formulário é organizado usando classes CSS para estilização.
    return (
        <form onSubmit={handleSubmit} className="grid gap-4">
            <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                    Nome
                </span>
                <input
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                    placeholder="Ex.: João Silva"
                />
            </label>

            <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                    Empresa
                </span>
                <input
                    name="company"
                    value={values.company}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                    placeholder="Ex.: Studio Bloom"
                />
            </label>

            <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                </span>
                <input
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                    placeholder="Ex.: joao@email.com"
                />
            </label>

            <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                    Telefone
                </span>
                <input
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                    placeholder="Ex.: (83) 99999-9999"
                />
            </label>

            <label>
                <span className="mb-2 block text-sm font-medium text-slate-700">
                    Notas
                </span>
                <textarea
                    name="notes"
                    value={values.notes}
                    onChange={handleChange}
                    className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                    placeholder="Observações sobre esse cliente..."
                />
            </label>

            <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    className="rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105"
                >
                    Salvar cliente
                </button>
            </div>
        </form>
    );
}
