import { CategoryTiles } from '@/components/CategoryTiles';
import { getTemplateField } from '@/lib/templateSchemas';

export function GiftFinderPageTemplate({ page, item }) {
  const heading = getTemplateField(page.fields, 'heading', item.lang, item.titleText);
  const intro = getTemplateField(page.fields, 'intro', item.lang, '');
  const image = getTemplateField(page.fields, 'image', item.lang, page.featuredImage);
  const body = getTemplateField(page.fields, 'body', item.lang, item.contentHtml);
  const showCategoryTiles = getTemplateField(page.fields, 'showCategoryTiles', item.lang, true);

  return (
    <article className="single-page page-template-gift-finder">
      <header className="single-header">
        {/* <p className="section-kicker">gift finder</p> */}
        <h1>{heading}</h1>
        {image && <img src={image} alt={item.imageAlt || heading} />}
      </header>
      {intro && <div className="content" dangerouslySetInnerHTML={{ __html: intro }} />}
      {showCategoryTiles && <CategoryTiles lang={item.lang} />}
      {body && <div className="content" dangerouslySetInnerHTML={{ __html: body }} />}
    </article>
  );
}
