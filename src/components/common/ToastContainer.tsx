import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  const getToastStyle = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'linear-gradient(135deg, #064e3b, #065f46)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          shadow: '0 8px 32px -8px rgba(6, 78, 59, 0.4)',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />,
        };
      case 'warning':
        return {
          bg: 'linear-gradient(135deg, #78350f, #92400e)',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          shadow: '0 8px 32px -8px rgba(120, 53, 15, 0.4)',
          icon: <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />,
        };
      case 'error':
        return {
          bg: 'linear-gradient(135deg, #881337, #9f1239)',
          border: '1px solid rgba(244, 63, 94, 0.2)',
          shadow: '0 8px 32px -8px rgba(136, 19, 55, 0.4)',
          icon: <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />,
        };
      default:
        return {
          bg: 'linear-gradient(135deg, #0f172a, #1e293b)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          shadow: '0 8px 32px -8px rgba(15, 23, 42, 0.5)',
          icon: <Info className="w-5 h-5 text-sky-300 shrink-0" />,
        };
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const style = getToastStyle(toast.type);

        return (
          <div
            key={toast.id}
            role="alert"
            className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl text-white anim-fade-in-up"
            style={{
              background: style.bg,
              border: style.border,
              boxShadow: style.shadow,
              backdropFilter: 'blur(12px)',
            }}
          >
            {style.icon}
            <div className="flex-1 text-sm">
              <p className="font-semibold">{toast.title}</p>
              {toast.message && <p className="text-xs opacity-80 mt-0.5 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md opacity-60 hover:opacity-100 transition-opacity"
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
