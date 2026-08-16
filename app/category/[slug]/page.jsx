import { notFound } from 'next/navigation';
import { PostCard } from '@/components/PostCard';
import { getPostsByCategoryTree, getTermBySlug, localize } from '@/lib/cms';
import { getRequestContext } from '@/lib/request';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getTermBySlug('category', slug);
  if (!category) return {};
  return {
    title: localize(category.name, 'en'),
    description: localize(category.description, 'en') || `Yalla Together posts in ${localize(category.name, 'en')}`
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const { settings, lang } = await getRequestContext(searchParams);
  if (settings.features.categories === false) notFound();

  const category = await getTermBySlug('category', slug);
  if (!category) notFound();
  const posts = settings.features.blog === false ? [] : await getPostsByCategoryTree(category);

  return (
    <section className="archive-page">
      <p className="section-kicker">category</p>
      <h1>{localize(category.name, lang)}</h1>
      <div className="archive-grid">
        {posts.map((post) => <PostCard key={post._id?.toString() || post.wordpressId} post={post} lang={lang} />)}
      </div>
    </section>
  );
}
