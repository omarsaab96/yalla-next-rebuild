import { getTemplateField } from '@/lib/templateSchemas';

export function StandardPageTemplate({ page, item }) {
  const heading = getTemplateField(page.fields, 'heading', item.lang, item.titleText);
  const image = getTemplateField(page.fields, 'featuredImage', item.lang, page.featuredImage);
  const body = getTemplateField(page.fields, 'body', item.lang, item.contentHtml);

  return (
    <article className="single-page page-template-standard">
      <header className="single-header">
        {/* <p className="section-kicker">page</p> */}
        <h1>{heading}</h1>
        {image && <img src={image} alt={item.imageAlt || heading} />}
      </header>
      {body ? (
        <div className="content" dangerouslySetInnerHTML={{ __html: body }} />
      ) : (
        <div className="content">
          <p>{item.excerptText || heading}</p>
        </div>
      )}
    </article>
  );
}
