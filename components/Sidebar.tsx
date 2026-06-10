'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Scissors,
  Settings,
  Sparkles,
  Users,
  UsersRound,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { clearToken } from '@/lib/api';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: '總覽', icon: LayoutDashboard },
  { href: '/calendar/', label: '行事曆', icon: CalendarDays },
  { href: '/bookings/', label: '預約管理', icon: ClipboardList },
  { href: '/services/', label: '服務項目', icon: Scissors },
  { href: '/stylists/', label: '設計師', icon: Sparkles },
  { href: '/customers/', label: '顧客', icon: UsersRound },
  { href: '/statistics/', label: '營收統計', icon: BarChart3 },
  { href: '/settings/', label: '系統設定', icon: Settings },
];

function normalize(path: string): string {
  if (path === '') return '/';
  if (path !== '/' && !path.endsWith('/')) return path + '/';
  return path;
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = normalize(usePathname() || '/');

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {NAV_ITEMS.map((item) => {
        const active = pathname === normalize(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
              active ? 'text-white' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
            )}
          >
            {active && (
              <motion.div
                layoutId="active-nav-pill"
                className="absolute inset-0 rounded-xl border border-rose-400/20 bg-gradient-to-r from-rose-500/20 to-pink-500/10"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <Icon className={cn('relative z-10 h-[18px] w-[18px]', active && 'text-rose-300')} />
            <span className="relative z-10">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter() {
  const router = useRouter();

  const handleLogout = () => {
    clearToken();
    router.push('/login/');
  };

  return (
    <div className="border-t border-white/[0.06] p-3">
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
      >
        <LogOut className="h-[18px] w-[18px]" />
        登出
      </button>
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-3 px-6 py-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/30">
        <Scissors className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-base font-bold leading-tight text-white">Linda Salon</p>
        <p className="text-xs text-zinc-500">管理後台</p>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* 桌面版側欄 */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.06] bg-zinc-950/70 backdrop-blur-2xl lg:flex">
        <Logo />
        <NavLinks />
        <SidebarFooter />
      </aside>

      {/* 行動版頂欄 */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-white/[0.06] bg-zinc-950/80 px-4 py-3 backdrop-blur-2xl lg:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600">
            <Scissors className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white">Linda Salon 管理後台</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-zinc-300 hover:bg-white/10"
          aria-label="開啟選單"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* 行動版抽屜 */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/[0.06] bg-zinc-950/95 backdrop-blur-2xl lg:hidden"
            >
              <div className="flex items-center justify-between pr-4">
                <Logo />
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
                  aria-label="關閉選單"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <NavLinks onNavigate={() => setMobileOpen(false)} />
              <SidebarFooter />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
