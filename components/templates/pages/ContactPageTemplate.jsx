import { getTemplateField } from '@/lib/templateSchemas';

export function ContactPageTemplate({ page, item }) {
  const heading = getTemplateField(page.fields, 'heading', item.lang, item.titleText);
  const intro = getTemplateField(page.fields, 'intro', item.lang, item.contentHtml);
  const email = getTemplateField(page.fields, 'contactEmail', item.lang, '');
  const image = getTemplateField(page.fields, 'image', item.lang, page.featuredImage);

  return (
    <article className="single single-page page-template-contact">
      <header className="single-header">
        <p className="section-kicker">contact</p>
        <h1>{heading}</h1>
        {image && <img src={image} alt={item.imageAlt || heading} />}
      </header>
      <div className="content">
        <div dangerouslySetInnerHTML={{ __html: intro }} />
        {email && <p><a href={`mailto:${email}`}>{email}</a></p>}
      </div>
    </article>
  );
}
