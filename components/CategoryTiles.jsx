import Link from 'next/link';
import { getTaxonomyTiles } from '@/lib/cms';

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
