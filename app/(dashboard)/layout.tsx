'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import { ToastProvider } from '@/components/Toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AuthGuard>
      <ToastProvider>
        <Sidebar />
        <main className="min-h-screen px-4 pb-12 pt-20 lg:ml-64 lg:px-8 lg:pt-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="mx-auto max-w-7xl"
          >
            {children}
          </motion.div>
        </main>
      </ToastProvider>
    </AuthGuard>
  );
}
