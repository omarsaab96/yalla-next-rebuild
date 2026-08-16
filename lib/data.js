import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
}

export function decodeHtml(value = '') {
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

export function getSite() {
  return readJson('site.json');
}

export function getPosts() {
  return readJson('posts.json').sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

export function getPages() {
  return readJson('pages.json');
}

export function getCategories() {
  return readJson('categories.json');
}

export function getMenuItems() {
  return [
    { label: 'Gift Finder', href: '/gift-finder/' },
    { label: 'Blog', href: '/blog/' },
    { label: 'About', href: '/about/' },
    { label: 'Services', href: '/services/' },
    { label: 'Contact', href: '/contact/' }
  ];
}

export function getPostBySlug(slug) {
  return getPosts().find((post) => post.slug === slug);
}

export function getPageBySlug(slug) {
  return getPages().find((page) => page.slug === slug);
}

export function getCategoryBySlug(slug) {
  return getCategories().find((category) => category.slug === slug);
}

export function getPostsByCategory(categoryId) {
  return getPosts().filter((post) => post.categories.includes(categoryId));
}


export function getFeaturedImage(post) {
  const localPath = post?.featuredImage?.localPath;
  return localPath ? `/${localPath}` : '/media/2025/12/Yalla-Together-Logo-Header.jpg';
}

export function getHeroPost() {
  return getPosts()[0];
}

export function getTaxonomyTiles() {
  const groups = [
    ['By Recipient', 'by_recipient.json', '/category/by-recipient/'],
    ['By Interest', 'by_interest.json', '/category/by-interest/'],
    ['By Occasion', 'by_occasion.json', '/category/by-occasion/'],
    ['By Budget', 'by_budget.json', '/category/by-budget/'],
    ['By Meaning', 'by_meaning.json', '/category/by-meaning/'],
    ['Signature Edits', 'signature_edits.json', '/category/signature-edits/']
  ];

  return groups.map(([title, file, href]) => {
    const terms = readJson(file).filter((term) => term.count > 0);
    return {
      title,
      href,
      count: terms.reduce((sum, term) => sum + term.count, 0),
      terms: terms.slice(0, 3).map((term) => term.name)
    };
  });
}

export function cleanContent(html = '') {
  return String(html)
    .replace(/https:\/\/yallatogether\.com/g, '')
    .replace(/srcset="[^"]*"/g, '')
    .replace(/\sdata-recalc-dims="[^"]*"/g, '')
    .replace(/\sloading="lazy"/g, '')
    .replace(/\sdecoding="async"/g, '');
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(value));
}
