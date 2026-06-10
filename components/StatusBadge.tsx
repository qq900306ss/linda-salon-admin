'use client';

import type { BookingStatus } from '@/lib/types';
import {
  STATUS_COLORS,
  STATUS_DOT_COLORS,
  STATUS_LABELS,
  cn,
} from '@/lib/utils';

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        STATUS_COLORS[status]
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', STATUS_DOT_COLORS[status])} />
      {STATUS_LABELS[status]}
    </span>
  );
}
