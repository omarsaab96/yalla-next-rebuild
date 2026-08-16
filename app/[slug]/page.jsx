import { notFound } from 'next/navigation';
import { getAnyContentBySlug, renderContentItem } from '@/lib/cms';
import { getRequestContext } from '@/lib/request';
import { getPageTemplateComponent } from '@/components/templates/pages/registry';
import { getPostTemplateComponent } from '@/components/templates/posts/registry';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const entry = await getAnyContentBySlug(slug);
  if (!entry) return {};
  const item = renderContentItem(entry, 'en');

  return {
    title: item.seoTitle || item.titleText,
    description: item.seoDescription || item.excerptText
  };
}

export default async function SlugPage({ params, searchParams }) {
  const { slug } = await params;
  const { settings, lang } = await getRequestContext(searchParams);
  const entry = await getAnyContentBySlug(slug);
  if (!entry) notFound();
  if (entry.kind === 'post' && settings.features.blog === false) notFound();
  if (entry.kind === 'page' && settings.features.pages === false) notFound();

  const item = renderContentItem(entry, lang);
  const Template = entry.kind === 'post' ? getPostTemplateComponent(item.template) : getPageTemplateComponent(item.template);

  return <Template page={entry} post={entry} item={item} settings={settings} lang={lang} />;
}
