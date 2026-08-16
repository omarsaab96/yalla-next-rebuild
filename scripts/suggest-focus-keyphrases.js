import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGODB_DB || 'yalla_together_cms';

const stopWords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'before', 'by', 'for', 'from', 'has', 'in', 'into', 'is', 'it', 'my', 'no',
  'of', 'on', 'or', 'that', 'the', 'their', 'this', 'to', 'with', 'who', 'will', 'your', 'yalla', 'together'
]);

const preferredPhrases = [
  ['valentine', 'Valentine gifts'],
  ['thoughtful presents', 'thoughtful gifts'],
  ['thoughtful gift', 'thoughtful gifts'],
  ['wont break the bank', 'affordable gifts'],
  ["won't break the bank", 'affordable gifts'],
  ['teacher', 'teacher gifts'],
  ['teachers', 'teacher gifts'],
  ['bride', 'bride gifts'],
  ['bridal', 'bridal gifts'],
  ['wedding', 'wedding gifts'],
  ['graduation', 'graduation gifts'],
  ['graduate', 'graduation gifts'],
  ['daughter', 'gifts for daughter'],
  ['son', 'gifts for son'],
  ['kids', 'gifts for kids'],
  ['children', 'gifts for kids'],
  ['halloween', 'Halloween gifts'],
  ['eid', 'Eid gifts'],
  ['summer', 'summer gifts'],
  ['coffee', 'gifts for coffee lovers'],
  ['printable', 'printable gifts'],
  ['local', 'local gifts'],
  ['impact', 'gifts with impact'],
  ['wellness', 'wellness gifts'],
  ['father', 'Father’s Day gifts'],
  ['mother', 'Mother’s Day gifts'],
  ['christmas', 'Christmas gifts'],
  ['diwali', 'Diwali gifts'],
  ['birthday', 'birthday gifts'],
  ['holiday', 'holiday gifts'],
  ['host', 'host gifts'],
  ['hostess', 'hostess gifts'],
  ['jewelry', 'jewelry gifts'],
  ['watch', 'watch gift'],
  ['letter', 'letter gifts'],
  ['keepsake', 'keepsake gifts']
];

const slugOverrides = new Map([
  ['a-graduation-letter-to-my-son-paired-with-a-d1-milano-watch', { en: 'graduation letter', ar: 'رسالة تخرج' }],
  ['a-meaningful-graduation-gift-for-a-daughter-a-letter-with-the-classic-bangle-cuff-from-usfuur', { en: 'graduation gift', ar: 'هدية تخرج' }],
  ['boo-tiful-treats-no-candy-halloween-gifts-kids-will-scream-for', { en: 'Halloween gifts', ar: 'هدايا الهالوين' }],
  ['free-printable-thank-you-card-for-teachers-during-online-learning', { en: 'thank you card', ar: 'بطاقة شكر' }],
  ['gentle-gifts-for-kids-who-need-to-unwind', { en: 'gentle gifts', ar: 'هدايا لطيفة' }],
  ['gifts-to-fuel-new-years-resolutions-2026', { en: 'New Year resolutions', ar: 'قرارات السنة الجديدة' }],
  ['gifts-with-impact-discover-locally-made-treasures-that-tell-a-story', { en: 'gifts with impact', ar: 'هدايا ذات أثر' }],
  ['holiday-edition-2025-babies-and-toddlers', { en: 'holiday gifts', ar: 'هدايا الأعياد' }],
  ['holiday-edition-2025-gifts-for-her', { en: 'holiday gifts for her', ar: 'هدايا الأعياد لها' }],
  ['holiday-edition-2025-gifts-for-him', { en: 'holiday gifts for him', ar: 'هدايا الأعياد له' }],
  ['holiday-edition-2025-kids', { en: 'holiday gifts for kids', ar: 'هدايا الأعياد للأطفال' }],
  ['holiday-edition-2025-tween-teen-boys', { en: 'holiday gifts for boys', ar: 'هدايا الأعياد للأولاد' }],
  ['holiday-edition-2025-tween-teen-girls', { en: 'holiday gifts for girls', ar: 'هدايا الأعياد للبنات' }],
  ['little-crescent-joys-thoughtful-ramadan-gift-ideas-for-kids', { en: 'Ramadan gift ideas', ar: 'أفكار هدايا رمضان' }],
  ['sustainable-eid-host-gifts-meaningful-gestures-for-eid-gatherings', { en: 'Eid host gifts', ar: 'هدايا ضيافة العيد' }],
  ['the-bride-who-has-everything-five-gifts-five-stories', { en: 'bride gifts', ar: 'هدايا للعروس' }],
  ['the-father-who-needs-nothing-and-deserves-everything', { en: 'father gifts', ar: 'هدايا للأب' }],
  ['the-may-mood-edit-thoughtful-gifts-for-the-season-before-summer', { en: 'thoughtful gifts', ar: 'هدايا مدروسة' }],
  ['the-yalla-summer-edit-six-pieces-to-gift-wear-love', { en: 'summer gifts', ar: 'هدايا الصيف' }],
  ['thoughtful-presents-that-wont-break-the-bank', { en: 'thoughtful presents', ar: 'هدايا مدروسة' }],
  ['valentine-gift-ideas-thoughtful-picks-for-friends-family-you', { en: 'Valentine gift ideas', ar: 'أفكار هدايا عيد الحب' }],
  ['wellness-and-self-care-diwali-gifts-the-glow-from-within', { en: 'Diwali gifts', ar: 'هدايا ديوالي' }]
]);

const arabicPhrases = new Map([
  ['teacher gifts', 'هدايا للمعلمين'],
  ['bride gifts', 'هدايا للعروس'],
  ['bridal gifts', 'هدايا للعروس'],
  ['wedding gifts', 'هدايا زفاف'],
  ['graduation gifts', 'هدايا تخرج'],
  ['gifts for daughter', 'هدايا للبنات'],
  ['gifts for son', 'هدايا للأبناء'],
  ['gifts for kids', 'هدايا للأطفال'],
  ['Halloween gifts', 'هدايا الهالوين'],
  ['Eid gifts', 'هدايا العيد'],
  ['summer gifts', 'هدايا الصيف'],
  ['gifts for coffee lovers', 'هدايا لمحبي القهوة'],
  ['printable gifts', 'هدايا قابلة للطباعة'],
  ['local gifts', 'هدايا محلية'],
  ['gifts with impact', 'هدايا ذات أثر'],
  ['wellness gifts', 'هدايا للعناية والراحة'],
  ['Father’s Day gifts', 'هدايا عيد الأب'],
  ['Mother’s Day gifts', 'هدايا عيد الأم'],
  ['Christmas gifts', 'هدايا الكريسماس'],
  ['Diwali gifts', 'هدايا ديوالي'],
  ['birthday gifts', 'هدايا عيد ميلاد'],
  ['host gifts', 'هدايا للمضيف'],
  ['hostess gifts', 'هدايا للمضيفة'],
  ['jewelry gifts', 'هدايا مجوهرات'],
  ['watch gift', 'هدية ساعة'],
  ['letter gifts', 'هدايا مع رسائل'],
  ['keepsake gifts', 'هدايا تذكارية'],
  ['meaningful gifts', 'هدايا ذات معنى'],
  ['Valentine gifts', 'هدايا عيد الحب'],
  ['thoughtful gifts', 'هدايا مدروسة'],
  ['affordable gifts', 'هدايا بأسعار مناسبة'],
  ['holiday gifts', 'هدايا الأعياد'],
]);

function normalizeText(value = '') {
  return value
    .toLowerCase()
    .replace(/&amp;/g, ' and ')
    .replace(/[^a-z0-9\s']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripHtml(value = '') {
  return value.replace(/<[^>]*>/g, ' ');
}

function pickFromPreferred(haystack) {
  const match = preferredPhrases.find(([, phrase]) => haystack.includes(normalizeText(phrase)));
  return match?.[1] || '';
}

function getWords(value) {
  return normalizeText(value)
    .split(' ')
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

function countOccurrences(haystack, phrase) {
  const escaped = normalizeText(phrase).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (haystack.match(new RegExp(`\\b${escaped}\\b`, 'g')) || []).length;
}

function getFirstParagraph(html = '') {
  return html.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i)?.[1] || stripHtml(html).slice(0, 300);
}

function candidatePhrases(title, slug) {
  const words = getWords(`${title} ${String(slug || '').replace(/-/g, ' ')}`);
  const candidates = new Set();

  for (let index = 0; index < words.length; index += 1) {
    for (const size of [3, 2]) {
      const phrase = words.slice(index, index + size);
      if (phrase.length === size) candidates.add(phrase.join(' '));
    }
  }

  for (const word of words) {
    if (word.length > 4) candidates.add(word);
  }

  return Array.from(candidates);
}

function scoreCandidate(candidate, data) {
  const phrase = normalizeText(candidate);
  if (!phrase) return -1;

  let score = 0;
  const wordCount = phrase.split(' ').length;
  score += wordCount === 2 ? 18 : wordCount === 3 ? 12 : 0;
  score += data.title.startsWith(phrase) ? 80 : 0;
  score += countOccurrences(data.title, phrase) * 45;
  score += countOccurrences(data.description, phrase) * 35;
  score += countOccurrences(data.intro, phrase) * 45;
  score += Math.min(countOccurrences(data.body, phrase), 8) * 8;
  score += phrase.includes('gift') ? 8 : 0;
  score -= phrase.length > 34 ? 20 : 0;

  return score;
}

function fallbackFromTitle(title) {
  const words = getWords(title);
  const giftIndex = words.findIndex((word) => word.startsWith('gift'));
  if (giftIndex > 0) return words.slice(Math.max(0, giftIndex - 2), giftIndex + 1).join(' ');
  return words.slice(0, 3).join(' ') || 'meaningful gifts';
}

function suggestEnglish(post) {
  if (slugOverrides.has(post.slug)) return slugOverrides.get(post.slug).en;
  const title = post.title?.en || post.slug || '';
  const description = post.seo?.description?.en || post.excerpt?.en || '';
  const bodyHtml = post.fields?.body?.en || post.content?.en || '';
  const data = {
    title: normalizeText(title),
    description: normalizeText(description),
    intro: normalizeText(getFirstParagraph(bodyHtml)),
    body: normalizeText(stripHtml(bodyHtml))
  };
  const candidates = candidatePhrases(title, post.slug)
    .map((phrase) => ({ phrase, score: scoreCandidate(phrase, data) }))
    .sort((a, b) => b.score - a.score);

  const best = candidates.find((candidate) => candidate.score >= 55)?.phrase;
  return best || pickFromPreferred(`${data.title} ${data.description} ${data.intro}`) || fallbackFromTitle(title);
}

function suggestArabic(english) {
  return arabicPhrases.get(english) || 'هدايا ذات معنى';
}

function suggestArabicForPost(post, english) {
  return slugOverrides.get(post.slug)?.ar || suggestArabic(english);
}

function shouldReplace(value) {
  return process.env.FORCE_SEO_KEYPHRASES === 'true' || !value || value.trim() === '';
}

const client = new MongoClient(uri);
await client.connect();
const db = client.db(dbName);

const posts = await db.collection('content').find({ kind: 'post' }).toArray();
let updated = 0;

for (const post of posts) {
  const en = suggestEnglish(post);
  const ar = suggestArabicForPost(post, en);
  const current = post.seo?.focusKeyphrase || {};
  const focusKeyphrase = {
    ...(current || {}),
    en: shouldReplace(current.en) ? en : current.en,
    ar: shouldReplace(current.ar) ? ar : current.ar
  };

  if (focusKeyphrase.en !== current.en || focusKeyphrase.ar !== current.ar) {
    await db.collection('content').updateOne(
      { _id: post._id },
      {
        $set: {
          'seo.focusKeyphrase': focusKeyphrase,
          updatedAt: new Date()
        }
      }
    );
    updated += 1;
    console.log(`${post.slug}: ${focusKeyphrase.en} / ${focusKeyphrase.ar}`);
  }
}

console.log(`Updated ${updated} of ${posts.length} posts.`);
await client.close();
