import { notFound } from 'next/navigation';
import { GiftFinder } from '@/components/GiftFinder';
import { getContentBySlug, getContentList, getTerms, groupCategories, renderContentItem } from '@/lib/cms';
import { getRequestContext } from '@/lib/request';
import { getPageTemplateChrome } from '@/lib/templateSchemas';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const page = await getContentBySlug('page', 'blog');
  if (!page) {
    return {
      title: 'Blog',
      description: 'Gift guides, maker stories, and meaningful finds from Yalla Together.'
    };
  }
  const item = renderContentItem(page, 'en');
  return {
    title: item.seoTitle || item.titleText,
    description: item.seoDescription || item.excerptText
  };
}

export default async function BlogPage({ searchParams }) {
  const { settings, lang } = await getRequestContext(searchParams);
  if (settings.features.blog === false) notFound();
  const page = await getContentBySlug('page', 'blog');
  const item = page ? renderContentItem(page, lang) : null;
  const chrome = getPageTemplateChrome(page, item, lang, {
    kicker: 'blog',
    heading: 'Stories worth gifting'
  });
  const posts = await getContentList('post');
  const categories = settings.features.categories === false ? [] : await getTerms('category');
  const blogPosts = posts.map((post) => {
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
  const blogCategories = groupCategories(categories, lang)
    .map((group) => ({
      ...group,
      children: group.children.filter((child) => child.count > 0)
    }))
    .filter((group) => group.count > 0 || group.children.length > 0);

  return (
    <GiftFinder
      kicker={chrome.kicker}
      heading={chrome.heading}
      intro={chrome.intro}
      image={chrome.image}
      imageAlt={item?.imageAlt || chrome.heading}
      body={chrome.body}
      posts={blogPosts}
      categories={blogCategories}
      searchPlaceholder="Search stories, guides, occasions"
      filterTitle="Topics"
      emptyMessage="No stories match these filters."
    />
  );
}
