'use client';

import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  message = '載入資料時發生錯誤',
  onRetry,
}: ErrorStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
        <AlertCircle className="h-8 w-8 text-red-400" />
      </div>
      <p className="text-base font-medium text-zinc-300">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost mt-5">
          <RefreshCw className="h-4 w-4" />
          重新載入
        </button>
      )}
    </motion.div>
  );
}
