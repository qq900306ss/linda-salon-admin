'use client';

import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  sub?: string;
  icon: LucideIcon;
  accent?: 'rose' | 'violet' | 'sky' | 'amber' | 'emerald';
  delay?: number;
}

const ACCENTS = {
  rose: 'from-rose-500/20 to-pink-500/5 text-rose-300',
  violet: 'from-violet-500/20 to-purple-500/5 text-violet-300',
  sky: 'from-sky-500/20 to-cyan-500/5 text-sky-300',
  amber: 'from-amber-500/20 to-orange-500/5 text-amber-300',
  emerald: 'from-emerald-500/20 to-teal-500/5 text-emerald-300',
};

export default function StatCard({
  title,
  value,
  prefix,
  sub,
  icon: Icon,
  accent = 'rose',
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="glass glass-hover relative overflow-hidden p-5"
    >
      <div
        className={cn(
          'pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br blur-2xl',
          ACCENTS[accent]
        )}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            <AnimatedNumber value={value} prefix={prefix} />
          </p>
          {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
        </div>
        <div
          className={cn(
            'rounded-xl bg-gradient-to-br p-2.5',
            ACCENTS[accent]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}
