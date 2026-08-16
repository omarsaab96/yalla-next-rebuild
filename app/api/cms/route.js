import { NextResponse } from 'next/server';
import { deleteContentItem, deleteTermItem, saveMediaCollection, saveSettings, saveContentCollection, saveTermsCollection } from '@/lib/cms';
import { getAdminSession } from '@/lib/auth';
import { hasMongoConfig } from '@/lib/mongo';

export async function POST(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!hasMongoConfig()) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured.' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  try {
    if (body.type === 'settings') {
      await saveSettings(body.payload);
      return NextResponse.json({ ok: true });
    }

    if (body.type === 'content') {
      if (!Array.isArray(body.payload)) throw new Error('Content payload must be an array.');
      await saveContentCollection(body.payload);
      return NextResponse.json({ ok: true });
    }

    if (body.type === 'taxonomies') {
      if (!Array.isArray(body.payload)) throw new Error('Taxonomies payload must be an array.');
      await saveTermsCollection(body.payload);
      return NextResponse.json({ ok: true });
    }

    if (body.type === 'media') {
      if (!Array.isArray(body.payload)) throw new Error('Media payload must be an array.');
      await saveMediaCollection(body.payload);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown CMS section.' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  if (!hasMongoConfig()) {
    return NextResponse.json({ error: 'MONGODB_URI is not configured.' }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (body.type === 'content') {
    await deleteContentItem({ id: body.id, kind: body.kind, slug: body.slug });
    return NextResponse.json({ ok: true });
  }

  if (body.type === 'taxonomy') {
    await deleteTermItem({ id: body.id, type: body.termType, slug: body.slug });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unsupported deletion type.' }, { status: 400 });
}
