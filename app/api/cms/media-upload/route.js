import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb, hasMongoConfig } from '@/lib/mongo';
import { getMediaUploadPath, getUploadPublicPath } from '@/lib/mediaStorage';

export const runtime = 'nodejs';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']);

function slugifyFileName(name) {
  const ext = path.extname(name).toLowerCase();
  const base = path.basename(name, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'media';
  return { base, ext: ext || '.jpg' };
}

export async function POST(request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    if (!hasMongoConfig()) {
      return NextResponse.json({ error: 'MONGODB_URI is not configured.' }, { status: 400 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files').filter((file) => file && typeof file !== 'string');
    const legacyFile = formData.get('file');
    if (legacyFile && typeof legacyFile !== 'string') files.push(legacyFile);

    if (files.length === 0) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const unsupportedFile = files.find((file) => !allowedTypes.has(file.type));
    if (unsupportedFile) {
      return NextResponse.json({ error: 'Only image uploads are supported.' }, { status: 400 });
    }

    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const uploadDir = getMediaUploadPath(yyyy, mm);
    const db = await getDb();
    await mkdir(uploadDir, { recursive: true });

    const mediaItems = [];
    for (const [index, file] of files.entries()) {
      const { base, ext } = slugifyFileName(file.name);
      const uniqueSuffix = `${Date.now()}-${index}`;
      const fileName = `${base}-${uniqueSuffix}${ext}`;
      const diskPath = getMediaUploadPath(yyyy, mm, fileName);
      const localPath = getUploadPublicPath(yyyy, mm, fileName);
      const title = path.basename(file.name, path.extname(file.name));

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(diskPath, buffer);

      mediaItems.push({
        wordpressId: localPath,
        slug: `${base}-${uniqueSuffix}`,
        enabled: true,
        title: { en: title, ar: title },
        alt: { en: '', ar: '' },
        localPath,
        sourceUrl: '',
        mimeType: file.type,
        size: file.size,
        uploadedAt: now,
        updatedAt: now
      });
    }

    const result = await db.collection('media').insertMany(mediaItems);
    const serializedMediaItems = mediaItems.map((media, index) => ({
      ...media,
      _id: result.insertedIds[index].toString(),
      uploadedAt: now.toISOString(),
      updatedAt: now.toISOString()
    }));

    return NextResponse.json({
      ok: true,
      media: serializedMediaItems[0],
      mediaItems: serializedMediaItems
    });
  } catch (error) {
    console.error('Media upload failed', error);
    return NextResponse.json({ error: error.message || 'Upload failed.' }, { status: 500 });
  }
}
