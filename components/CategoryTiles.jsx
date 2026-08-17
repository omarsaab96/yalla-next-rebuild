import Link from 'next/link';
import { getTaxonomyTiles, localizedHref } from '@/lib/cms';

export async function CategoryTiles({ lang }) {
  const tiles = await getTaxonomyTiles(lang);

  return (
    <section className="category-band" aria-labelledby="categories-title">
      <p className="section-kicker">categories</p>
      <h2 id="categories-title">Find gifts by story, person, and moment</h2>
      <div className="category-grid">
        {tiles.map((tile) => (
          <Link className={`category-tile${tile.image ? ' has-image' : ''}`} href={tile.href} key={tile.title}>
            {tile.image && <img src={tile.image} alt={tile.imageAlt || tile.title} />}
            <span>{tile.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export async function HomepageCategoryTiles({ lang }) {
  const tiles = await getTaxonomyTiles(lang);

  return (
    <section className="category-band homepage-category-band" aria-labelledby="homepage-categories-title">
      <div className='doubleCol'>
        <div className='leftCol'>
          <p className="section-kicker">categories</p>
          <h2 id="homepage-categories-title">Find gifts by story, person, and moment</h2>
          <p>
            Explore thoughtful gifts for every person, story, and special moment.
            From meaningful keepsakes to unforgettable surprises, find something
            made to be remembered.
          </p>
          <Link href={localizedHref('/gift-finder/', lang)} className="post-card-readmore">Explore Gift Finder</Link>
        </div>
        <div className="category-grid">
          {tiles.map((tile) => (
            <Link className={`category-tile${tile.image ? ' has-image' : ''}`} href={tile.href} key={tile.title}>
              {tile.image && <img src={tile.image} alt={tile.imageAlt || tile.title} />}
              <span>{tile.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
