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
    { name: 'showCategories', label: 'Show categories', type: 'boolean' },
    { name: 'showLatestPosts', label: 'Show latest posts', type: 'boolean' },
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
  'gift-finder': [
    { name: 'heading', label: 'Heading', type: 'text', localized: true },
    { name: 'intro', label: 'Intro', type: 'richtext', localized: true },
    { name: 'image', label: 'Image', type: 'image' },
    { name: 'showCategoryTiles', label: 'Show category tiles', type: 'boolean' },
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
    return value[lang] || value.en || fallback;
  }
  if (value === '') return fallback;
  return value ?? fallback;
}
