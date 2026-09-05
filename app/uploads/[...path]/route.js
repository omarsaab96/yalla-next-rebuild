import { readFile, stat } from 'fs/promises';
import { NextResponse } from 'next/server';
import { getMediaUploadPath, getMimeType } from '@/lib/mediaStorage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  const segments = resolvedParams?.path || [];

  try {
    const filePath = getMediaUploadPath(...segments);
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: 'Not found.' }, { status: 404 });
    }

    const file = await readFile(filePath);
    return new NextResponse(file, {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': String(file.length),
        'Content-Type': getMimeType(filePath)
      }
    });
  } catch {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }
}
