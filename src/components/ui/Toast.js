"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

const ToastContext = createContext(null);

const typeConfig = {
  success: {
    icon: CheckCircle2,
    bg: "bg-zinc-950 text-white border-zinc-800 shadow-xl shadow-zinc-950/20",
    iconColor: "text-emerald-400",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-rose-950 text-white border-rose-800/80 shadow-xl",
    iconColor: "text-rose-400",
  },
  info: {
    icon: Info,
    bg: "bg-zinc-950 text-white border-zinc-800 shadow-xl",
    iconColor: "text-indigo-400",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-zinc-950 text-white border-zinc-800 shadow-xl",
    iconColor: "text-amber-400",
  },
};

function ToastItem({ id, message, type, onRemove }) {
  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} border rounded-xl py-3 px-4 flex items-center gap-3 min-w-[280px] max-w-sm backdrop-blur-md transition-all duration-300 animate-slide-in`}
    >
      <Icon className={`h-4 w-4 ${config.iconColor} shrink-0`} />
      <p className="text-xs font-medium flex-1 tracking-tight">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="text-zinc-400 hover:text-white transition-colors shrink-0 p-0.5"
        aria-label="Dismiss toast"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = "success") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), 3500);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-auto">
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            id={t.id}
            message={t.message}
            type={t.type}
            onRemove={removeToast}
          />
        ))}
      </div>
      <style jsx global>{`
        @keyframes toastSlide {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-in {
          animation: toastSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
