import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
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

type ToneConfig = {
  icon: ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
  progressColor: string;
};

const toneConfig: Record<ToastTone, ToneConfig> = {
  success: {
    icon: CheckCircle2,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    progressColor: 'bg-emerald-500',
  },
  error: {
    icon: XCircle,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    progressColor: 'bg-rose-500',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    progressColor: 'bg-amber-500',
  },
  info: {
    icon: Info,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    progressColor: 'bg-[#635bff]',
  },
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

function ToastCard({ toast, onDismiss }: ToastCardProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const { icon: Icon, iconBg, iconColor, progressColor } = toneConfig[toast.tone];

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setVisible(true));
    const timeoutId = window.setTimeout(() => onDismiss(toast.id), toast.durationMs);

    return () => {
      cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [onDismiss, toast.durationMs, toast.id]);

  useEffect(() => {
    const bar = progressRef.current;

    if (!bar) {
      return;
    }

    const animation = bar.animate(
      [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }],
      { duration: toast.durationMs, easing: 'linear', fill: 'forwards' },
    );

    return () => {
      animation.cancel();
    };
  }, [toast.durationMs]);

  return (
    <div
      role={toast.tone === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto relative overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)] transition-all duration-300 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
      }`}
    >
      <div className="flex items-start gap-3 px-4 py-4">
        <div className={`mt-0.5 inline-flex shrink-0 rounded-xl p-2 ${iconBg}`}>
          <Icon size={14} className={iconColor} />
        </div>

        <div className="min-w-0 flex-1 pt-1">
          <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
          {toast.description ? (
            <p className="mt-0.5 text-sm leading-5 text-slate-500">
              {toast.description}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="mt-0.5 inline-flex shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label={t('common.dismiss_notification')}
        >
          <X size={14} />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-0.75 bg-slate-100">
        <div
          ref={progressRef}
          className={`h-full origin-left ${progressColor}`}
        />
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
  const { t } = useTranslation();

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
          {dialog.description ?? t('common.confirm_default_description')}
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
  const { t } = useTranslation();
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
      confirmLabel: options.confirmLabel ?? t('common.confirm'),
      cancelLabel: options.cancelLabel ?? t('common.cancel'),
      tone: options.tone ?? 'default',
    });

    return new Promise<boolean>((resolve) => {
      confirmResolverRef.current = resolve;
    });
  }, [t]);

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
