'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function AnalyticsTracker({ lang }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;

    const payload = {
      path: pathname || '/',
      lang,
      referrer: document.referrer || '',
      query: searchParams?.toString() || ''
    };

    navigator.sendBeacon?.('/api/analytics', JSON.stringify(payload)) ||
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      });
  }, [pathname, searchParams, lang]);

  return null;
}
