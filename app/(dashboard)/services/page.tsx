'use client';

/* eslint-disable @next/next/no-img-element */

import { motion } from 'framer-motion';
import { Clock, ImagePlus, Pencil, Plus, Scissors, Trash2 } from 'lucide-react';
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
  createService,
  deleteService,
  getServices,
  updateService,
  uploadImage,
} from '@/lib/api';
import type { Service } from '@/lib/types';
import { cn, formatCurrency } from '@/lib/utils';

interface ServiceForm {
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
}

const EMPTY_FORM: ServiceForm = {
  name: '',
  description: '',
  category: '',
  durationMinutes: 60,
  price: 0,
  imageUrl: '',
  isActive: true,
  sortOrder: 0,
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getServices();
      data.sort((a, b) => a.sortOrder - b.sortOrder);
      setServices(data);
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
    setForm({ ...EMPTY_FORM, sortOrder: services.length });
    setModalOpen(true);
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setForm({
      name: s.name,
      description: s.description,
      category: s.category,
      durationMinutes: s.durationMinutes,
      price: s.price,
      imageUrl: s.imageUrl,
      isActive: s.isActive,
      sortOrder: s.sortOrder,
    });
    setModalOpen(true);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => ({ ...f, imageUrl: url }));
      toast('success', '圖片上傳成功');
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : '圖片上傳失敗');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast('error', '請輸入服務名稱');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateService(editing.id, form);
        setServices((prev) =>
          prev.map((s) => (s.id === editing.id ? { ...s, ...form, ...updated } : s))
        );
        toast('success', '服務已更新');
      } else {
        await createService(form);
        toast('success', '服務已新增');
        await load();
      }
      setModalOpen(false);
    } catch (err) {
      toast('error', err instanceof ApiError ? err.message : '儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (s: Service) => {
    const next = !s.isActive;
    setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, isActive: next } : x)));
    try {
      await updateService(s.id, { isActive: next });
      toast('success', next ? '服務已上架' : '服務已下架');
    } catch (err) {
      setServices((prev) =>
        prev.map((x) => (x.id === s.id ? { ...x, isActive: s.isActive } : x))
      );
      toast('error', err instanceof ApiError ? err.message : '操作失敗');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteService(deleteTarget.id);
      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      toast('success', '服務已刪除');
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
        title="服務項目"
        description="管理沙龍提供的所有服務"
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus className="h-4 w-4" />
            新增服務
          </button>
        }
      />

      {loading ? (
        <CardGridSkeleton />
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : services.length === 0 ? (
        <EmptyState
          icon={Scissors}
          title="尚未建立任何服務"
          description="點擊「新增服務」開始建立您的服務項目"
          action={
            <button onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4" />
              新增服務
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className={cn('glass glass-hover overflow-hidden', !s.isActive && 'opacity-60')}
            >
              <div className="relative h-40 overflow-hidden bg-gradient-to-br from-rose-500/10 to-pink-500/5">
                {s.imageUrl ? (
                  <img src={s.imageUrl} alt={s.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Scissors className="h-10 w-10 text-rose-300/30" />
                  </div>
                )}
                {s.category && (
                  <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-xs text-zinc-200 backdrop-blur-md">
                    {s.category}
                  </span>
                )}
                {!s.isActive && (
                  <span className="absolute right-3 top-3 rounded-full bg-zinc-800/90 px-2.5 py-1 text-xs text-zinc-400">
                    已下架
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white">{s.name}</h3>
                  <span className="shrink-0 text-lg font-bold text-rose-300">
                    {formatCurrency(s.price)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-zinc-400">
                  {s.description || '（無描述）'}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
                  <Clock className="h-3.5 w-3.5" />
                  {s.durationMinutes} 分鐘
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  {/* 上架開關 */}
                  <button
                    onClick={() => handleToggleActive(s)}
                    className="flex items-center gap-2 text-xs text-zinc-400"
                    aria-label={s.isActive ? '下架服務' : '上架服務'}
                  >
                    <span
                      className={cn(
                        'relative h-5 w-9 rounded-full transition-colors',
                        s.isActive ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-white/10'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                          s.isActive ? 'left-[18px]' : 'left-0.5'
                        )}
                      />
                    </span>
                    {s.isActive ? '上架中' : '已下架'}
                  </button>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEdit(s)}
                      className="rounded-lg border border-white/10 p-2 text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
                      aria-label="編輯服務"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(s)}
                      className="rounded-lg border border-red-500/25 p-2 text-red-400 transition-colors hover:bg-red-500/15"
                      aria-label="刪除服務"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
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
        title={editing ? '編輯服務' : '新增服務'}
        wide
      >
        <div className="space-y-4">
          {/* 圖片上傳 */}
          <div>
            <label className="mb-1.5 block text-xs text-zinc-500">服務圖片</label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-white/[0.03] transition-colors hover:border-rose-400/40"
            >
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="服務圖片預覽" className="h-full w-full object-cover" />
              ) : (
                <div className="text-center">
                  <ImagePlus className="mx-auto mb-2 h-7 w-7 text-zinc-500" />
                  <p className="text-sm text-zinc-500">點擊上傳圖片</p>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <div className="h-7 w-7 animate-spin rounded-full border-2 border-rose-400/30 border-t-rose-400" />
                </div>
              )}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">服務名稱 *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例如：精緻剪髮"
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">分類</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="例如：剪髮"
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">價格（NT$）</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">所需時間（分鐘）</label>
              <input
                type="number"
                min={5}
                step={5}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                className="input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-zinc-500">排序</label>
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
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
                上架此服務
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-zinc-500">描述</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="服務內容說明…"
              className="input resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1" disabled={saving}>
              取消
            </button>
            <button onClick={handleSave} className="btn-primary flex-1" disabled={saving || uploading}>
              {saving ? '儲存中…' : editing ? '儲存變更' : '建立服務'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="刪除服務"
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
