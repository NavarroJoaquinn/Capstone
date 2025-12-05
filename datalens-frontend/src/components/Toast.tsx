"use client";
import { createContext, useContext, useState, ReactNode } from "react";

const ToastContext = createContext<any>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<any[]>([]);

  const show = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}

      {/* Contenedor de toasts */}
      <div className="fixed top-4 right-4 space-y-3 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-2 rounded-lg shadow-md text-white ${
              t.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}