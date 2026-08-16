import { getTemplateField } from '@/lib/templateSchemas';

export function FeaturePostTemplate({ post, item }) {
  const kicker = getTemplateField(post.fields, 'kicker', item.lang, `feature story · ${item.dateText}`);
  const headline = getTemplateField(post.fields, 'headline', item.lang, item.titleText);
  const deck = getTemplateField(post.fields, 'deck', item.lang, item.excerptText);
  const image = getTemplateField(post.fields, 'heroImage', item.lang, post.featuredImage);
  const body = getTemplateField(post.fields, 'body', item.lang, item.contentHtml);

  return (
    <article className="single single-post post-template-feature">
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
