import { getTemplateField } from '@/lib/templateSchemas';

export function GuidePostTemplate({ post, item }) {
  const kicker = getTemplateField(post.fields, 'kicker', item.lang, `gift guide · ${item.dateText}`);
  const headline = getTemplateField(post.fields, 'headline', item.lang, item.titleText);
  const intro = getTemplateField(post.fields, 'intro', item.lang, '');
  const image = getTemplateField(post.fields, 'heroImage', item.lang, post.featuredImage);
  const body = getTemplateField(post.fields, 'body', item.lang, item.contentHtml);

  return (
    <article className="single single-post post-template-guide">
      <header className="single-header">
        <p className="section-kicker">{kicker}</p>
        <h1>{headline}</h1>
        {image && <img src={image} alt={item.imageAlt || headline} />}
      </header>
      {intro && <div className="content" dangerouslySetInnerHTML={{ __html: intro }} />}
      <div className="content" dangerouslySetInnerHTML={{ __html: body }} />
    </article>
  );
}
