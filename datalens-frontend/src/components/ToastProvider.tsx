"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Desaparece solo a los 3 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {/* Contenedor de notificaciones: centrado abajo */}
      <div className="fixed inset-x-0 bottom-8 flex justify-center z-50 pointer-events-none">
        <div className="space-y-3 w-full max-w-xl px-4">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={[
                "pointer-events-auto",
                "px-4 py-3 rounded-xl shadow-lg border border-zinc-800",
                "text-sm md:text-base",
                "bg-zinc-900/95 text-zinc-50",
                "flex items-center justify-between gap-4",
                "backdrop-blur",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span>{t.message}</span>

              {/* Chip pequeño con el tipo, opcional */}
              {t.type === "success" && (
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-600/80">
                  OK
                </span>
              )}
              {t.type === "error" && (
                <span className="text-xs px-2 py-1 rounded-full bg-red-600/80">
                  Error
                </span>
              )}
              {t.type === "info" && (
                <span className="text-xs px-2 py-1 rounded-full bg-blue-600/80">
                  Info
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast debe usarse dentro de <ToastProvider>");
  }
  return ctx;
}