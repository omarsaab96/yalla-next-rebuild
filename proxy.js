import { NextResponse } from 'next/server';

export function proxy(request) {
  const lang = request.nextUrl.searchParams.get('lang');
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-current-path', request.nextUrl.pathname);
  requestHeaders.set('x-site-lang', lang === 'en' || lang === 'ar' ? lang : request.cookies.get('lang')?.value || 'en');
  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
  if (request.nextUrl.pathname.startsWith('/preview/')) {
    response.headers.set('Cache-Control', 'private, no-store, max-age=0');
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('Referrer-Policy', 'no-referrer');
  }

  if (lang === 'en' || lang === 'ar') {
    response.cookies.set('lang', lang, {
      path: '/',
      sameSite: 'lax'
    });
  }

  return response;
}
