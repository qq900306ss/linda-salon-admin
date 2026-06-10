'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = '確認',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="glass relative w-full max-w-sm bg-zinc-900/95 p-6 text-center"
          >
            <div
              className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
                danger ? 'bg-red-500/15 text-red-400' : 'bg-rose-500/15 text-rose-300'
              }`}
            >
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{message}</p>
            <div className="mt-6 flex gap-3">
              <button onClick={onCancel} className="btn-ghost flex-1" disabled={loading}>
                取消
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}
              >
                {loading ? '處理中…' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
