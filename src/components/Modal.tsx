import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ModalProps = {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  maxWidthClassName?: string;
  showCloseButton?: boolean;
  closeLabel?: string;
};

export function Modal({
  title,
  description,
  isOpen,
  onClose,
  children,
  maxWidthClassName = 'max-w-2xl',
  showCloseButton = true,
  closeLabel = 'Fechar',
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className="motion-overlay fixed inset-0 z-[100] overflow-x-hidden overflow-y-auto bg-slate-950/34 p-4 backdrop-blur-sm sm:p-6">
      <div className="flex min-h-[calc(100dvh-2rem)] items-start justify-center py-4 sm:min-h-[calc(100dvh-3rem)] sm:items-center">
        <div
          role="dialog"
          aria-modal="true"
          className={`motion-dialog w-full ${maxWidthClassName} overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_80px_rgba(15,23,42,0.22)]`}
        >
          <div className="max-h-[calc(100dvh-2rem)] overflow-y-auto p-5 sm:max-h-[calc(100dvh-4rem)] sm:p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold tracking-tight text-slate-950">
                  {title}
                </h3>
                {description ? (
                  <p className="mt-1 text-sm text-slate-500">{description}</p>
                ) : null}
              </div>

              {showCloseButton ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  {closeLabel}
                </button>
              ) : null}
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
