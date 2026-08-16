import { getTemplateField } from '@/lib/templateSchemas';

export function EditorialPageTemplate({ page, item }) {
  const kicker = getTemplateField(page.fields, 'kicker', item.lang, 'editorial');
  const headline = getTemplateField(page.fields, 'headline', item.lang, item.titleText);
  const deck = getTemplateField(page.fields, 'deck', item.lang, item.excerptText);
  const image = getTemplateField(page.fields, 'heroImage', item.lang, page.featuredImage);
  const body = getTemplateField(page.fields, 'body', item.lang, item.contentHtml);

  return (
    <article className="single single-page page-template-editorial">
      <header className="single-header">
        <p className="section-kicker">{kicker}</p>
        <h1>{headline}</h1>
        {deck && <p>{deck}</p>}
        {image && <img src={image} alt={item.imageAlt || headline} />}
      </header>
      <div className="content" dangerouslySetInnerHTML={{ __html: body }} />
    </article>
  );
}
