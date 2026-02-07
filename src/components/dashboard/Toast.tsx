import { useState, useEffect, useCallback, useRef } from "react";

export interface ToastItem {
  id: string;
  message: string;
  onUndo: () => void;
  duration?: number;
}

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const duration = toast.duration ?? 10000;
  const [remaining, setRemaining] = useState(duration);
  const startRef = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const left = Math.max(0, duration - elapsed);
      setRemaining(left);
      if (left <= 0) {
        onDismiss(toast.id);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [duration, toast.id, onDismiss]);

  const progress = remaining / duration;

  return (
    <div className="glass p-4 min-w-[300px] flex flex-col gap-2 animate-slide-in">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-text-primary">{toast.message}</span>
        <button
          onClick={() => {
            toast.onUndo();
            onDismiss(toast.id);
          }}
          className="text-sm font-semibold text-green-primary hover:underline shrink-0"
        >
          Undo
        </button>
      </div>
      <div className="h-0.5 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-green-primary transition-all duration-100 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
