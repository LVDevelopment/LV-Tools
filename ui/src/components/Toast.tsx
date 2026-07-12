import clsx from 'clsx';
import { X } from 'lucide-react';
import { useAppStore } from '@/store';

export function ToastContainer() {
  const { toasts, removeToast } = useAppStore();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg',
            'animate-in slide-in-from-right text-sm min-w-[280px]',
            toast.type === 'success' && 'bg-green-950/90 border-green-700/50 text-green-200',
            toast.type === 'error' && 'bg-red-950/90 border-red-700/50 text-red-200',
            toast.type === 'warning' && 'bg-yellow-950/90 border-yellow-700/50 text-yellow-200',
            toast.type === 'info' && 'bg-lv-surface/95 border-lv-border text-gray-200',
          )}
        >
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="text-lv-muted hover:text-white">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
