export function resolveSeoTemplate(template = '', item = {}, lang = 'en', settings = {}) {
  const localize = (value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) return value[lang] || value.en || '';
    return value || '';
  };
  const formatDate = (value) => {
    if (!value) return '';
    return new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(value));
  };
  const title = localize(item.title);
  const excerpt = localize(item.excerpt);
  const replacements = {
    '%%title%%': title,
    '%%page%%': item.pageNumber ? `Page ${item.pageNumber}` : '',
    '%%sitename%%': settings.siteName || 'Yalla Together',
    '%%sitedesc%%': settings.description || '',
    '%%sep%%': '-',
    '%%excerpt%%': excerpt,
    '%%date%%': formatDate(item.publishedAt),
    '%%slug%%': item.slug || '',
    '%%primary_category%%': item.primaryCategory || ''
  };

  const value = template || '%%title%% %%sep%% %%sitename%%';
  return Object.entries(replacements).reduce((current, [token, replacement]) => current.replaceAll(token, replacement), value)
    .replace(/\s+/g, ' ')
    .replace(/\s+-\s+$/, '')
    .replace(/^\s+-\s+/, '')
    .trim();
}
