import { ObjectId } from 'mongodb';
import { PAGE_TEMPLATE_OPTIONS, POST_TEMPLATE_OPTIONS } from '@/lib/templateSchemas';
import {
  cleanContent,
  decodeHtml,
  formatDate,
  getCategories as getJsonCategories,
  getFeaturedImage,
  getPages as getJsonPages,
  getPosts as getJsonPosts,
  getSite as getJsonSite
} from '@/lib/data';
import { getDb, hasMongoConfig } from '@/lib/mongo';
import { resolveSeoTemplate } from '@/lib/seoVariables';
import { getEffectivePageTemplate } from '@/lib/templateSchemas';

export const SUPPORTED_LANGUAGES = ['en', 'ar'];

export const PAGE_TEMPLATES = PAGE_TEMPLATE_OPTIONS;
export const POST_TEMPLATES = POST_TEMPLATE_OPTIONS;

export const defaultSettings = {
  key: 'site',
  siteName: 'Yalla Together',
  description: 'your go-to resource for gifts that do good and delight',
  email: 'hello@yallatogether.com',
  instagramUrl: 'https://www.instagram.com/yallatogether/',
  facebookUrl: '',
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
  }
};

export function localize(value, lang) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[lang] || value.en || '';
  }
  return value || '';
}

export function normalizeLang(lang, settings = defaultSettings) {
  const requested = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'en';
  return settings.languages?.[requested]?.enabled ? requested : 'en';
}

export function localizedHref(href, lang) {
  if (lang === 'en') return href;
  return `${href}${href.includes('?') ? '&' : '?'}lang=${lang}`;
}

export function getEnabledMenu(settings, lang) {
  return (settings.navigation || [])
    .filter((item) => item.enabled !== false)
    .filter((item) => !item.feature || settings.features?.[item.feature] !== false)
    .map((item) => ({
      href: localizedHref(item.href, lang),
      label: localize(item.label, lang)
    }));
}

function jsonContentRecord(item, kind) {
  const title = decodeHtml(item.title);
  const excerpt = decodeHtml(item.excerpt || '');
  const content = cleanContent(item.content?.transformed || item.content?.rendered || '');

  return {
    wordpressId: item.wordpressId,
    kind,
    slug: item.slug,
    status: item.status || 'publish',
    enabled: true,
    title: { en: title, ar: title },
    excerpt: { en: excerpt, ar: excerpt },
    content: { en: content, ar: content },
    seo: {
      title: { en: decodeHtml(item.seo?.title || title), ar: decodeHtml(item.seo?.title || title) },
      description: { en: decodeHtml(item.seo?.description || excerpt), ar: decodeHtml(item.seo?.description || excerpt) }
    },
    featuredImage: item.featuredImage ? getFeaturedImage(item) : '',
    featuredImageAlt: { en: item.featuredImage?.alt || title, ar: item.featuredImage?.alt || title },
    template: kind === 'page' ? (item.template?.replace(/^page_|\.[^.]+$/g, '') || 'standard') : 'standard',
    categories: item.categories || [],
    publishedAt: item.publishedAt,
    modifiedAt: item.modifiedAt,
    menuOrder: item.menuOrder || 0
  };
}

function jsonTermRecord(term, type) {
  return {
    wordpressId: term.id || term.wordpressId,
    type,
    slug: term.slug,
    enabled: true,
    name: { en: decodeHtml(term.name), ar: decodeHtml(term.name) },
    description: { en: decodeHtml(term.description || ''), ar: decodeHtml(term.description || '') },
    featuredImage: term.featuredImage || '',
    featuredImageAlt: { en: decodeHtml(term.name), ar: decodeHtml(term.name) },
    parentId: term.parent || term.parentId || 0,
    count: term.count || 0
  };
}

export async function getSettings() {
  if (!hasMongoConfig()) {
    const site = getJsonSite();
    return {
      ...defaultSettings,
      siteName: site.name || defaultSettings.siteName,
      description: site.description || defaultSettings.description
    };
  }

  const db = await getDb();
  const settings = await db.collection('settings').findOne({ key: 'site' });
  return { ...defaultSettings, ...(settings || {}) };
}

async function collectionOrFallback(collection, fallback) {
  if (!hasMongoConfig()) return fallback();
  const db = await getDb();
  return db.collection(collection);
}

export async function getContentList(kind, options = {}) {
  const { includeDisabled = false } = options;
  const fallback = () => (kind === 'post' ? getJsonPosts() : getJsonPages()).map((item) => jsonContentRecord(item, kind));
  const collection = await collectionOrFallback('content', fallback);
  if (Array.isArray(collection)) return collection;

  const query = { kind };
  if (!includeDisabled) query.enabled = { $ne: false };
  return collection.find(query).sort({ publishedAt: -1, menuOrder: 1 }).toArray();
}

export async function getContentBySlug(kind, slug, options = {}) {
  const items = await getContentList(kind, options);
  return items.find((item) => item.slug === slug);
}

export async function getAnyContentBySlug(slug, options = {}) {
  const post = (await getContentList('post', options)).find((item) => item.slug === slug);
  if (post) return post;
  return (await getContentList('page', options)).find((item) => item.slug === slug);
}

export async function getHomepage() {
  const pages = await getContentList('page');
  return pages.find((page) => page.template === 'homepage') || pages.find((page) => page.slug === 'home');
}

export async function getTerms(type, options = {}) {
  const { includeDisabled = false } = options;
  const fallback = () => (type === 'category' ? getJsonCategories() : []).map((term) => jsonTermRecord(term, type));
  const collection = await collectionOrFallback('taxonomies', fallback);
  if (Array.isArray(collection)) return collection;

  const query = { type };
  if (!includeDisabled) query.enabled = { $ne: false };
  return collection.find(query).sort({ parentId: 1, slug: 1 }).toArray();
}

export async function getMediaList(options = {}) {
  const { includeDisabled = false } = options;
  const fallback = () => [];
  const collection = await collectionOrFallback('media', fallback);
  if (Array.isArray(collection)) return collection;

  const query = {};
  if (!includeDisabled) query.enabled = { $ne: false };
  return collection.find(query).sort({ slug: 1 }).toArray();
}

export async function getTermBySlug(type, slug) {
  return (await getTerms(type)).find((term) => term.slug === slug);
}

export async function getPostsByTerm(type, termId) {
  if (type !== 'category') return [];
  return (await getContentList('post')).filter((post) => (post.categories || []).includes(termId));
}

export async function getPostsByCategoryTree(category) {
  const categories = await getTerms('category');
  const rootId = category.wordpressId || category.id;
  const childIds = categories
    .filter((term) => String(getTermParentId(term)) === String(rootId))
    .map((term) => term.wordpressId || term.id)
    .filter(Boolean);
  const ids = new Set([rootId, ...childIds].filter(Boolean).map(String));
  return (await getContentList('post')).filter((post) => (post.categories || []).some((categoryId) => ids.has(String(categoryId))));
}

function getTermParentId(category) {
  return category.parentId || category.parent || 0;
}

function getTermImage(category) {
  return category.featuredImage || category.image || category.localPath || '';
}

export function groupCategories(categories, lang) {
  const enabled = categories.filter((category) => category.enabled !== false);
  const byId = new Map(enabled.map((category) => [String(category.wordpressId || category.id), category]));
  const childrenByParent = new Map();

  for (const category of enabled) {
    const parentId = getTermParentId(category) ? String(getTermParentId(category)) : '';
    if (!parentId || !byId.has(parentId)) continue;
    if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, []);
    childrenByParent.get(parentId).push(category);
  }

  return enabled
    .filter((category) => {
      const parentId = getTermParentId(category) ? String(getTermParentId(category)) : '';
      return !parentId || !byId.has(parentId);
    })
    .map((parent) => {
      const id = parent.wordpressId || parent.id;
      const children = (childrenByParent.get(String(id)) || []).sort((a, b) => localize(a.name, lang).localeCompare(localize(b.name, lang)));
      const childIds = children.map((child) => child.wordpressId || child.id).filter(Boolean);
      const count = children.reduce((sum, child) => sum + (child.count || 0), parent.count || 0);
      return {
        id,
        slug: parent.slug,
        name: localize(parent.name, lang),
        href: localizedHref(`/category/${parent.slug}/`, lang),
        image: getTermImage(parent),
        imageAlt: localize(parent.featuredImageAlt, lang) || localize(parent.name, lang),
        count,
        matchIds: [id, ...childIds].filter(Boolean),
        children: children.map((child) => ({
          id: child.wordpressId || child.id,
          slug: child.slug,
          name: localize(child.name, lang),
          href: localizedHref(`/category/${child.slug}/`, lang),
          image: getTermImage(child),
          imageAlt: localize(child.featuredImageAlt, lang) || localize(child.name, lang),
          count: child.count || 0,
          matchIds: [child.wordpressId || child.id].filter(Boolean)
        }))
      };
    })
    .filter((group) => group.id && group.name)
    .sort((a, b) => a.name.localeCompare(b.name));
}

const defaultCategoryImages = {
  'the-gift-finder': '/media/category-icons/the-gift-finder.png',
  'by-recipient': '/media/category-icons/by-recipient.png',
  'by-interest': '/media/category-icons/by-interest.png',
  'by-occasion': '/media/category-icons/by-occasion.png',
  'by-budget': '/media/category-icons/by-budget.png',
  'by-meaning': '/media/category-icons/by-meaning.png',
  'signature-edits': '/media/category-icons/signature-edits.png',
  'the-journal': '/media/category-icons/the-journal.png',
  'the-paper-edit': '/media/category-icons/the-paper-edit.png'
};

export async function getTaxonomyTiles(lang) {
  const categories = await getTerms('category');
  const parentIds = new Set(
    categories
      .filter((category) => !getTermParentId(category))
      .map((category) => String(category.wordpressId || category.id))
  );

  return groupCategories(categories, lang)
    .filter((group) => parentIds.has(String(group.id)))
    .map((group) => ({
      title: group.name,
      slug: group.slug,
      href: group.href,
      image: group.image || defaultCategoryImages[group.slug] || defaultCategoryImages['the-gift-finder'],
      imageAlt: group.imageAlt || group.name,
      count: group.count,
      terms: group.children.slice(0, 3).map((term) => term.name)
    }));
}

export function renderContentItem(item, lang) {
  const titleText = localize(item.title, lang);
  const excerptText = localize(item.excerpt, lang);
  const rawSeoTitle = localize(item.seo?.title, lang);
  return {
    ...item,
    lang,
    titleText,
    excerptText,
    contentHtml: localize(item.content, lang),
    seoTitle: resolveSeoTemplate(rawSeoTitle, item, lang),
    seoDescription: localize(item.seo?.description, lang),
    imageAlt: localize(item.featuredImageAlt, lang),
    template: item.kind === 'page' ? getEffectivePageTemplate(item) : item.template || 'standard',
    dateText: item.publishedAt ? formatDate(item.publishedAt) : ''
  };
}

export async function saveSettings(payload) {
  const db = await getDb();
  const current = await db.collection('settings').findOne({ key: 'site' });
  const nextSettings = { ...defaultSettings, ...(current || {}), ...payload, key: 'site', updatedAt: new Date() };
  delete nextSettings._id;
  await db.collection('settings').updateOne({ key: 'site' }, { $set: nextSettings }, { upsert: true });
  return nextSettings;
}

export async function saveContent(id, payload) {
  const db = await getDb();
  const update = { ...payload, updatedAt: new Date() };

  if (id && ObjectId.isValid(id)) {
    const _id = new ObjectId(id);
    await db.collection('content').updateOne({ _id }, { $set: update });
    return db.collection('content').findOne({ _id });
  }

  const result = await db.collection('content').insertOne({ ...update, createdAt: new Date() });
  return db.collection('content').findOne({ _id: result.insertedId });
}

function cleanDocumentForSave(item) {
  const next = { ...item };
  delete next._id;
  next.updatedAt = new Date();
  return next;
}

export async function saveContentCollection(items) {
  const db = await getDb();
  for (const item of items) {
    const id = item._id;
    const update = cleanDocumentForSave(item);
    if (id && ObjectId.isValid(id)) {
      await db.collection('content').updateOne({ _id: new ObjectId(id) }, { $set: update });
    } else {
      await db.collection('content').updateOne(
        { kind: update.kind, slug: update.slug },
        { $set: update },
        { upsert: true }
      );
    }
  }
  return getContentList('post', { includeDisabled: true });
}

export async function deleteContentItem({ id, kind, slug }) {
  const db = await getDb();
  if (id && ObjectId.isValid(id)) {
    await db.collection('content').deleteOne({ _id: new ObjectId(id) });
    return;
  }

  if (kind && slug) {
    await db.collection('content').deleteOne({ kind, slug });
  }
}

export async function deleteTermItem({ id, type, slug }) {
  const db = await getDb();
  if (id && ObjectId.isValid(id)) {
    await db.collection('taxonomies').deleteOne({ _id: new ObjectId(id) });
    return;
  }

  if (type && slug) {
    await db.collection('taxonomies').deleteOne({ type, slug });
  }
}

export async function saveTermsCollection(items) {
  const db = await getDb();
  for (const item of items) {
    const update = cleanDocumentForSave(item);
    await db.collection('taxonomies').updateOne(
      { type: update.type, slug: update.slug },
      { $set: update },
      { upsert: true }
    );
  }
  return db.collection('taxonomies').find({}).sort({ type: 1, slug: 1 }).toArray();
}

export async function saveMediaCollection(items) {
  const db = await getDb();
  for (const item of items) {
    const update = cleanDocumentForSave(item);
    await db.collection('media').updateOne(
      { wordpressId: update.wordpressId || update.localPath || update.sourceUrl },
      { $set: update },
      { upsert: true }
    );
  }
  return getMediaList({ includeDisabled: true });
}

export function adminSerialize(value) {
  return JSON.stringify(value, null, 2);
}
