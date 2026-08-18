import Link from 'next/link';
import { HomepageCategoryCarousel } from '@/components/HomepageCategoryCarousel';
import { getTaxonomyTiles, localizedHref } from '@/lib/cms';

export async function HomepageCategoryTiles({ lang }) {
  const tiles = await getTaxonomyTiles(lang);

  return (
    <section className="category-band homepage-category-band" aria-labelledby="homepage-categories-title">
      <div className="doubleCol">
        <div className="leftCol">
          <p className="section-kicker">categories</p>
          <h2 id="homepage-categories-title">Find gifts by story, person, and moment</h2>
          <p>
            Explore thoughtful gifts for every person, story, and special moment.
            From meaningful keepsakes to unforgettable surprises, find something
            made to be remembered.
          </p>
          <Link href={localizedHref('/gift-finder/', lang)} className="post-card-readmore">Explore Gift Finder</Link>
        </div>
        <HomepageCategoryCarousel tiles={tiles} />
      </div>
    </section>
  );
}
