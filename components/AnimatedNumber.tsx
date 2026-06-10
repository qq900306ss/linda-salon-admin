'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  duration?: number;
}

export default function AnimatedNumber({
  value,
  prefix = '',
  duration = 1200,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    startRef.current = null;
    let raf: number;

    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {Math.round(display).toLocaleString('zh-TW')}
    </span>
  );
}
