'use client';

import { addDays, format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  CheckCheck,
  ChevronDown,
  ClipboardList,
  Mail,
  Phone,
  StickyNote,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import GlassCard from '@/components/GlassCard';
import { TableSkeleton } from '@/components/LoadingSkeleton';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import {
  ApiError,
  deleteBooking,
  getBookings,
  getStylists,
  updateBookingStatus,
} from '@/lib/api';
import type { Booking, BookingStatus, Stylist } from '@/lib/types';
import { STATUS_LABELS, cn, formatCurrency } from '@/lib/utils';

type ConfirmAction =
  | { kind: 'status'; booking: Booking; status: BookingStatus }
  | { kind: 'delete'; booking: Booking };

const ACTION_LABELS: Record<BookingStatus, string> = {
  pending: '待確認',
  confirmed: '確認預約',
  completed: '標記完成',
  cancelled: '取消預約',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [from, setFrom] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [to, setTo] = useState(() => format(addDays(new Date(), 30), 'yyyy-MM-dd'));
  const [status, setStatus] = useState('');
  const [stylistId, setStylistId] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getBookings({
        from: from && to ? from : undefined,
        to: from && to ? to : undefined,
        status: status || undefined,
        stylistId: stylistId || undefined,
      });
      data.sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
      setBookings(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [from, to, status, stylistId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getStylists()
      .then(setStylists)
      .catch(() => {});
  }, []);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    setActionLoading(true);
    try {
      if (confirmAction.kind === 'delete') {
        await deleteBooking(confirmAction.booking.id);
        setBookings((prev) => prev.filter((b) => b.id !== confirmAction.booking.id));
        toast('success', '預約已刪除');
      } else {
        const updated = await updateBookingStatus(
          confirmAction.booking.id,
          confirmAction.status
        );
        setBookings((prev) =>
          prev.map((b) =>
            b.id === confirmAction.booking.id
              ? { ...b, ...updated, status: confirmAction.status }
              : b
          )
        );
        toast('success', `預約已更新為「${STATUS_LABELS[confirmAction.status]}」`);
      }
      setConfirmAction(null);
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : '操作失敗，請稍後再試');
    } finally {
      setActionLoading(false);
    }
  };

  const actionButtons = (b: Booking) => {
    const buttons: { status: BookingStatus; label: string; icon: React.ReactNode; cls: string }[] = [];
    if (b.status === 'pending') {
      buttons.push({
        status: 'confirmed',
        label: '確認',
        icon: <Check className="h-3.5 w-3.5" />,
        cls: 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15',
      });
    }
    if (b.status === 'confirmed') {
      buttons.push({
        status: 'completed',
        label: '完成',
        icon: <CheckCheck className="h-3.5 w-3.5" />,
        cls: 'border-sky-500/30 text-sky-300 hover:bg-sky-500/15',
      });
    }
    if (b.status === 'pending' || b.status === 'confirmed') {
      buttons.push({
        status: 'cancelled',
        label: '取消',
        icon: <XCircle className="h-3.5 w-3.5" />,
        cls: 'border-zinc-500/30 text-zinc-400 hover:bg-zinc-500/15',
      });
    }
    return buttons;
  };

  return (
    <div>
      <PageHeader title="預約管理" description="檢視並管理所有顧客預約" />

      {/* 篩選列 */}
      <GlassCard className="mb-6 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1.5 block text-xs text-zinc-500">開始日期</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-zinc-500">結束日期</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-zinc-500">狀態</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input">
              <option value="">全部狀態</option>
              {(Object.keys(STATUS_LABELS) as BookingStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-zinc-500">設計師</label>
            <select value={stylistId} onChange={(e) => setStylistId(e.target.value)} className="input">
              <option value="">全部設計師</option>
              {stylists.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setFrom('');
                setTo('');
                setStatus('');
                setStylistId('');
              }}
              className="btn-ghost w-full"
            >
              清除篩選
            </button>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden" delay={0.1}>
        {loading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : error ? (
          <ErrorState onRetry={load} />
        ) : bookings.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="找不到符合條件的預約"
            description="請調整篩選條件，或等待新的預約進來"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs text-zinc-500">
                  <th className="px-5 py-4 font-medium">日期時間</th>
                  <th className="px-3 py-4 font-medium">顧客</th>
                  <th className="px-3 py-4 font-medium">服務</th>
                  <th className="px-3 py-4 font-medium">設計師</th>
                  <th className="px-3 py-4 text-right font-medium">金額</th>
                  <th className="px-3 py-4 font-medium">狀態</th>
                  <th className="px-5 py-4 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <Fragment key={b.id}>
                    <tr
                      className="table-row-hover cursor-pointer border-b border-white/[0.04]"
                      onClick={() => setExpandedId(expandedId === b.id ? null : b.id)}
                    >
                      <td className="px-5 py-4 text-zinc-300">
                        <span className="font-medium text-zinc-200">{b.date}</span>
                        <span className="ml-2 text-zinc-500">{b.time}</span>
                      </td>
                      <td className="px-3 py-4">
                        <span className="flex items-center gap-1.5 font-medium text-zinc-200">
                          <ChevronDown
                            className={cn(
                              'h-3.5 w-3.5 text-zinc-500 transition-transform',
                              expandedId === b.id && 'rotate-180'
                            )}
                          />
                          {b.customer.name}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-zinc-400">{b.serviceName}</td>
                      <td className="px-3 py-4 text-zinc-400">{b.stylistName}</td>
                      <td className="px-3 py-4 text-right font-medium text-zinc-200">
                        {formatCurrency(b.price)}
                      </td>
                      <td className="px-3 py-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-5 py-4">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {actionButtons(b).map((btn) => (
                            <button
                              key={btn.status}
                              onClick={() =>
                                setConfirmAction({ kind: 'status', booking: b, status: btn.status })
                              }
                              className={cn(
                                'inline-flex items-center gap-1 rounded-lg border bg-transparent px-2.5 py-1.5 text-xs font-medium transition-colors',
                                btn.cls
                              )}
                            >
                              {btn.icon}
                              {btn.label}
                            </button>
                          ))}
                          <button
                            onClick={() => setConfirmAction({ kind: 'delete', booking: b })}
                            className="rounded-lg border border-red-500/25 p-1.5 text-red-400 transition-colors hover:bg-red-500/15"
                            aria-label="刪除預約"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    <AnimatePresence>
                      {expandedId === b.id && (
                        <tr>
                          <td colSpan={7} className="bg-white/[0.02] p-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-1 gap-4 px-6 py-4 sm:grid-cols-3">
                                <div className="flex items-center gap-2.5 text-sm">
                                  <Phone className="h-4 w-4 shrink-0 text-rose-300" />
                                  <div>
                                    <p className="text-xs text-zinc-500">電話</p>
                                    <p className="text-zinc-200">{b.customer.phone || '—'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2.5 text-sm">
                                  <Mail className="h-4 w-4 shrink-0 text-rose-300" />
                                  <div>
                                    <p className="text-xs text-zinc-500">Email</p>
                                    <p className="text-zinc-200">{b.customer.email || '—'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2.5 text-sm">
                                  <StickyNote className="h-4 w-4 shrink-0 text-rose-300" />
                                  <div>
                                    <p className="text-xs text-zinc-500">備註</p>
                                    <p className="text-zinc-200">{b.customer.notes || '—'}</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      <ConfirmDialog
        open={confirmAction !== null}
        title={
          confirmAction?.kind === 'delete'
            ? '刪除預約'
            : confirmAction
              ? ACTION_LABELS[confirmAction.status]
              : ''
        }
        message={
          confirmAction?.kind === 'delete'
            ? `確定要刪除 ${confirmAction.booking.customer.name} 的預約嗎？此操作無法復原。`
            : confirmAction
              ? `確定要將 ${confirmAction.booking.customer.name} 在 ${confirmAction.booking.date} ${confirmAction.booking.time} 的預約變更為「${STATUS_LABELS[confirmAction.status]}」嗎？`
              : ''
        }
        danger={confirmAction?.kind === 'delete' || (confirmAction?.kind === 'status' && confirmAction.status === 'cancelled')}
        loading={actionLoading}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />
    </div>
  );
}
