'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, XCircle } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const ICONS = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
  error: <XCircle className="h-5 w-5 text-red-400" />,
  info: <Info className="h-5 w-5 text-sky-400" />,
};

const BORDERS = {
  success: 'border-emerald-500/30',
  error: 'border-red-500/30',
  info: 'border-sky-500/30',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((type: ToastType, message: string) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[80] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
              className={`pointer-events-auto flex items-center gap-3 rounded-xl border ${BORDERS[t.type]} bg-zinc-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl`}
            >
              {ICONS[t.type]}
              <span className="text-sm text-zinc-100">{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
