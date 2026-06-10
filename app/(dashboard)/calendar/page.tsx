'use client';

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Phone, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ErrorState from '@/components/ErrorState';
import { Skeleton } from '@/components/LoadingSkeleton';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import { getBookings } from '@/lib/api';
import type { Booking } from '@/lib/types';
import { STATUS_DOT_COLORS, WEEKDAY_LABELS, cn, formatCurrency } from '@/lib/utils';

export default function CalendarPage() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [direction, setDirection] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const gridStart = startOfWeek(startOfMonth(month));
  const gridEnd = endOfWeek(endOfMonth(month));

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getBookings({
        from: format(gridStart, 'yyyy-MM-dd'),
        to: format(gridEnd, 'yyyy-MM-dd'),
      });
      setBookings(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const days = useMemo(
    () => eachDayOfInterval({ start: gridStart, end: gridEnd }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [month]
  );

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const list = map.get(b.date) || [];
      list.push(b);
      map.set(b.date, list);
    }
    for (const list of Array.from(map.values())) {
      list.sort((a, b) => a.time.localeCompare(b.time));
    }
    return map;
  }, [bookings]);

  const dayBookings = selectedDay
    ? bookingsByDay.get(format(selectedDay, 'yyyy-MM-dd')) || []
    : [];

  const changeMonth = (dir: number) => {
    setDirection(dir);
    setMonth((m) => (dir > 0 ? addMonths(m, 1) : subMonths(m, 1)));
    setSelectedDay(null);
  };

  return (
    <div>
      <PageHeader title="行事曆" description="以月曆檢視所有預約" />

      <div className="flex flex-col gap-6 xl:flex-row">
        {/* 月曆主體 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="glass flex-1 overflow-hidden p-4 sm:p-6"
        >
          {/* 月份導覽 */}
          <div className="mb-5 flex items-center justify-between">
            <button
              onClick={() => changeMonth(-1)}
              className="rounded-xl border border-white/10 p-2 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
              aria-label="上個月"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <AnimatePresence mode="wait">
              <motion.h2
                key={format(month, 'yyyy-MM')}
                initial={{ opacity: 0, x: direction * 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -28 }}
                transition={{ duration: 0.22 }}
                className="text-lg font-bold text-white"
              >
                {format(month, 'yyyy 年 M 月')}
              </motion.h2>
            </AnimatePresence>
            <button
              onClick={() => changeMonth(1)}
              className="rounded-xl border border-white/10 p-2 text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
              aria-label="下個月"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {error ? (
            <ErrorState onRetry={load} />
          ) : (
            <>
              {/* 星期標頭 */}
              <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-zinc-500">
                {WEEKDAY_LABELS.map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* 日期格 */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={format(month, 'yyyy-MM')}
                  initial={{ opacity: 0, x: direction * 48 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -48 }}
                  transition={{ duration: 0.28, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className="grid grid-cols-7 gap-1.5"
                >
                  {days.map((day) => {
                    const key = format(day, 'yyyy-MM-dd');
                    const dayList = bookingsByDay.get(key) || [];
                    const inMonth = isSameMonth(day, month);
                    const selected = selectedDay && isSameDay(day, selectedDay);
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedDay(day)}
                        className={cn(
                          'flex min-h-[76px] flex-col rounded-xl border p-1.5 text-left transition-all sm:min-h-[96px] sm:p-2',
                          selected
                            ? 'border-rose-400/50 bg-rose-500/10'
                            : 'border-white/[0.04] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]',
                          !inMonth && 'opacity-35'
                        )}
                      >
                        <span
                          className={cn(
                            'mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                            isToday(day)
                              ? 'bg-gradient-to-br from-rose-500 to-pink-500 font-bold text-white'
                              : 'text-zinc-400'
                          )}
                        >
                          {format(day, 'd')}
                        </span>
                        {loading ? (
                          <Skeleton className="h-3 w-full" />
                        ) : (
                          <div className="flex w-full flex-col gap-1">
                            {dayList.slice(0, 2).map((b) => (
                              <span
                                key={b.id}
                                className="hidden items-center gap-1 truncate rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-zinc-300 sm:flex"
                              >
                                <span
                                  className={cn(
                                    'h-1.5 w-1.5 shrink-0 rounded-full',
                                    STATUS_DOT_COLORS[b.status]
                                  )}
                                />
                                <span className="truncate">
                                  {b.time} {b.customer.name}
                                </span>
                              </span>
                            ))}
                            {dayList.length > 2 && (
                              <span className="hidden text-[10px] text-rose-300/80 sm:block">
                                +{dayList.length - 2} 筆
                              </span>
                            )}
                            {dayList.length > 0 && (
                              <span className="mx-auto mt-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500/20 px-1 text-[10px] font-bold text-rose-300 sm:hidden">
                                {dayList.length}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </motion.div>

        {/* 當日預約側欄 */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 32 }}
              transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="glass w-full shrink-0 self-start p-5 xl:w-80"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-white">
                  {format(selectedDay, 'M 月 d 日')}（{WEEKDAY_LABELS[selectedDay.getDay()]}）
                </h3>
                <button
                  onClick={() => setSelectedDay(null)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white"
                  aria-label="關閉"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {dayBookings.length === 0 ? (
                <div className="py-10 text-center">
                  <CalendarDays className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
                  <p className="text-sm text-zinc-500">這天沒有預約</p>
                </div>
              ) : (
                <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
                  {dayBookings.map((b, i) => (
                    <motion.div
                      key={b.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-sm font-bold text-white">
                          <Clock className="h-3.5 w-3.5 text-rose-300" />
                          {b.time}
                        </span>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-sm font-medium text-zinc-200">{b.customer.name}</p>
                      <p className="mt-0.5 text-xs text-zinc-400">
                        {b.serviceName} · {b.stylistName}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-zinc-500">
                          <Phone className="h-3 w-3" />
                          {b.customer.phone}
                        </span>
                        <span className="font-medium text-rose-300">{formatCurrency(b.price)}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
