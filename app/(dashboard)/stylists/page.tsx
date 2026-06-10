'use client';

/* eslint-disable @next/next/no-img-element */

import { motion } from 'framer-motion';
import {
  CalendarRange,
  ImagePlus,
  Pencil,
  Plus,
  Sparkles,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { CardGridSkeleton } from '@/components/LoadingSkeleton';
import Modal from '@/components/Modal';
import PageHeader from '@/components/PageHeader';
import { useToast } from '@/components/Toast';
import {
  ApiError,
  createStylist,
  deleteStylist,
  getStylists,
  updateStylist,
  updateStylistSchedule,
  uploadImage,
} from '@/lib/api';
import type { Stylist, StylistSchedule } from '@/lib/types';
import { WEEKDAY_LABELS, cn } from '@/lib/utils';

interface StylistForm {
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  imageUrl: string;
  yearsExperience: number;
  rating: number;
  isActive: boolean;
}

const EMPTY_FORM: StylistForm = {
  name: '',
  title: '',
  bio: '',
  specialties: [],
  imageUrl: '',
  yearsExperience: 1,
  rating: 5,
  isActive: true,
};

const DEFAULT_SCHEDULE: StylistSchedule = {
  workDays: [1, 2, 3, 4, 5],
  startTime: '10:00',
  endTime: '19:00',
  daysOff: [],
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            'h-3.5 w-3.5',
            n <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-transparent text-zinc-600'
          )}
        />
      ))}
      <span className="ml-1 text-xs text-zinc-400">{rating.toFixed(1)}</span>
    </span>
  );
}

export default function StylistsPage() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  // 編輯 Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Stylist | null>(null);
  const [form, setForm] = useState<StylistForm>(EMPTY_FORM);
  const [specialtyInput, setSpecialtyInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // 排班 Modal
  const [scheduleTarget, setScheduleTarget] = useState<Stylist | null>(null);
  const [schedule, setSchedule] = useState<StylistSchedule>(DEFAULT_SCHEDULE);
  const [dayOffInput, setDayOffInput] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);

  // 刪除
  const [deleteTarget, setDeleteTarget] = useState<Stylist | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setStylists(await getStylists());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSpecialtyInput('');
    setModalOpen(true);
  };

  const openEdit = (s: Stylist) => {
    setEditing(s);
    setForm({
      name: s.name,
      title: s.title,
      bio: s.bio,
      specialties: [...(s.specialties || [])],
      imageUrl: s.imageUrl,
      yearsExperience: s.yearsExperience,
      rating: s.rating,
      isActive: s.isActive,
    });
    setSpecialtyInput('');
    setModalOpen(true);
  };

  const openSchedule = (s: Stylist) => {
    setScheduleTarget(s);
    setSchedule({
      workDays: [...(s.schedule?.workDays || DEFAULT_SCHEDULE.workDays)],
      startTime: s.schedule?.startTime || DEFAULT_SCHEDULE.startTime,
      endTime: s.schedule?.endTime || DEFAULT_SCHEDULE.endTime,
      daysOff: [...(s.schedule?.daysOff || [])],
    });
    setDayOffInput('');
  };

  const addSpecialty = () => {
    const v = specialtyInput.trim();
    if (v && !form.specialties.includes(v)) {
      setForm((f) => ({ ...f, specialties: [...f.specialties, v] }));
    }
    setSpecialtyInput('');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast('success', '照片上傳成功');
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : '照片上傳失敗');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast('error', '請輸入設計師姓名');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateStylist(editing.id, form);
        setStylists((prev) =>
          prev.map((s) => (s.id === editing.id ? { ...s, ...form, ...updated } : s))
        );
        toast('success', '設計師資料已更新');
      } else {
        await createStylist({ ...form, schedule: DEFAULT_SCHEDULE });
        toast('success', '設計師已新增');
        await load();
      }
      setModalOpen(false);
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : '儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const toggleWorkDay = (day: number) => {
    setSchedule((s) => ({
      ...s,
      workDays: s.workDays.includes(day)
        ? s.workDays.filter((d) => d !== day)
        : [...s.workDays, day].sort((a, b) => a - b),
    }));
  };

  const addDayOff = () => {
    if (dayOffInput && !schedule.daysOff.includes(dayOffInput)) {
      setSchedule((s) => ({ ...s, daysOff: [...s.daysOff, dayOffInput].sort() }));
    }
    setDayOffInput('');
  };

  const handleSaveSchedule = async () => {
    if (!scheduleTarget) return;
    if (schedule.workDays.length === 0) {
      toast('error', '請至少選擇一個工作日');
      return;
    }
    setSavingSchedule(true);
    try {
      await updateStylistSchedule(scheduleTarget.id, schedule);
      setStylists((prev) =>
        prev.map((s) => (s.id === scheduleTarget.id ? { ...s, schedule } : s))
      );
      toast('success', '排班已更新');
      setScheduleTarget(null);
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : '排班儲存失敗');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStylist(deleteTarget.id);
      setStylists((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast('success', '設計師已刪除');
      setDeleteTarget(null);
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : '刪除失敗');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="設計師"
        description="管理沙龍的設計師團隊與排班"
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus className="h-4 w-4" />
            新增設計師
          </button>
        }
      />

      {loading ? (
        <CardGridSkeleton />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : stylists.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="尚未建立任何設計師"
          description="點擊「新增設計師」建立您的團隊"
          action={
            <button onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4" />
              新增設計師
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {stylists.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className={cn('glass glass-hover p-6', !s.isActive && 'opacity-60')}
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  {s.imageUrl ? (
                    <img
                      src={s.imageUrl}
                      alt={s.name}
                      className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/30 to-pink-500/15 text-xl font-bold text-rose-200">
                      {s.name.charAt(0)}
                    </div>
                  )}
                  <span
                    className={cn(
                      'absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-zinc-950',
                      s.isActive ? 'bg-emerald-400' : 'bg-zinc-500'
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-white">{s.name}</h3>
                  <p className="text-sm text-rose-300/90">{s.title || '設計師'}</p>
                  <div className="mt-1.5 flex items-center gap-3">
                    <Stars rating={s.rating || 0} />
                    <span className="text-xs text-zinc-500">{s.yearsExperience} 年資歷</span>
                  </div>
                </div>
              </div>

              <p className="mt-4 line-clamp-2 min-h-[2.5rem] text-sm text-zinc-400">
                {s.bio || '（無簡介）'}
              </p>

              {s.specialties && s.specialties.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.specialties.map((sp) => (
                    <span
                      key={sp}
                      className="rounded-full border border-rose-400/20 bg-rose-500/10 px-2.5 py-0.5 text-xs text-rose-200"
                    >
                      {sp}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-4">
                <button
                  onClick={() => openSchedule(s)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/25 px-3 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/15"
                >
                  <CalendarRange className="h-3.5 w-3.5" />
                  排班
                </button>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEdit(s)}
                    className="rounded-lg border border-white/10 p-2 text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
                    aria-label="編輯設計師"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(s)}
                    className="rounded-lg border border-red-500/25 p-2 text-red-400 transition-colors hover:bg-red-500/15"
                    aria-label="刪除設計師"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* 新增/編輯 Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? '編輯設計師' : '新增設計師'}
        wide
      >
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.03] transition-colors hover:border-rose-400/40"
            >
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="頭像預覽" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-6 w-6 text-zinc-500" />
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-rose-400/30 border-t-rose-400" />
                </div>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-zinc-500">姓名 *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="設計師姓名"
                  className="input"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-zinc-500">職稱</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="例如：資深設計師"
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">年資（年）</label>
              <input
                type="number"
                min={0}
                value={form.yearsExperience}
                onChange={(e) => setForm({ ...form, yearsExperience: Number(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">評分（0–5）</label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="input"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 accent-rose-500"
                />
                在職中
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-zinc-500">專長標籤</label>
            <div className="flex gap-2">
              <input
                value={specialtyInput}
                onChange={(e) => setSpecialtyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSpecialty();
                  }
                }}
                placeholder="輸入後按 Enter 新增，例如：染髮"
                className="input"
              />
              <button type="button" onClick={addSpecialty} className="btn-ghost shrink-0">
                新增
              </button>
            </div>
            {form.specialties.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {form.specialties.map((sp) => (
                  <span
                    key={sp}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-400/20 bg-rose-500/10 px-2.5 py-1 text-xs text-rose-200"
                  >
                    {sp}
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          specialties: f.specialties.filter((x) => x !== sp),
                        }))
                      }
                      className="text-rose-300/70 hover:text-white"
                      aria-label={`移除 ${sp}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-zinc-500">簡介</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              placeholder="設計師個人簡介…"
              className="input resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1" disabled={saving}>
              取消
            </button>
            <button onClick={handleSave} className="btn-primary flex-1" disabled={saving || uploading}>
              {saving ? '儲存中…' : editing ? '儲存變更' : '建立設計師'}
            </button>
          </div>
        </div>
      </Modal>

      {/* 排班 Modal */}
      <Modal
        open={scheduleTarget !== null}
        onClose={() => setScheduleTarget(null)}
        title={`${scheduleTarget?.name ?? ''} 的排班設定`}
      >
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-xs text-zinc-500">每週工作日</label>
            <div className="grid grid-cols-7 gap-1.5">
              {WEEKDAY_LABELS.map((label, day) => {
                const active = schedule.workDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleWorkDay(day)}
                    className={cn(
                      'rounded-xl border py-2.5 text-sm font-medium transition-all',
                      active
                        ? 'border-rose-400/40 bg-gradient-to-b from-rose-500/30 to-pink-500/15 text-white'
                        : 'border-white/10 bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-zinc-300'
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">上班時間</label>
              <input
                type="time"
                value={schedule.startTime}
                onChange={(e) => setSchedule({ ...schedule, startTime: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">下班時間</label>
              <input
                type="time"
                value={schedule.endTime}
                onChange={(e) => setSchedule({ ...schedule, endTime: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-zinc-500">特定休假日</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dayOffInput}
                onChange={(e) => setDayOffInput(e.target.value)}
                className="input"
              />
              <button type="button" onClick={addDayOff} className="btn-ghost shrink-0">
                新增
              </button>
            </div>
            {schedule.daysOff.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {schedule.daysOff.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1 rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-xs text-violet-200"
                  >
                    {d}
                    <button
                      type="button"
                      onClick={() =>
                        setSchedule((s) => ({
                          ...s,
                          daysOff: s.daysOff.filter((x) => x !== d),
                        }))
                      }
                      className="text-violet-300/70 hover:text-white"
                      aria-label={`移除 ${d}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-zinc-600">尚未設定休假日</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setScheduleTarget(null)}
              className="btn-ghost flex-1"
              disabled={savingSchedule}
            >
              取消
            </button>
            <button onClick={handleSaveSchedule} className="btn-primary flex-1" disabled={savingSchedule}>
              {savingSchedule ? '儲存中…' : '儲存排班'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="刪除設計師"
        message={`確定要刪除「${deleteTarget?.name}」嗎？此操作無法復原。`}
        confirmText="刪除"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
