export const PAGE_TEMPLATE_OPTIONS = [
  { value: 'homepage', label: 'Homepage' },
  { value: 'standard', label: 'Standard page' },
  { value: 'hero', label: 'Hero page' },
  { value: 'editorial', label: 'Editorial page' },
  { value: 'contact', label: 'Contact page' },
  { value: 'blog', label: 'Blog page' },
  { value: 'gift-finder', label: 'Gift Finder page' }
];

export const POST_TEMPLATE_OPTIONS = [
  { value: 'standard', label: 'Standard post' },
  { value: 'feature', label: 'Feature story' },
  { value: 'guide', label: 'Gift guide' },
  { value: 'minimal', label: 'Minimal post' }
];

export const PAGE_TEMPLATE_FIELDS = {
  homepage: [
    { name: 'heroKicker', label: 'Hero kicker', type: 'text', localized: true },
    { name: 'heroTitle', label: 'Hero title', type: 'text', localized: true },
    { name: 'heroSubtitle', label: 'Hero subtitle', type: 'textarea', localized: true },
    { name: 'heroImage', label: 'Hero image', type: 'image' },
    { name: 'primaryCtaLabel', label: 'Primary CTA label', type: 'text', localized: true },
    { name: 'primaryCtaHref', label: 'Primary CTA URL', type: 'text' },
    { name: 'secondaryCtaLabel', label: 'Secondary CTA label', type: 'text', localized: true },
    { name: 'secondaryCtaHref', label: 'Secondary CTA URL', type: 'text' },
    { name: 'introContent', label: 'Intro content', type: 'richtext', localized: true },
    { name: 'showCategories', label: 'Show categories', type: 'boolean', defaultValue: true },
    { name: 'showLatestPosts', label: 'Show latest posts', type: 'boolean', defaultValue: true },
    { name: 'showInstagramFeed', label: 'Show Instagram feed', type: 'boolean', defaultValue: false },
    { name: 'latestKicker', label: 'Latest posts label', type: 'text', localized: true },
    { name: 'latestPostCount', label: 'Latest posts count', type: 'text' },
    { name: 'contactTitle', label: 'Contact CTA title', type: 'text', localized: true },
    { name: 'contactText', label: 'Contact CTA text', type: 'textarea', localized: true },
    { name: 'contactCtaLabel', label: 'Contact CTA label', type: 'text', localized: true },
    { name: 'contactCtaHref', label: 'Contact CTA URL', type: 'text' }
  ],
  standard: [
    { name: 'heading', label: 'Heading', type: 'text', localized: true },
    { name: 'featuredImage', label: 'Featured image', type: 'image' },
    { name: 'body', label: 'Body', type: 'richtext', localized: true }
  ],
  hero: [
    { name: 'kicker', label: 'Kicker', type: 'text', localized: true },
    { name: 'headline', label: 'Headline', type: 'text', localized: true },
    { name: 'subheadline', label: 'Subheadline', type: 'textarea', localized: true },
    { name: 'heroImage', label: 'Hero image', type: 'image' },
    { name: 'body', label: 'Body', type: 'richtext', localized: true }
  ],
  editorial: [
    { name: 'kicker', label: 'Kicker', type: 'text', localized: true },
    { name: 'headline', label: 'Headline', type: 'text', localized: true },
    { name: 'deck', label: 'Deck', type: 'textarea', localized: true },
    { name: 'heroImage', label: 'Hero image', type: 'image' },
    { name: 'body', label: 'Body', type: 'richtext', localized: true }
  ],
  contact: [
    { name: 'heading', label: 'Heading', type: 'text', localized: true },
    { name: 'intro', label: 'Intro', type: 'richtext', localized: true },
    { name: 'contactEmail', label: 'Contact email', type: 'text' },
    { name: 'image', label: 'Image', type: 'image' }
  ],
  blog: [
    { name: 'heading', label: 'Heading', type: 'text', localized: true },
    { name: 'intro', label: 'Intro', type: 'richtext', localized: true },
    { name: 'image', label: 'Image', type: 'image' },
    { name: 'body', label: 'Body', type: 'richtext', localized: true }
  ],
  'gift-finder': [
    { name: 'heading', label: 'Heading', type: 'text', localized: true },
    { name: 'intro', label: 'Intro', type: 'richtext', localized: true },
    { name: 'image', label: 'Image', type: 'image' },
    { name: 'showCategoryTiles', label: 'Show category tiles', type: 'boolean', defaultValue: true },
    { name: 'body', label: 'Body', type: 'richtext', localized: true }
  ]
};

export const POST_TEMPLATE_FIELDS = {
  standard: [
    { name: 'kicker', label: 'Kicker', type: 'text', localized: true },
    { name: 'headline', label: 'Headline', type: 'text', localized: true },
    { name: 'heroImage', label: 'Hero image', type: 'image' },
    { name: 'body', label: 'Body', type: 'richtext', localized: true }
  ],
  feature: [
    { name: 'kicker', label: 'Kicker', type: 'text', localized: true },
    { name: 'headline', label: 'Headline', type: 'text', localized: true },
    { name: 'deck', label: 'Deck', type: 'textarea', localized: true },
    { name: 'heroImage', label: 'Hero image', type: 'image' },
    { name: 'body', label: 'Body', type: 'richtext', localized: true }
  ],
  guide: [
    { name: 'kicker', label: 'Kicker', type: 'text', localized: true },
    { name: 'headline', label: 'Headline', type: 'text', localized: true },
    { name: 'intro', label: 'Intro', type: 'richtext', localized: true },
    { name: 'heroImage', label: 'Hero image', type: 'image' },
    { name: 'body', label: 'Body', type: 'richtext', localized: true }
  ],
  minimal: [
    { name: 'headline', label: 'Headline', type: 'text', localized: true },
    { name: 'body', label: 'Body', type: 'richtext', localized: true }
  ]
};

export function getSchema(kind, template) {
  return kind === 'post'
    ? POST_TEMPLATE_FIELDS[template] || POST_TEMPLATE_FIELDS.standard
    : PAGE_TEMPLATE_FIELDS[template] || PAGE_TEMPLATE_FIELDS.standard;
}

export function getTemplateField(fields = {}, name, lang = 'en', fallback = '') {
  const value = fields?.[name];
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if (Object.prototype.hasOwnProperty.call(value, lang)) return value[lang];
    if (Object.prototype.hasOwnProperty.call(value, 'en')) return value.en;
    return fallback;
  }
  if (value === '') return fallback;
  return value ?? fallback;
}

export function getPageTemplateChrome(page, item, lang, defaults = {}) {
  const template = item?.template || page?.template || 'standard';
  const fields = page?.fields || {};
  const title = item?.titleText || defaults.heading || '';
  const excerpt = item?.excerptText || '';
  const content = item?.contentHtml || '';

  if (template === 'hero') {
    return {
      kicker: getTemplateField(fields, 'kicker', lang, defaults.kicker || 'page'),
      heading: getTemplateField(fields, 'headline', lang, title),
      intro: getTemplateField(fields, 'subheadline', lang, excerpt),
      image: getTemplateField(fields, 'heroImage', lang, page?.featuredImage || ''),
      body: getTemplateField(fields, 'body', lang, content)
    };
  }

  if (template === 'editorial') {
    return {
      kicker: getTemplateField(fields, 'kicker', lang, defaults.kicker || 'editorial'),
      heading: getTemplateField(fields, 'headline', lang, title),
      intro: getTemplateField(fields, 'deck', lang, excerpt),
      image: getTemplateField(fields, 'heroImage', lang, page?.featuredImage || ''),
      body: getTemplateField(fields, 'body', lang, content)
    };
  }

  if (template === 'contact') {
    return {
      kicker: defaults.kicker || 'contact',
      heading: getTemplateField(fields, 'heading', lang, title),
      intro: getTemplateField(fields, 'intro', lang, content),
      image: getTemplateField(fields, 'image', lang, page?.featuredImage || ''),
      body: ''
    };
  }

  if (template === 'gift-finder') {
    return {
      kicker: defaults.kicker || 'gift finder',
      heading: getTemplateField(fields, 'heading', lang, title || defaults.heading || 'Gift Finder'),
      intro: getTemplateField(fields, 'intro', lang, ''),
      image: getTemplateField(fields, 'image', lang, page?.featuredImage || ''),
      body: getTemplateField(fields, 'body', lang, content),
      showCategoryTiles: getTemplateField(fields, 'showCategoryTiles', lang, true)
    };
  }

  if (template === 'blog') {
    return {
      kicker: defaults.kicker || 'blog',
      heading: getTemplateField(fields, 'heading', lang, title || defaults.heading || 'Blog'),
      intro: getTemplateField(fields, 'intro', lang, content),
      image: getTemplateField(fields, 'image', lang, page?.featuredImage || ''),
      body: getTemplateField(fields, 'body', lang, '')
    };
  }

  return {
    kicker: defaults.kicker || 'page',
    heading: getTemplateField(fields, 'heading', lang, title || defaults.heading || ''),
    intro: '',
    image: getTemplateField(fields, 'featuredImage', lang, page?.featuredImage || ''),
    body: getTemplateField(fields, 'body', lang, content)
  };
}
