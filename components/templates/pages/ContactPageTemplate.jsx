import { getTemplateField } from '@/lib/templateSchemas';

function rewriteContactForms(html = '') {
  return html
    .replace(/<form\b([^>]*)>/gi, (match, attrs) => {
    const nextAttrs = attrs
      .replace(/\saction=(["'])(.*?)\1/i, '')
      .replace(/\smethod=(["'])(.*?)\1/i, '')
      .replace(/\snovalidate(=(["'])(.*?)\2)?/i, '');

    return `<form${nextAttrs} action="/api/contact" method="post">`;
    })
    .replace(/class=(["'])([^"']*wpcf7-validates-as-required[^"']*)\1(?![^>]*\srequired\b)/gi, 'class=$1$2$1 required');
}

export function ContactPageTemplate({ page, item, searchParams }) {
  const heading = getTemplateField(page.fields, 'heading', item.lang, item.titleText);
  const intro = rewriteContactForms(getTemplateField(page.fields, 'intro', item.lang, item.contentHtml));
  const email = getTemplateField(page.fields, 'contactEmail', item.lang, '');
  const image = getTemplateField(page.fields, 'image', item.lang, page.featuredImage);
  const submitted = searchParams?.sent === '1';
  const failed = searchParams?.sent === '0';
  const invalid = searchParams?.sent === 'invalid';

  return (
    <article className="single-page page-template-contact">
      <header className="single-header">
        <p className="section-kicker">contact</p>
        <h1>{heading}</h1>
        {image && <img src={image} alt={item.imageAlt || heading} />}
      </header>
      <div className="content">
        <div dangerouslySetInnerHTML={{ __html: intro }} />
        {submitted && <p className="form-success">Thanks, your message has been received.</p>}
        {failed && <p className="form-error">Sorry, your message could not be saved. Please try again.</p>}
        {invalid && <p className="form-error">Please fill in your name, email, and subject with a valid email address.</p>}
        {email && <p><a href={`mailto:${email}`}>{email}</a></p>}
      </div>
    </article>
  );
}
