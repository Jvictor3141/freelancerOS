import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Modal } from './Modal';

type ToastTone = 'success' | 'error' | 'info' | 'warning';

type ToastInput = {
  title: string;
  description?: string;
  tone?: ToastTone;
  durationMs?: number;
};

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
};

type ToastRecord = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
  durationMs: number;
};

type ConfirmState = {
  id: number;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  tone: 'default' | 'danger';
};

type FeedbackContextValue = {
  notify: (input: ToastInput) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
};

type FeedbackProviderProps = {
  children: ReactNode;
};

type ToastViewportProps = {
  toasts: ToastRecord[];
  onDismiss: (toastId: number) => void;
};

type ToastCardProps = {
  toast: ToastRecord;
  onDismiss: (toastId: number) => void;
};

type ConfirmationDialogProps = {
  dialog: ConfirmState | null;
  onConfirm: () => void;
  onCancel: () => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

function getToastToneClassName(tone: ToastTone) {
  if (tone === 'success') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-900';
  }

  if (tone === 'error') {
    return 'border-rose-200 bg-rose-50 text-rose-900';
  }

  if (tone === 'warning') {
    return 'border-amber-200 bg-amber-50 text-amber-900';
  }

  return 'border-slate-200 bg-white text-slate-900';
}

function getToastAccentClassName(tone: ToastTone) {
  if (tone === 'success') {
    return 'bg-emerald-500';
  }

  if (tone === 'error') {
    return 'bg-rose-500';
  }

  if (tone === 'warning') {
    return 'bg-amber-500';
  }

  return 'bg-[#635bff]';
}

function ToastCard({ toast, onDismiss }: ToastCardProps) {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onDismiss(toast.id);
    }, toast.durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [onDismiss, toast.durationMs, toast.id]);

  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto relative overflow-hidden rounded-3xl border shadow-[0_20px_45px_rgba(15,23,42,0.12)] ${getToastToneClassName(toast.tone)}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-1.5 ${getToastAccentClassName(toast.tone)}`}
      />

      <div className="pl-5 pr-4 py-4 sm:pl-6">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-5">{toast.title}</p>
            {toast.description ? (
              <p className="mt-1 text-sm leading-5 text-slate-600">
                {toast.description}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current/10 text-sm font-semibold text-slate-500 transition hover:bg-white/60"
            aria-label="Dispensar notificacao"
          >
            x
          </button>
        </div>
      </div>
    </div>
  );
}

function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-120 flex flex-col gap-3 sm:left-auto sm:right-4 sm:w-88"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ConfirmationDialog({
  dialog,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  if (!dialog) {
    return null;
  }

  const confirmButtonClassName =
    dialog.tone === 'danger'
      ? 'bg-rose-600 shadow-rose-200 hover:bg-rose-700'
      : 'bg-[#635bff] shadow-indigo-200 hover:brightness-105';

  return (
    <Modal
      title={dialog.title}
      isOpen
      onClose={onCancel}
      maxWidthClassName="max-w-md"
      showCloseButton={false}
    >
      <div className="space-y-5">
        <div className="rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-4 text-sm leading-6 text-slate-600">
          {dialog.description ??
            'Revise a acao antes de continuar. Voce pode cancelar sem alterar nada.'}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {dialog.cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 ${confirmButtonClassName}`}
          >
            {dialog.confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function FeedbackProvider({ children }: FeedbackProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [dialog, setDialog] = useState<ConfirmState | null>(null);
  const nextToastIdRef = useRef(0);
  const nextDialogIdRef = useRef(0);
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);

  const dismissToast = useCallback((toastId: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== toastId),
    );
  }, []);

  const notify = useCallback((input: ToastInput) => {
    const toastId = nextToastIdRef.current++;

    setToasts((currentToasts) => [
      ...currentToasts,
      {
        id: toastId,
        title: input.title,
        description: input.description,
        tone: input.tone ?? 'info',
        durationMs: input.durationMs ?? 4200,
      },
    ]);
  }, []);

  const closeDialog = useCallback((confirmed: boolean) => {
    const resolve = confirmResolverRef.current;
    confirmResolverRef.current = null;
    setDialog(null);
    resolve?.(confirmed);
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(false);
    }

    setDialog({
      id: nextDialogIdRef.current++,
      title: options.title,
      description: options.description,
      confirmLabel: options.confirmLabel ?? 'Confirmar',
      cancelLabel: options.cancelLabel ?? 'Cancelar',
      tone: options.tone ?? 'default',
    });

    return new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;
    });
  }, []);

  useEffect(() => {
    return () => {
      confirmResolverRef.current?.(false);
      confirmResolverRef.current = null;
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      notify,
      confirm,
    }),
    [confirm, notify],
  );

  return (
    <FeedbackContext.Provider value={contextValue}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
      <ConfirmationDialog
        dialog={dialog}
        onConfirm={() => closeDialog(true)}
        onCancel={() => closeDialog(false)}
      />
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider.');
  }

  return context;
}
