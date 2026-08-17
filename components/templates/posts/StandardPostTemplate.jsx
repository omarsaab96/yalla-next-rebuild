import { getTemplateField } from '@/lib/templateSchemas';

export function StandardPostTemplate({ post, item }) {
  const kicker = getTemplateField(post.fields, 'kicker', item.lang, item.dateText);
  const headline = getTemplateField(post.fields, 'headline', item.lang, item.titleText);
  const image = getTemplateField(post.fields, 'heroImage', item.lang, post.featuredImage);
  const body = getTemplateField(post.fields, 'body', item.lang, item.contentHtml);

  return (
    <article className="single-post post-template-standard">
      <header className="single-header">
        <p className="section-kicker">{kicker}</p>
        <h1>{headline}</h1>
        {/* {image && <img src={image} alt={item.imageAlt || headline} />} */}
      </header>
      <div className="content" dangerouslySetInnerHTML={{ __html: body }} />
    </article>
  );
}
