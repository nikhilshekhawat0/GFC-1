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
            className="pointer-events-auto flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-[#EAECEF] dark:border-[#242832] bg-white/95 dark:bg-[#16191F]/95 backdrop-blur-xl shadow-xl text-xs font-medium text-[#111317] dark:text-[#F4F4F6]"
          >
            {icon}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#9CA3AF] hover:text-[#111317] dark:hover:text-white"
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
