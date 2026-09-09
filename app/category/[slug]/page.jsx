import { t } from '@/lib/i18n';
import { notFound } from 'next/navigation';
import { PostCard } from '@/components/PostCard';
import { getPostsByCategoryTree, getTermBySlug, localize, localizedHref } from '@/lib/cms';
import { getRequestContext } from '@/lib/request';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }) {
  const { lang } = await getRequestContext(searchParams);
  const { slug } = await params;
  const category = await getTermBySlug('category', slug);
  if (!category) return {};
  return {
    title: localize(category.name, lang),
    description: localize(category.description, lang) || `Yalla Together posts in ${localize(category.name, lang)}`
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
    <>
      <header className="archive-header">
        <div className='headerContent'>
          {category.featuredImage && (
            <img
              className='categoryImage categoryPattern'
              src={category.featuredImage}
              alt={localize(category.featuredImageAlt, lang) || localize(category.name, lang)}
            />
          )}

          <div className="backbtn">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="#d49d20"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <Link
              href={localizedHref("/gift-finder/", lang)}
              className="section-kicker"
            >
              {t('All categories', lang)}
            </Link>
          </div>

          <div>
            {/* <p className="section-kicker">category</p> */}
            <h1>{localize(category.name, lang)}</h1>
          </div>
        </div>

        <div></div>

      </header>

      <section className="archive-page">
        <div className="archive-grid">
          {posts.map((post) => <PostCard key={post._id?.toString() || post.wordpressId} post={post} lang={lang} />)}
        </div>
      </section>
    </>
  );
}
