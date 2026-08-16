import { getTemplateField } from '@/lib/templateSchemas';

export function BlogPageTemplate({ page, item }) {
  const heading = getTemplateField(page.fields, 'heading', item.lang, item.titleText);
  const intro = getTemplateField(page.fields, 'intro', item.lang, item.contentHtml);
  const image = getTemplateField(page.fields, 'image', item.lang, page.featuredImage);
  const body = getTemplateField(page.fields, 'body', item.lang, '');

  return (
    <article className="single-page page-template-blog">
      <header className="single-header">
        {/* <p className="section-kicker">blog</p> */}
        <h1>{heading}</h1>
        {image && <img src={image} alt={item.imageAlt || heading} />}
        {intro && <div className="single-header-intro" dangerouslySetInnerHTML={{ __html: intro }} />}
      </header>
      {body && <div className="content" dangerouslySetInnerHTML={{ __html: body }} />}
    </article>
  );
}
