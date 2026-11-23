import { useStore } from '../store/useStore';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';

export function Toasts() {
  const { toasts, removeToast } = useStore();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success' ? (
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          ) : toast.type === 'error' ? (
            <XCircle size={16} className="text-red-500 shrink-0" />
          ) : (
            <Info size={16} className="text-blue-500 shrink-0" />
          );

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/95 dark:bg-[#0D131F]/95 backdrop-blur-xl shadow-xl text-xs font-medium text-slate-900 dark:text-slate-100"
          >
            {icon}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="Dismiss notification"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
