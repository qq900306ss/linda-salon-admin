import type { BookingStatus } from './types';

export function formatCurrency(n: number): string {
  return `NT$ ${Math.round(n).toLocaleString('zh-TW')}`;
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString('zh-TW');
}

export const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六'];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: '待確認',
  confirmed: '已確認',
  completed: '已完成',
  cancelled: '已取消',
};

export const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  confirmed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  completed: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  cancelled: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
};

export const STATUS_DOT_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-amber-400',
  confirmed: 'bg-emerald-400',
  completed: 'bg-sky-400',
  cancelled: 'bg-zinc-400',
};

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
