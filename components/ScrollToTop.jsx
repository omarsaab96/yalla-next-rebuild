'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function scrollToPageTop() {
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  });
}

export function ScrollToTop() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    scrollToPageTop();
  }, [pathname, searchParams]);

  return null;
}
