'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Phone, Search, UsersRound, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import GlassCard from '@/components/GlassCard';
import { Skeleton, TableSkeleton } from '@/components/LoadingSkeleton';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { getBookings, getCustomers } from '@/lib/api';
import type { Booking, Customer } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [history, setHistory] = useState<Booking[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getCustomers();
      data.sort((a, b) => b.totalSpent - a.totalSpent);
      setCustomers(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    );
  }, [customers, query]);

  const openCustomer = async (c: Customer) => {
    setSelected(c);
    setHistory([]);
    setHistoryError(false);
    setHistoryLoading(true);
    try {
      // 以全部預約過濾該顧客電話
      const all = await getBookings();
      const list = all.filter((b) => b.customer.phone === c.phone);
      list.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
      setHistory(list);
    } catch {
      setHistoryError(true);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="顧客" description="檢視顧客資料與消費紀錄" />

      {/* 搜尋列 */}
      <GlassCard className="mb-6 p-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋姓名或電話…"
            className="input pl-11"
          />
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden" delay={0.1}>
        {loading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : error ? (
          <ErrorState onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title={query ? '找不到符合的顧客' : '尚無顧客資料'}
            description={query ? '請嘗試其他關鍵字' : '顧客完成預約後將自動建檔'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs text-zinc-500">
                  <th className="px-5 py-4 font-medium">顧客</th>
                  <th className="px-3 py-4 font-medium">電話</th>
                  <th className="px-3 py-4 text-right font-medium">預約次數</th>
                  <th className="px-3 py-4 text-right font-medium">累計消費</th>
                  <th className="px-3 py-4 font-medium">最近來訪</th>
                  <th className="px-5 py-4 font-medium">首次來訪</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.phone}
                    onClick={() => openCustomer(c)}
                    className="table-row-hover cursor-pointer border-b border-white/[0.04] last:border-0"
                  >
                    <td className="px-5 py-4">
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/25 to-pink-500/10 text-sm font-bold text-rose-200">
                          {c.name.charAt(0) || '客'}
                        </span>
                        <span className="font-medium text-zinc-200">{c.name || '（未具名）'}</span>
                      </span>
                    </td>
                    <td className="px-3 py-4 text-zinc-400">{c.phone}</td>
                    <td className="px-3 py-4 text-right text-zinc-300">{c.totalBookings}</td>
                    <td className="px-3 py-4 text-right font-medium text-rose-300">
                      {formatCurrency(c.totalSpent)}
                    </td>
                    <td className="px-3 py-4 text-zinc-400">{c.lastVisit || '—'}</td>
                    <td className="px-5 py-4 text-zinc-500">{c.firstVisit || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* 顧客詳情抽屜 */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 34 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-white/[0.08] bg-zinc-950/95 backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 text-base font-bold text-white">
                    {selected.name.charAt(0) || '客'}
                  </span>
                  <div>
                    <h3 className="font-bold text-white">{selected.name || '（未具名）'}</h3>
                    <p className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Phone className="h-3 w-3" />
                      {selected.phone}
                      {selected.email && (
                        <>
                          <Mail className="ml-2 h-3 w-3" />
                          {selected.email}
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
                  aria-label="關閉"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 p-5">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
                  <p className="text-xs text-zinc-500">累計消費</p>
                  <p className="mt-1 text-lg font-bold text-rose-300">
                    {formatCurrency(selected.totalSpent)}
                  </p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-center">
                  <p className="text-xs text-zinc-500">預約次數</p>
                  <p className="mt-1 text-lg font-bold text-white">{selected.totalBookings}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-6">
                <h4 className="mb-3 text-sm font-bold text-zinc-300">預約紀錄</h4>
                {historyLoading ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-20" />
                    ))}
                  </div>
                ) : historyError ? (
                  <p className="py-8 text-center text-sm text-zinc-500">載入紀錄失敗</p>
                ) : history.length === 0 ? (
                  <p className="py-8 text-center text-sm text-zinc-500">尚無預約紀錄</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((b, i) => (
                      <motion.div
                        key={b.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-zinc-200">
                            {b.date} {b.time}
                          </span>
                          <StatusBadge status={b.status} />
                        </div>
                        <p className="mt-1.5 text-xs text-zinc-400">
                          {b.serviceName} · {b.stylistName}
                        </p>
                        <p className="mt-1 text-sm font-medium text-rose-300">
                          {formatCurrency(b.price)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
