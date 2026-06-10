'use client';

import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Scissors, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApiError, getToken, login, setToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (getToken()) {
      router.replace('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('請輸入帳號與密碼');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await login(username, password);
      setToken(res.token);
      router.replace('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.status === 401 || err.status === 400 ? '帳號或密碼錯誤' : err.message);
      } else {
        setError('登入失敗，請稍後再試');
      }
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* 動態漸層光暈背景 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-blob rounded-full bg-rose-500/20 blur-[120px]" />
        <div
          className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] animate-blob rounded-full bg-pink-500/15 blur-[140px]"
          style={{ animationDelay: '-6s' }}
        />
        <div
          className="absolute left-1/3 top-1/2 h-72 w-72 animate-blob rounded-full bg-violet-500/10 blur-[100px]"
          style={{ animationDelay: '-12s' }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="glass relative w-full max-w-md p-8 sm:p-10"
      >
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 18 }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-xl shadow-rose-500/40"
          >
            <Scissors className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="gradient-text text-2xl font-black tracking-tight">
            Linda Salon 管理後台
          </h1>
          <p className="mt-2 text-sm text-zinc-400">請登入以管理您的沙龍</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="管理員帳號"
              autoComplete="username"
              className="input pl-11"
            />
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密碼"
              autoComplete="current-password"
              className="input pl-11 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-zinc-500 transition-colors hover:text-zinc-300"
              aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-sm text-red-300"
            >
              {error}
            </motion.p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
            {loading ? '登入中…' : '登入'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} Linda Salon. 版權所有
        </p>
      </motion.div>
    </div>
  );
}
