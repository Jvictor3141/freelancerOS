import type { ReactNode } from 'react';

type ModalProps = {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({
  title,
  description,
  isOpen,
  onClose,
  children,
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="motion-overlay fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 sm:p-6">
      <div className="flex min-h-full items-start justify-center py-4 sm:items-center">
        <div className="motion-dialog w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
          <div className="max-h-[calc(100vh-2rem)] overflow-y-auto p-5 sm:p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                  {title}
                </h3>
                {description ? (
                  <p className="mt-1 text-sm text-slate-500">{description}</p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
