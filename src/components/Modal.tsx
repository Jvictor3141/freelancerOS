import type { ReactNode } from "react";

// essa parte define as propriedades esperadas para o componente Modal. O componente espera receber um objeto de propriedades do tipo ModalProps, que inclui as seguintes propriedades:
// - title: uma string que representa o título do modal, que será exibido na parte superior do modal.
// - description: uma string opcional que representa a descrição do modal, que será exibida abaixo do título, se fornecida.
// - isOpen: um booleano que indica se o modal está aberto ou fechado. Se isOpen for true, o modal será exibido; caso contrário, ele não será renderizado.
// - onClose: uma função que será chamada quando o usuário clicar no botão de fechar o modal. Essa função é responsável por lidar com a ação de fechamento do modal, como atualizar o estado para fechar o modal ou realizar outras ações necessárias.
// - children: um ReactNode que representa o conteúdo do modal. Esse conteúdo pode ser qualquer elemento React válido (como texto, formulários, botões, etc.) e será renderizado dentro do corpo do modal.
type ModalProps = {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

// essa função é o componente Modal, que é um componente de interface do usuário para exibir um modal (uma janela pop-up) com um título, descrição e conteúdo personalizado. O componente verifica se a propriedade isOpen é verdadeira para determinar se o modal deve ser renderizado. Se isOpen for false, o componente retorna null, o que significa que nada será renderizado. Se isOpen for true, o componente renderiza uma estrutura de modal com um fundo semi-transparente e um contêiner centralizado que exibe o título, a descrição (se fornecida) e os filhos (conteúdo personalizado). O modal também inclui um botão de fechar que chama a função onClose quando clicado, permitindo que o usuário feche o modal.
export function Modal({
  title,
  description,
  isOpen,
  onClose,
  children,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold tracking-tight text-slate-950">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            ) : null}
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
