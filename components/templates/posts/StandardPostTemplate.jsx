import { getTemplateField } from '@/lib/templateSchemas';
import Link from 'next/link';
import { localizedHref } from '@/lib/cms';
import { t } from '@/lib/i18n';

export function StandardPostTemplate({ post, item }) {
  const { lang } = item;
  const kicker = getTemplateField(post.fields, 'kicker', item.lang, item.dateText);
  const headline = getTemplateField(post.fields, 'headline', item.lang, item.titleText);
  const image = getTemplateField(post.fields, 'heroImage', item.lang, post.featuredImage);
  const body = getTemplateField(post.fields, 'body', item.lang, item.contentHtml);

  return (
    <article className="single-post post-template-standard">
      <header className="blogHeader">
        <div className="blogHead">
          <div className="container">
            <div className="backbtn">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="#d49d20"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <Link
                href={localizedHref("/blog/", lang)}
                className="backbtnText"
              >
                {t('All posts', lang)}
              </Link>
            </div>

            <h1>{headline}</h1><br></br>
            <p className="section-kicker">{kicker}</p>
            {/* {image && <img src={image} alt={item.imageAlt || headline} />} */}
          </div>
        </div>
      </header>
      <div className="content" dangerouslySetInnerHTML={{ __html: body }} />
    </article>
  );
}
