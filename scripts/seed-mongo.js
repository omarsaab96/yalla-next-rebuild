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

loadLocalEnv();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'yalla_together_cms';
const dataDir = path.join(process.cwd(), 'data');

if (!uri) {
  console.error('Set MONGODB_URI before running npm run seed:mongo');
  process.exit(1);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
}

function decodeHtml(value = '') {
  return String(value)
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '')
    .trim();
}

function cleanContent(html = '') {
  return String(html)
    .replace(/https:\/\/yallatogether\.com/g, '')
    .replace(/srcset="[^"]*"/g, '')
    .replace(/\sdata-recalc-dims="[^"]*"/g, '')
    .replace(/\sloading="lazy"/g, '')
    .replace(/\sdecoding="async"/g, '');
}

function localized(value) {
  return { en: value, ar: value };
}

function contentRecord(item, kind) {
  const title = decodeHtml(item.title);
  const excerpt = decodeHtml(item.excerpt || '');
  const content = cleanContent(item.content?.transformed || item.content?.rendered || '');
  const categories = Array.from(new Set([...(item.categories || []), ...(item.tags || [])]));

  return {
    wordpressId: item.wordpressId,
    kind,
    slug: item.slug,
    status: item.status || 'publish',
    enabled: true,
    title: localized(title),
    excerpt: localized(excerpt),
    content: localized(content),
    seo: {
      title: localized(decodeHtml(item.seo?.title || title)),
      description: localized(decodeHtml(item.seo?.description || excerpt))
    },
    template: kind === 'page' ? (item.slug === 'home' ? 'homepage' : item.template?.replace(/^page_|\.[^.]+$/g, '') || 'standard') : 'standard',
    featuredImage: item.featuredImage?.localPath ? `/${item.featuredImage.localPath}` : '',
    featuredImageAlt: localized(item.featuredImage?.alt || title),
    categories,
    publishedAt: item.publishedAt,
    modifiedAt: item.modifiedAt,
    menuOrder: item.menuOrder || 0,
    importedAt: new Date()
  };
}

function termRecord(term, type) {
  const name = decodeHtml(term.name);
  return {
    wordpressId: term.id || term.wordpressId,
    type,
    slug: term.slug,
    enabled: true,
    name: localized(name),
    description: localized(decodeHtml(term.description || '')),
    parentId: term.parent || term.parentId || 0,
    count: term.count || 0,
    importedAt: new Date()
  };
}

function mediaRecord(item) {
  const title = decodeHtml(item.title || item.slug || '');
  return {
    wordpressId: item.wordpressId || item.id,
    slug: item.slug,
    title: localized(title),
    alt: localized(decodeHtml(item.alt || '')),
    sourceUrl: item.sourceUrl || item.originalUrl,
    localPath: item.localPath ? `/${item.localPath}` : '',
    mimeType: item.mimeType || item.mediaType || '',
    enabled: true,
    importedAt: new Date()
  };
}

const settings = {
  key: 'site',
  siteName: 'Yalla Together',
  description: 'your go-to resource for gifts that do good and delight',
  email: 'hello@yallatogether.com',
  languages: {
    en: { label: 'English', enabled: true, direction: 'ltr' },
    ar: { label: 'Arabic', enabled: false, direction: 'rtl' }
  },
  features: {
    blog: true,
    pages: true,
    categories: true,
    homepageHero: true,
    homepageCategories: true,
    homepageIntro: true,
    homepageLatest: true,
    contactCta: true
  },
  navigation: [
    { label: { en: 'Gift Finder', ar: 'دليل الهدايا' }, href: '/gift-finder/', enabled: true },
    { label: { en: 'Blog', ar: 'المدونة' }, href: '/blog/', enabled: true, feature: 'blog' },
    { label: { en: 'About', ar: 'من نحن' }, href: '/about/', enabled: true },
    { label: { en: 'Services', ar: 'الخدمات' }, href: '/services/', enabled: true },
    { label: { en: 'Contact', ar: 'تواصل' }, href: '/contact/', enabled: true }
  ],
  homepage: {
    heroKicker: { en: 'Welcome to', ar: 'أهلا بكم في' },
    heroTitle: { en: 'Yalla Together', ar: 'Yalla Together' },
    heroText: {
      en: 'Gifts that do good and delight, curated through stories worth keeping.',
      ar: 'هدايا تسعد وتترك أثرا، منتقاة من قصص تستحق أن تبقى.'
    },
    introKicker: { en: 'your thoughtful guide', ar: 'دليلك للهدايا الهادفة' },
    introTitle: {
      en: 'Meaningful gifts, local makers, and pieces with a point of view',
      ar: 'هدايا ذات معنى وصناع محليون وقطع لها قصة'
    },
    introText: {
      en: 'Whether you are choosing for a wedding, a teacher, a holiday table, or someone impossible to shop for, Yalla Together brings the story behind the object forward.',
      ar: 'سواء كنت تختار هدية لزفاف أو معلم أو مناسبة أو لشخص يصعب إرضاؤه، نضع القصة خلف الهدية في المقدمة.'
    },
    contactTitle: { en: 'Need help?', ar: 'تحتاج مساعدة؟' },
    contactText: {
      en: 'Tell us who you are shopping for and what the moment means. We will help you find the right story.',
      ar: 'أخبرنا لمن تبحث عن هدية وما معنى المناسبة، وسنساعدك في اختيار القصة المناسبة.'
    }
  },
  updatedAt: new Date()
};

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);

const posts = readJson('posts.json').map((item) => contentRecord(item, 'post'));
const pages = readJson('pages.json').map((item) => contentRecord(item, 'page'));
if (!pages.some((page) => page.template === 'homepage')) {
  pages.unshift({
    kind: 'page',
    slug: 'home',
    status: 'publish',
    enabled: true,
    template: 'homepage',
    title: { en: 'Yalla Together', ar: 'Yalla Together' },
    excerpt: {
      en: 'Gifts that do good and delight, curated through stories worth keeping.',
      ar: 'Gifts that do good and delight, curated through stories worth keeping.'
    },
    content: {
      en: '<p>Meaningful gifts, local makers, and pieces with a point of view.</p>',
      ar: '<p>Meaningful gifts, local makers, and pieces with a point of view.</p>'
    },
    seo: {
      title: { en: 'Yalla Together', ar: 'Yalla Together' },
      description: {
        en: 'your go-to resource for gifts that do good and delight',
        ar: 'your go-to resource for gifts that do good and delight'
      }
    },
    featuredImage: '',
    featuredImageAlt: { en: 'Yalla Together', ar: 'Yalla Together' },
    categories: [],
    publishedAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    menuOrder: 0,
    importedAt: new Date()
  });
}
const categoriesBySlug = new Map();
for (const item of [...readJson('categories.json'), ...readJson('tags.json')]) {
  const record = termRecord(item, 'category');
  if (!categoriesBySlug.has(record.slug)) categoriesBySlug.set(record.slug, record);
}
const categories = Array.from(categoriesBySlug.values());
const mediaIndex = readJson('media-index.json');
const media = Object.values(mediaIndex).map(mediaRecord);

await db.collection('settings').updateOne({ key: 'site' }, { $set: settings }, { upsert: true });

for (const item of [...posts, ...pages]) {
  await db.collection('content').updateOne({ kind: item.kind, slug: item.slug }, { $set: item }, { upsert: true });
}

await db.collection('taxonomies').deleteMany({ type: 'tag' });

for (const term of categories) {
  await db.collection('taxonomies').updateOne({ type: term.type, slug: term.slug }, { $set: term }, { upsert: true });
}

for (const item of media) {
  await db.collection('media').updateOne({ wordpressId: item.wordpressId }, { $set: item }, { upsert: true });
}

await db.collection('content').createIndex({ kind: 1, slug: 1 }, { unique: true });
await db.collection('taxonomies').createIndex({ type: 1, slug: 1 }, { unique: true });
await db.collection('settings').createIndex({ key: 1 }, { unique: true });

console.log(`Seeded ${posts.length} posts, ${pages.length} pages, ${categories.length} categories, ${media.length} media records into ${dbName}.`);
await client.close();
