import { GiftFinder } from '@/components/GiftFinder';
import { getContentBySlug, getContentList, getTerms, groupCategories, renderContentItem } from '@/lib/cms';
import { getRequestContext } from '@/lib/request';
import { getTemplateField } from '@/lib/templateSchemas';

export async function generateMetadata() {
  const page = await getContentBySlug('page', 'gift-finder');
  if (!page) return { title: 'Gift Finder' };
  const item = renderContentItem(page, 'en');
  return {
    title: item.seoTitle || item.titleText,
    description: item.seoDescription || item.excerptText
  };
}

export default async function GiftFinderPage({ searchParams }) {
  const { settings, lang } = await getRequestContext(searchParams);
  const page = await getContentBySlug('page', 'gift-finder');
  const item = page ? renderContentItem(page, lang) : null;
  const posts = settings.features.blog === false ? [] : await getContentList('post');
  const categories = settings.features.categories === false ? [] : await getTerms('category');

  const finderPosts = posts.map((post) => {
    const rendered = renderContentItem(post, lang);
    return {
      id: post._id?.toString() || String(post.wordpressId || post.slug),
      title: rendered.titleText,
      excerpt: rendered.excerptText.replace(/Read More.*/, '').slice(0, 170),
      href: `/${post.slug}/`,
      image: post.featuredImage || '',
      imageAlt: rendered.imageAlt,
      date: rendered.dateText,
      categories: post.categories || []
    };
  });

  const finderCategories = groupCategories(categories, lang)
    .map((group) => ({
      ...group,
      children: group.children.filter((child) => child.count > 0)
    }))
    .filter((group) => group.count > 0 || group.children.length > 0);

  return (
    <GiftFinder
      heading={page ? getTemplateField(page.fields, 'heading', lang, item.titleText) : 'Gift Finder'}
      intro={page ? getTemplateField(page.fields, 'intro', lang, '') : ''}
      posts={finderPosts}
      categories={finderCategories}
    />
  );
}
