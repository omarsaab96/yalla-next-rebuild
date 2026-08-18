import Link from 'next/link';
import { HomepageCategoryTiles } from '@/components/HomepageCategoryTiles';
import { PostCard } from '@/components/PostCard';
import { localizedHref } from '@/lib/cms';
import { getTemplateField } from '@/lib/templateSchemas';

export function HomepageTemplate({ homepage, item, settings, lang, posts, heroPost }) {
  const heroImage = getTemplateField(homepage?.fields, 'heroImage', lang, homepage?.featuredImage || posts[0]?.featuredImage || '/media/2025/12/Yalla-Together-Logo-Header.jpg');
  const heroKicker = getTemplateField(homepage?.fields, 'heroKicker', lang, settings.description);
  const heroTitle = getTemplateField(homepage?.fields, 'heroTitle', lang, item?.titleText || settings.siteName);
  const heroSubtitle = getTemplateField(homepage?.fields, 'heroSubtitle', lang, item?.excerptText || heroPost?.excerptText || '');
  const primaryCtaLabel = getTemplateField(homepage?.fields, 'primaryCtaLabel', lang, 'Blog');
  const primaryCtaHref = getTemplateField(homepage?.fields, 'primaryCtaHref', lang, '/blog/');
  const secondaryCtaLabel = getTemplateField(homepage?.fields, 'secondaryCtaLabel', lang, 'Gift Finder');
  const secondaryCtaHref = getTemplateField(homepage?.fields, 'secondaryCtaHref', lang, '/gift-finder/');
  const introContent = getTemplateField(homepage?.fields, 'introContent', lang, item?.contentHtml || '');
  const showCategories = getTemplateField(homepage?.fields, 'showCategories', lang, true);
  const showLatestPosts = getTemplateField(homepage?.fields, 'showLatestPosts', lang, true);
  const showInstagramFeed = getTemplateField(homepage?.fields, 'showInstagramFeed', lang, false);
  const latestKicker = getTemplateField(homepage?.fields, 'latestKicker', lang, 'latest stories');
  const latestPostCountValue = getTemplateField(homepage?.fields, 'latestPostCount', lang, 5);
  const latestPostCount = Math.min(12, Math.max(1, Number.parseInt(latestPostCountValue, 10) || 5));
  const contactTitle = getTemplateField(homepage?.fields, 'contactTitle', lang, 'Need help?');
  const contactText = getTemplateField(homepage?.fields, 'contactText', lang, 'Tell us who you are shopping for and what the moment means. We will help you find the right story.');
  const contactCtaLabel = getTemplateField(homepage?.fields, 'contactCtaLabel', lang, 'Get in touch');
  const contactCtaHref = getTemplateField(homepage?.fields, 'contactCtaHref', lang, '/contact/');

  return (
    <>
      {settings.features.homepageHero !== false && (
        <section className="hero page-template-homepage">
          <img src={heroImage} alt={item?.imageAlt || heroPost?.imageAlt || settings.siteName} />
          <div className="hero-copy">
            {/* <p>{heroKicker}</p> */}
            <h2 className="hero-title">{heroTitle}</h2>
            <span className="hero-subtitle">{heroSubtitle}</span>
            <div className="hero-actions">
              {settings.features.blog !== false && <Link href={localizedHref(primaryCtaHref, lang)}>{primaryCtaLabel}</Link>}
              <Link href={localizedHref(secondaryCtaHref, lang)}>{secondaryCtaLabel}</Link>
            </div>
          </div>
        </section>
      )}

      {settings.features.homepageIntro !== false && introContent && (
        <section className="home-cms-content content" dangerouslySetInnerHTML={{ __html: introContent }} />
      )}

      {showCategories && settings.features.homepageCategories !== false && settings.features.categories !== false &&
        <HomepageCategoryTiles lang={lang} />
      }

      {showLatestPosts && settings.features.homepageLatest !== false && settings.features.blog !== false && posts.length > 0 && (
        <section className="latest-section">
          <h2 className="">{latestKicker}</h2>
          <div className="post-grid">
            {/* <PostCard post={posts[0]} lang={lang} large /> */}
            {posts.slice(0, latestPostCount).map(
              (post) => <PostCard key={post._id?.toString() || post.wordpressId} post={post} lang={lang} />
            )}
          </div>
        </section>
      )}

      {showInstagramFeed && (
        <section className="instagram-embed-section">
          <iframe
            src="https://www.juicer.io/api/feeds/yallatogether/iframe"
            frameBorder="0"
            width="1000"
            height="3140"
            style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: '1000px', height: '3140px' }}
            title="yallatogether - Juicer social media feed"
          />
        </section>
      )}

      {settings.features.contactCta !== false && (
        <section className="contact-cta">
          <h2>{contactTitle}</h2>
          <p>{contactText}</p>
          <Link href={localizedHref(contactCtaHref, lang)}>{contactCtaLabel}</Link>
        </section>
      )}
    </>
  );
}
