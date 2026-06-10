'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getToken } from '@/lib/api';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login/');
    } else {
      setAuthed(true);
    }
  }, [router]);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-rose-400/30 border-t-rose-400" />
      </div>
    );
  }

  return <>{children}</>;
}
