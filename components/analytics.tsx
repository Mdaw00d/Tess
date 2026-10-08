'use client';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { identifyAnalytics, trackPage } from '@/lib/analytics';
export function Analytics() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);
  const { data, isPending } = authClient.useSession();
  useEffect(() => {
    if (!isPending) identifyAnalytics(data?.user.id ?? null);
  }, [data?.user.id, isPending]);
  useEffect(() => {
    if (pathname && previous.current !== pathname) {
      trackPage(pathname);
      previous.current = pathname;
    }
  }, [pathname]);
  return null;
}

