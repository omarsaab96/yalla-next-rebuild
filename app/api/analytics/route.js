import { NextResponse } from 'next/server';
import { recordPageView } from '@/lib/analytics';

export async function POST(request) {
  let payload = {};

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  await recordPageView({
    path: payload.path,
    lang: payload.lang,
    referrer: payload.referrer,
    query: payload.query,
    userAgent: request.headers.get('user-agent') || ''
  });

  return NextResponse.json({ ok: true });
}
