"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cx } from "@/lib/format";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const toneClasses = {
  success: "border-brand-100 bg-white text-ink",
  error: "border-red-100 bg-white text-ink",
  info: "border-line bg-white text-ink",
};

const iconClasses = {
  success: "text-brand",
  error: "text-red-500",
  info: "text-brand-700",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts([{ id, message, tone }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 4200);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 top-[calc(76px+env(safe-area-inset-top))] z-[70] flex flex-col items-center gap-2 px-4 lg:inset-x-auto lg:right-6 lg:top-6 lg:w-[380px] lg:items-stretch lg:px-0"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => {
          const Icon = icons[toast.tone];
          return (
            <div
              key={toast.id}
              className={cx(
                "pointer-events-auto flex w-full max-w-md animate-toast-in items-start gap-3 rounded-2xl border p-3.5 shadow-lift",
                toneClasses[toast.tone],
              )}
            >
              <Icon
                className={cx("mt-0.5 size-5 shrink-0", iconClasses[toast.tone])}
                aria-hidden="true"
              />
              <p className="min-w-0 flex-1 text-sm font-medium leading-relaxed">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="grid size-7 shrink-0 place-items-center rounded-lg text-ink-muted transition hover:bg-brand-50 hover:text-ink"
                aria-label="Dismiss message"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
