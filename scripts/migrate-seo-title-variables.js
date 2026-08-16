import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'yalla_together_cms';
const variableTitle = '%%title%% %%sep%% %%sitename%%';

function shouldConvert(value = '', title = '') {
  if (!value || value.includes('%%')) return false;
  const normalizedValue = value.replace(/\s+/g, ' ').trim().toLowerCase();
  const normalizedTitle = title.replace(/\s+/g, ' ').trim().toLowerCase();
  return normalizedValue === normalizedTitle || normalizedValue === `${normalizedTitle} - yalla together`;
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);

const items = await db.collection('content').find({}).toArray();
let updated = 0;

for (const item of items) {
  const current = item.seo?.title || {};
  const next = { ...current };
  let changed = false;

  for (const lang of ['en', 'ar']) {
    if (shouldConvert(current[lang], item.title?.[lang] || item.title?.en || '')) {
      next[lang] = variableTitle;
      changed = true;
    }
  }

  if (changed) {
    await db.collection('content').updateOne(
      { _id: item._id },
      { $set: { 'seo.title': next, updatedAt: new Date() } }
    );
    updated += 1;
    console.log(`${item.kind}:${item.slug} -> ${variableTitle}`);
  }
}

console.log(`Updated ${updated} content items.`);
await client.close();
