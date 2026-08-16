import { getTemplateField } from '@/lib/templateSchemas';

export function HeroPageTemplate({ page, item }) {
  const kicker = getTemplateField(page.fields, 'kicker', item.lang, 'hero page');
  const headline = getTemplateField(page.fields, 'headline', item.lang, item.titleText);
  const subheadline = getTemplateField(page.fields, 'subheadline', item.lang, item.excerptText);
  const image = getTemplateField(page.fields, 'heroImage', item.lang, page.featuredImage);
  const body = getTemplateField(page.fields, 'body', item.lang, item.contentHtml);

  return (
    <article className="single single-page page-template-hero">
      <header className="single-header">
        <p className="section-kicker">{kicker}</p>
        <h1>{headline}</h1>
        {subheadline && <p>{subheadline}</p>}
        {image && <img src={image} alt={item.imageAlt || headline} />}
      </header>
      <div className="content" dangerouslySetInnerHTML={{ __html: body }} />
    </article>
  );
}
