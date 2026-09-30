import { notFound } from 'next/navigation';
import { getPostPreview, renderContentItem } from '@/lib/cms';
import { getRequestContext } from '@/lib/request';
import { getPostTemplateComponent } from '@/components/templates/posts/registry';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Unpublished post preview',
  robots: { index: false, follow: false, noarchive: true },
  referrer: 'no-referrer'
};

export default async function PreviewPage({ params, searchParams }) {
  const { token } = await params;
  const post = await getPostPreview(token);
  if (!post) notFound();
  const { settings, lang } = await getRequestContext(searchParams);
  const item = renderContentItem(post, lang);
  const Template = getPostTemplateComponent(item.template);
  return <Template post={post} item={item} settings={settings} lang={lang} isPreview />;
}
