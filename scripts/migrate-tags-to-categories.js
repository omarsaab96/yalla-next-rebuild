import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';

function loadLocalEnv() {
  for (const file of ['.env', '.env.local']) {
    const envPath = path.join(process.cwd(), file);
    if (!fs.existsSync(envPath)) continue;

    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separator = trimmed.indexOf('=');
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator);
      const value = trimmed.slice(separator + 1);
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

function termId(term) {
  return term.wordpressId ?? term.id ?? null;
}

function uniqueValues(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    if (value === undefined || value === null || value === '') continue;
    const key = String(value);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
}

loadLocalEnv();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'yalla_together_cms';

if (!uri) {
  console.error('Set MONGODB_URI before running npm run cms:remove-tags');
  process.exit(1);
}

const client = new MongoClient(uri);
await client.connect();

try {
  const db = client.db(dbName);
  const taxonomies = db.collection('taxonomies');
  const content = db.collection('content');

  const [existingCategories, tags] = await Promise.all([
    taxonomies.find({ type: 'category' }).toArray(),
    taxonomies.find({ type: 'tag' }).toArray()
  ]);

  const categoryBySlug = new Map(existingCategories.map((category) => [category.slug, category]));
  const tagToCategoryId = new Map();
  let convertedTags = 0;
  let mergedTags = 0;

  for (const tag of tags) {
    const sourceId = termId(tag);
    const existingCategory = categoryBySlug.get(tag.slug);

    if (existingCategory) {
      const targetId = termId(existingCategory) ?? sourceId;
      if (sourceId !== null && targetId !== null) tagToCategoryId.set(String(sourceId), targetId);
      await taxonomies.deleteOne({ _id: tag._id });
      mergedTags += 1;
      continue;
    }

    const converted = {
      ...tag,
      type: 'category',
      parentId: tag.parentId || 0,
      migratedFrom: 'tag',
      migratedAt: new Date()
    };
    delete converted._id;

    await taxonomies.deleteOne({ _id: tag._id });
    await taxonomies.updateOne(
      { type: 'category', slug: tag.slug },
      { $set: converted },
      { upsert: true }
    );

    const targetId = termId(converted);
    if (sourceId !== null && targetId !== null) tagToCategoryId.set(String(sourceId), targetId);
    convertedTags += 1;
  }

  const itemsWithTags = await content.find({ tags: { $exists: true } }).toArray();
  let updatedContent = 0;

  for (const item of itemsWithTags) {
    const mappedTags = (item.tags || []).map((id) => tagToCategoryId.get(String(id)) ?? id);
    const categories = uniqueValues([...(item.categories || []), ...mappedTags]);
    await content.updateOne({ _id: item._id }, { $set: { categories }, $unset: { tags: '' } });
    updatedContent += 1;
  }

  await db.collection('settings').updateOne({ key: 'site' }, { $unset: { 'features.tags': '' } });
  await taxonomies.deleteMany({ type: 'tag' });

  const posts = await content.find({ kind: 'post' }).project({ categories: 1 }).toArray();
  const counts = new Map();
  for (const post of posts) {
    for (const categoryId of post.categories || []) {
      counts.set(String(categoryId), (counts.get(String(categoryId)) || 0) + 1);
    }
  }

  const categories = await taxonomies.find({ type: 'category' }).toArray();
  for (const category of categories) {
    const id = termId(category);
    await taxonomies.updateOne(
      { _id: category._id },
      { $set: { count: id === null ? 0 : counts.get(String(id)) || 0 } }
    );
  }

  console.log(`Converted ${convertedTags} tags into categories.`);
  console.log(`Merged ${mergedTags} tags into existing same-slug categories.`);
  console.log(`Updated ${updatedContent} content records and removed tags fields.`);
} finally {
  await client.close();
}
