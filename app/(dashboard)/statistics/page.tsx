'use client';

import { format, parseISO, subDays } from 'date-fns';
import { motion } from 'framer-motion';
import { BarChart3, CalendarCheck, DollarSign, TrendingUp } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ErrorState from '@/components/ErrorState';
import GlassCard from '@/components/GlassCard';
import { Skeleton } from '@/components/LoadingSkeleton';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import { getBookings, getRevenueStats } from '@/lib/api';
import type { Booking, DailyRevenue } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

const PRESETS = [
  { label: '近 7 天', days: 7 },
  { label: '近 30 天', days: 30 },
  { label: '近 90 天', days: 90 },
];

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass bg-zinc-900/95 px-4 py-3 text-sm">
      <p className="mb-1 font-medium text-zinc-300">{label}</p>
      <p className="font-bold text-rose-300">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

function BreakdownChart({
  title,
  data,
  color,
  delay,
}: {
  title: string;
  data: { name: string; revenue: number; count: number }[];
  color: string;
  delay: number;
}) {
  return (
    <GlassCard className="p-6" delay={delay}>
      <h2 className="mb-4 font-bold text-white">{title}</h2>
      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">此區間尚無資料</p>
      ) : (
        <div style={{ height: Math.max(data.length * 44, 160) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#71717a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={88}
                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<RevenueTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="revenue" fill={color} radius={[0, 8, 8, 0]} barSize={18} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </GlassCard>
  );
}

export default function StatisticsPage() {
  const today = useMemo(() => new Date(), []);
  const [from, setFrom] = useState(format(subDays(today, 29), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(today, 'yyyy-MM-dd'));
  const [revenue, setRevenue] = useState<DailyRevenue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!from || !to) return;
    setLoading(true);
    setError(false);
    try {
      const [rev, bks] = await Promise.all([
        getRevenueStats(from, to),
        getBookings({ from, to }),
      ]);
      setRevenue(rev);
      setBookings(bks);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const totalRevenue = revenue.reduce((s, d) => s + d.revenue, 0);
    const totalBookings = revenue.reduce((s, d) => s + d.bookings, 0);
    const days = Math.max(revenue.length, 1);
    return {
      revenue: totalRevenue,
      bookings: totalBookings,
      avgPerDay: Math.round(totalRevenue / days),
    };
  }, [revenue]);

  const chartData = useMemo(
    () =>
      revenue.map((d) => ({
        ...d,
        label: format(parseISO(d.date), 'M/d'),
      })),
    [revenue]
  );

  // 以完成/確認的預約計算服務與設計師營收占比
  const breakdowns = useMemo(() => {
    const valid = bookings.filter((b) => b.status !== 'cancelled');
    const byService = new Map<string, { revenue: number; count: number }>();
    const byStylist = new Map<string, { revenue: number; count: number }>();
    for (const b of valid) {
      const s = byService.get(b.serviceName) || { revenue: 0, count: 0 };
      s.revenue += b.price;
      s.count += 1;
      byService.set(b.serviceName, s);
      const st = byStylist.get(b.stylistName) || { revenue: 0, count: 0 };
      st.revenue += b.price;
      st.count += 1;
      byStylist.set(b.stylistName, st);
    }
    const toSorted = (m: Map<string, { revenue: number; count: number }>) =>
      Array.from(m.entries())
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8);
    return { services: toSorted(byService), stylists: toSorted(byStylist) };
  }, [bookings]);

  const applyPreset = (days: number) => {
    setFrom(format(subDays(new Date(), days - 1), 'yyyy-MM-dd'));
    setTo(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="營收統計" description="分析指定期間的營收表現" />

      {/* 日期區間選擇 */}
      <GlassCard className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1.5 block text-xs text-zinc-500">開始日期</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-zinc-500">結束日期</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input" />
          </div>
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button key={p.days} onClick={() => applyPreset(p.days)} className="btn-ghost !px-4 !py-2.5 text-xs">
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard title="期間總營收" value={totals.revenue} prefix="NT$ " icon={DollarSign} accent="rose" />
            <StatCard title="期間預約數" value={totals.bookings} icon={CalendarCheck} accent="violet" delay={0.08} />
            <StatCard title="平均日營收" value={totals.avgPerDay} prefix="NT$ " icon={TrendingUp} accent="emerald" delay={0.16} />
          </div>

          <GlassCard className="p-6" delay={0.2}>
            <h2 className="mb-4 font-bold text-white">每日營收</h2>
            {chartData.length === 0 ? (
              <div className="py-12 text-center">
                <BarChart3 className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
                <p className="text-sm text-zinc-500">此區間尚無營收資料</p>
              </div>
            ) : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="statRevGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fb7189" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="#fb7189" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: '#71717a', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      interval="preserveStartEnd"
                      minTickGap={28}
                    />
                    <YAxis
                      tick={{ fill: '#71717a', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={56}
                      tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
                    />
                    <Tooltip content={<RevenueTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#fb7189"
                      strokeWidth={2.5}
                      fill="url(#statRevGradient)"
                      animationDuration={1200}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          >
            <BreakdownChart title="各服務營收" data={breakdowns.services} color="#fb7189" delay={0.28} />
            <BreakdownChart title="各設計師營收" data={breakdowns.stylists} color="#a78bfa" delay={0.34} />
          </motion.div>
        </>
      )}
    </div>
  );
}
