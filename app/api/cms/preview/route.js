import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { createPostPreview } from '@/lib/cms';

export async function POST(request) {
  if (!await getAdminSession()) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const { post } = await request.json();
    const item = await createPostPreview(post);
    return NextResponse.json({ item, path: `/preview/${item.previewToken}/` }, {
      headers: { 'Cache-Control': 'private, no-store' }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Could not create preview.' }, { status: 400 });
  }
}
