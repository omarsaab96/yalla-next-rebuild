import { t } from '@/lib/i18n';
import { CategoryTiles } from '@/components/CategoryTiles';
import { getPageTemplateComponent } from '@/components/templates/pages/registry';
import { getContentBySlug, renderContentItem } from '@/lib/cms';
import { getRequestContext } from '@/lib/request';

export async function generateMetadata({ searchParams }) {
  const { lang } = await getRequestContext(searchParams);
  const page = await getContentBySlug('page', 'gift-finder');
  if (!page) return { title: t('Gift Finder', lang) };
  const item = renderContentItem(page, lang);
  return {
    title: item.seoTitle || item.titleText,
    description: item.seoDescription || item.excerptText
  };
}

export default async function GiftFinderPage({ searchParams }) {
  const { settings, lang } = await getRequestContext(searchParams);
  const page = await getContentBySlug('page', 'gift-finder');
  const item = page ? renderContentItem(page, lang) : null;

  if (!page || !item) {
    return (
      <main className="gift-finder-page">
        <section className="finder-hero">
          <p className="section-kicker">{t('gift finder', lang)}</p>
          <h1>{t('Gift Finder', lang)}</h1>
        </section>
        {settings.features.categories !== false && <CategoryTiles lang={lang} />}
      </main>
    );
  }

  const template = item.template === 'homepage' ? 'standard' : item.template;
  const Template = getPageTemplateComponent(template);
  const templateIncludesCategories = template === 'gift-finder';

  return (
    <>
      <Template page={page} item={item} settings={settings} lang={lang} />
      {!templateIncludesCategories && settings.features.categories !== false && <CategoryTiles lang={lang} />}
    </>
  );
}
