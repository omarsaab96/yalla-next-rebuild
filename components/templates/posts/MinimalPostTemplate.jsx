import { getTemplateField } from '@/lib/templateSchemas';

export function MinimalPostTemplate({ post, item }) {
  const headline = getTemplateField(post.fields, 'headline', item.lang, item.titleText);
  const body = getTemplateField(post.fields, 'body', item.lang, item.contentHtml);

  return (
    <article className="single single-post post-template-minimal">
      <header className="single-header">
        <p className="section-kicker">{item.dateText}</p>
        <h1>{headline}</h1>
      </header>
      <div className="content" dangerouslySetInnerHTML={{ __html: body }} />
    </article>
  );
}
