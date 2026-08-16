import path from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getDb, hasMongoConfig } from '@/lib/mongo';

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
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!hasMongoConfig()) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured.' }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: 'Only image uploads are supported.' }, { status: 400 });
  }

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const { base, ext } = slugifyFileName(file.name);
  const fileName = `${base}-${Date.now()}${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', yyyy, mm);
  const diskPath = path.join(uploadDir, fileName);
  const localPath = `/uploads/${yyyy}/${mm}/${fileName}`;

  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(diskPath, buffer);

  const media = {
    wordpressId: localPath,
    slug: `${base}-${Date.now()}`,
    enabled: true,
    title: { en: path.basename(file.name, path.extname(file.name)), ar: path.basename(file.name, path.extname(file.name)) },
    alt: { en: '', ar: '' },
    localPath,
    sourceUrl: '',
    mimeType: file.type,
    size: file.size,
    uploadedAt: now,
    updatedAt: now
  };

  const db = await getDb();
  const result = await db.collection('media').insertOne(media);

  return NextResponse.json({
    ok: true,
    media: { ...media, _id: result.insertedId.toString(), uploadedAt: now.toISOString(), updatedAt: now.toISOString() }
  });
}
