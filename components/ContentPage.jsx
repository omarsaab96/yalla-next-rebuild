import { notFound } from 'next/navigation';
import { getContentBySlug, renderContentItem } from '@/lib/cms';
import { getRequestContext } from '@/lib/request';
import { getPageTemplateComponent } from '@/components/templates/pages/registry';

export async function getContentPageMetadata(slug) {
  const page = await getContentBySlug('page', slug);
  if (!page) return {};
  const item = renderContentItem(page, 'en');

  return {
    title: item.seoTitle || item.titleText,
    description: item.seoDescription || item.excerptText
  };
}

export default async function ContentPage({ slug, searchParams }) {
  const { settings, lang } = await getRequestContext(searchParams);
  if (settings.features.pages === false) notFound();

  const page = await getContentBySlug('page', slug);
  if (!page) notFound();
  const item = renderContentItem(page, lang);
  const Template = getPageTemplateComponent(item.template);

  return <Template page={page} item={item} settings={settings} lang={lang} />;
}
