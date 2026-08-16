import { NextResponse } from 'next/server';

export function proxy(request) {
  const lang = request.nextUrl.searchParams.get('lang');
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-current-path', request.nextUrl.pathname);
  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  if (lang === 'en' || lang === 'ar') {
    response.cookies.set('lang', lang, {
      path: '/',
      sameSite: 'lax'
    });
  }

  return response;
}
