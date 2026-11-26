import { CheckCircle2, Info, X, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function ToastBanner() {
  const { toast, dismissToast } = useStore();

  if (!toast) return null;

  const icon =
    toast.type === 'error' ? (
      <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
    ) : toast.type === 'info' ? (
      <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
    ) : (
      <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
    );

  const colors =
    toast.type === 'error'
      ? 'bg-[#8D311B] text-white'
      : toast.type === 'info'
        ? 'bg-[#261D17] text-white'
        : 'bg-[#1E3D2F] text-white';

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm" role="status" aria-live="polite">
      <div className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 text-xs font-medium ${colors}`}>
        {icon}
        <span className="flex-1">{toast.message}</span>
        <button
          type="button"
          onClick={dismissToast}
          aria-label="Dismiss notification"
          className="opacity-80 hover:opacity-100 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
