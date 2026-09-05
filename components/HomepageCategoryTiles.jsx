import Link from 'next/link';
import { HomepageCategoryCarousel } from '@/components/HomepageCategoryCarousel';
import { getTaxonomyTiles, localizedHref } from '@/lib/cms';

export async function HomepageCategoryTiles({
  lang,
  kicker = 'categories',
  title = 'Let the gift complete the story',
  intro = 'Explore thoughtful gifts for every person, story, and special moment. From meaningful keepsakes to unforgettable surprises, find something made to be remembered.',
  ctaLabel = 'Explore Gift Finder',
  ctaHref = '/gift-finder/'
}) {
  const tiles = await getTaxonomyTiles(lang);

  return (
    <section className="category-band homepage-category-band" aria-labelledby="homepage-categories-title">
      <div className="doubleCol">
        <div className="leftCol">
          {kicker && <p className="section-kicker">{kicker}</p>}
          <h2 id="homepage-categories-title">{title}</h2>
          {intro && <p>{intro}</p>}
          {ctaLabel && <Link href={localizedHref(ctaHref, lang)} className="post-card-readmore">{ctaLabel}</Link>}
        </div>
        <HomepageCategoryCarousel tiles={tiles} />
      </div>
    </section>
  );
}
