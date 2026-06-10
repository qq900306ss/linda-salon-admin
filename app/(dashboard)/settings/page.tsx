'use client';

import { Clock, MapPin, Phone, Save, Store } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import ErrorState from '@/components/ErrorState';
import GlassCard from '@/components/GlassCard';
import { Skeleton } from '@/components/LoadingSkeleton';
import PageHeader from '@/components/PageHeader';
import { useToast } from '@/components/Toast';
import { ApiError, getSettings, updateSettings } from '@/lib/api';
import type { Settings } from '@/lib/types';
import { WEEKDAY_LABELS, cn } from '@/lib/utils';

const SLOT_OPTIONS = [15, 30, 45, 60, 90, 120];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setSettings(await getSettings());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
  };

  const toggleClosedDay = (day: number) => {
    if (!settings) return;
    const set = new Set(settings.closedWeekdays);
    if (set.has(day)) {
      set.delete(day);
    } else {
      set.add(day);
    }
    update('closedWeekdays', Array.from(set).sort((a, b) => a - b));
  };

  const handleSave = async () => {
    if (!settings) return;
    if (!settings.salonName.trim()) {
      toast('error', '請輸入店名');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateSettings(settings);
      setSettings(updated);
      toast('success', '設定已儲存');
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : '儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="系統設定" description="管理沙龍基本資訊與營業時段" />
        <div className="space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div>
        <PageHeader title="系統設定" description="管理沙龍基本資訊與營業時段" />
        <ErrorState onRetry={load} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="系統設定"
        description="管理沙龍基本資訊與營業時段"
        action={
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save className="h-4 w-4" />
            {saving ? '儲存中…' : '儲存設定'}
          </button>
        }
      />

      <div className="space-y-6">
        {/* 基本資訊 */}
        <GlassCard className="p-6">
          <div className="mb-5 flex items-center gap-2">
            <Store className="h-5 w-5 text-rose-300" />
            <h2 className="font-bold text-white">基本資訊</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">店名 *</label>
              <input
                value={settings.salonName}
                onChange={(e) => update('salonName', e.target.value)}
                placeholder="Linda Salon"
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs text-zinc-500">
                <Phone className="h-3 w-3" /> 聯絡電話
              </label>
              <input
                value={settings.phone}
                onChange={(e) => update('phone', e.target.value)}
                placeholder="02-1234-5678"
                className="input"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 flex items-center gap-1 text-xs text-zinc-500">
                <MapPin className="h-3 w-3" /> 地址
              </label>
              <input
                value={settings.address}
                onChange={(e) => update('address', e.target.value)}
                placeholder="台北市…"
                className="input"
              />
            </div>
          </div>
        </GlassCard>

        {/* 營業時間 */}
        <GlassCard className="p-6" delay={0.1}>
          <div className="mb-5 flex items-center gap-2">
            <Clock className="h-5 w-5 text-rose-300" />
            <h2 className="font-bold text-white">營業時間</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">開店時間</label>
              <input
                type="time"
                value={settings.openTime}
                onChange={(e) => update('openTime', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">打烊時間</label>
              <input
                type="time"
                value={settings.closeTime}
                onChange={(e) => update('closeTime', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">預約時段間隔</label>
              <select
                value={settings.slotIntervalMinutes}
                onChange={(e) => update('slotIntervalMinutes', Number(e.target.value))}
                className="input"
              >
                {SLOT_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m} 分鐘
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-xs text-zinc-500">每週公休日</label>
            <div className="grid max-w-md grid-cols-7 gap-1.5">
              {WEEKDAY_LABELS.map((label, day) => {
                const closed = settings.closedWeekdays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleClosedDay(day)}
                    className={cn(
                      'rounded-xl border py-2.5 text-sm font-medium transition-all',
                      closed
                        ? 'border-rose-400/40 bg-gradient-to-b from-rose-500/30 to-pink-500/15 text-white'
                        : 'border-white/10 bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-zinc-300'
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-zinc-600">
              {settings.closedWeekdays.length === 0
                ? '目前無公休日'
                : `公休日：每週${settings.closedWeekdays.map((d) => WEEKDAY_LABELS[d]).join('、')}`}
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
