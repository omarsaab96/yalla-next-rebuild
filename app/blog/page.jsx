import { notFound } from 'next/navigation';
import { PostCard } from '@/components/PostCard';
import { getContentList } from '@/lib/cms';
import { getRequestContext } from '@/lib/request';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Blog',
  description: 'Gift guides, maker stories, and meaningful finds from Yalla Together.'
};

export default async function BlogPage({ searchParams }) {
  const { settings, lang } = await getRequestContext(searchParams);
  if (settings.features.blog === false) notFound();
  const posts = await getContentList('post');

  return (
    <section className="archive-page">
      <p className="section-kicker">blog</p>
      <h1>Stories worth gifting</h1>
      <div className="archive-grid">
        {posts.map((post) => <PostCard key={post._id?.toString() || post.wordpressId} post={post} lang={lang} />)}
      </div>
    </section>
  );
}
