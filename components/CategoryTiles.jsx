import { t } from '@/lib/i18n';
import Link from 'next/link';
import { getTaxonomyTiles } from '@/lib/cms';

export async function CategoryTiles({
  lang,
  kicker = 'categories',
  title = 'Find gifts by story, person, and moment',
  intro = ''
}) {
  const tiles = await getTaxonomyTiles(lang);

  return (
    <section className="category-band" aria-labelledby="categories-title">
      {kicker && <p className="section-kicker">{t(kicker, lang)}</p>}
      <h2 id="categories-title">{t(title, lang)}</h2>
      {intro && <p>{t(intro, lang)}</p>}
      <div className="category-grid">
        {tiles.map((tile) => (
          <Link className="category-tile" href={tile.href} key={tile.title}>
            <img className="category-illustration" src={tile.image} alt={tile.imageAlt || tile.title} />
            <span>{tile.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
