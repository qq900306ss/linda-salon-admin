'use client';

import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import {
  CalendarCheck,
  CalendarClock,
  Crown,
  DollarSign,
  Flame,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ErrorState from '@/components/ErrorState';
import GlassCard from '@/components/GlassCard';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { PageSkeleton } from '@/components/LoadingSkeleton';
import PageHeader from '@/components/PageHeader';
import { getDashboardStats } from '@/lib/api';
import type { DashboardStats } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass bg-zinc-900/95 px-4 py-3 text-sm">
      <p className="mb-1 font-medium text-zinc-300">{label}</p>
      <p className="font-bold text-rose-300">{formatCurrency(payload[0].value)}</p>
      <p className="text-xs text-zinc-500">{payload[0].payload.bookings} 筆預約</p>
    </div>
  );
}

function RankList({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: { name: string; count: number; revenue: number }[];
}) {
  const max = Math.max(...items.map((i) => i.revenue), 1);
  return (
    <GlassCard className="p-6" delay={0.25}>
      <div className="mb-5 flex items-center gap-2">
        {icon}
        <h2 className="font-bold text-white">{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">尚無資料</p>
      ) : (
        <div className="space-y-4">
          {items.slice(0, 5).map((item, idx) => (
            <div key={item.name + idx}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-zinc-300">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md text-[11px] font-bold ${
                      idx === 0
                        ? 'bg-rose-500/25 text-rose-300'
                        : 'bg-white/[0.06] text-zinc-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  {item.name}
                </span>
                <span className="font-medium text-zinc-400">
                  {formatCurrency(item.revenue)}
                  <span className="ml-1.5 text-xs text-zinc-600">({item.count} 筆)</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.revenue / max) * 100}%` }}
                  transition={{ duration: 0.9, delay: 0.3 + idx * 0.08, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-400"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <PageSkeleton />;
  if (error || !stats) return <ErrorState onRetry={load} />;

  const chartData = stats.dailyRevenue.map((d) => ({
    ...d,
    label: format(parseISO(d.date), 'M/d'),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="總覽" description="掌握沙龍今日營運狀況" />

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="今日預約"
          value={stats.today.bookings}
          sub={`營收 ${formatCurrency(stats.today.revenue)}`}
          icon={CalendarCheck}
          accent="rose"
          delay={0}
        />
        <StatCard
          title="本週預約"
          value={stats.week.bookings}
          sub={`營收 ${formatCurrency(stats.week.revenue)}`}
          icon={TrendingUp}
          accent="violet"
          delay={0.08}
        />
        <StatCard
          title="本月營收"
          value={stats.month.revenue}
          prefix="NT$ "
          sub={`共 ${stats.month.bookings} 筆預約`}
          icon={DollarSign}
          accent="emerald"
          delay={0.16}
        />
        <StatCard
          title="待確認預約"
          value={stats.pendingCount}
          sub="需要您的處理"
          icon={CalendarClock}
          accent="amber"
          delay={0.24}
        />
      </div>

      {/* 營收趨勢圖 */}
      <GlassCard className="p-6" delay={0.2}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-white">近 30 天營收趨勢</h2>
          <span className="text-xs text-zinc-500">單位：新台幣</span>
        </div>
        {chartData.length === 0 ? (
          <p className="py-12 text-center text-sm text-zinc-500">尚無營收資料</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
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
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#fb7189"
                  strokeWidth={2.5}
                  fill="url(#revGradient)"
                  animationDuration={1200}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </GlassCard>

      {/* 排行榜 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RankList
          title="熱門服務"
          icon={<Flame className="h-5 w-5 text-rose-400" />}
          items={stats.popularServices.map((s) => ({
            name: s.serviceName,
            count: s.count,
            revenue: s.revenue,
          }))}
        />
        <RankList
          title="設計師排行"
          icon={<Crown className="h-5 w-5 text-amber-400" />}
          items={stats.topStylists.map((s) => ({
            name: s.stylistName,
            count: s.count,
            revenue: s.revenue,
          }))}
        />
      </div>

      {/* 最近預約 */}
      <GlassCard className="p-6" delay={0.3}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold text-white">最近預約</h2>
          <Link href="/bookings/" className="text-sm text-rose-300 transition-colors hover:text-rose-200">
            查看全部 →
          </Link>
        </div>
        {stats.recentBookings.length === 0 ? (
          <EmptyState title="尚無預約紀錄" description="新的預約將會顯示在這裡" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs text-zinc-500">
                  <th className="pb-3 font-medium">顧客</th>
                  <th className="pb-3 font-medium">服務</th>
                  <th className="pb-3 font-medium">設計師</th>
                  <th className="pb-3 font-medium">日期時間</th>
                  <th className="pb-3 text-right font-medium">金額</th>
                  <th className="pb-3 text-right font-medium">狀態</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.slice(0, 8).map((b) => (
                  <tr key={b.id} className="table-row-hover border-b border-white/[0.04] last:border-0">
                    <td className="py-3.5 font-medium text-zinc-200">{b.customer.name}</td>
                    <td className="py-3.5 text-zinc-400">{b.serviceName}</td>
                    <td className="py-3.5 text-zinc-400">{b.stylistName}</td>
                    <td className="py-3.5 text-zinc-400">
                      {b.date} {b.time}
                    </td>
                    <td className="py-3.5 text-right font-medium text-zinc-200">
                      {formatCurrency(b.price)}
                    </td>
                    <td className="py-3.5 text-right">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
