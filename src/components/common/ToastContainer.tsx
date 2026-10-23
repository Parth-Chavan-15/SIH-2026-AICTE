import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let bg = 'bg-white border-slate-200 text-slate-800 shadow-xl';
        let icon = <Info className="w-5 h-5 text-blue-600 shrink-0" />;

        if (toast.type === 'success') {
          bg = 'bg-emerald-900 text-white border-emerald-800 shadow-emerald-950/20 shadow-xl';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-900 text-white border-amber-800 shadow-amber-950/20 shadow-xl';
          icon = <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />;
        } else if (toast.type === 'error') {
          bg = 'bg-rose-950 text-white border-rose-800 shadow-rose-950/20 shadow-xl';
          icon = <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />;
        } else if (toast.type === 'info') {
          bg = 'bg-slate-900 text-white border-slate-800 shadow-xl';
          icon = <Info className="w-5 h-5 text-sky-300 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 ${bg}`}
          >
            {icon}
            <div className="flex-1 text-sm">
              <p className="font-semibold">{toast.title}</p>
              {toast.message && <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
