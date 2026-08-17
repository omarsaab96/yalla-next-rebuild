import Link from 'next/link';
import { HomepageCategoryTiles } from '@/components/CategoryTiles';
import { PostCard } from '@/components/PostCard';
import { localizedHref, renderContentItem } from '@/lib/cms';
import { getInstagramFeed } from '@/lib/instagram';
import { getTemplateField } from '@/lib/templateSchemas';

export async function HomepageTemplate({ homepage, item, settings, lang, posts, heroPost }) {
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
  const latestKicker = getTemplateField(homepage?.fields, 'latestKicker', lang, 'latest stories');
  const latestPostCountValue = getTemplateField(homepage?.fields, 'latestPostCount', lang, 5);
  const latestPostCount = Math.min(12, Math.max(1, Number.parseInt(latestPostCountValue, 10) || 5));
  const instagramFeed = await getInstagramFeed(6);
  const fallbackInstagramItems = posts.filter((post) => post.featuredImage).slice(0, 6).map((post) => {
    const postItem = renderContentItem(post, lang);
    return {
      id: post._id?.toString() || post.wordpressId,
      imageUrl: post.featuredImage,
      caption: postItem.titleText,
      permalink: instagramFeed.profileUrl
    };
  });
  const instagramItems = instagramFeed.items.length > 0 ? instagramFeed.items : fallbackInstagramItems;
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

      {showCategories && settings.features.homepageCategories !== false && settings.features.categories !== false && <HomepageCategoryTiles lang={lang} />}

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

      {showLatestPosts && settings.features.homepageLatest !== false && instagramItems.length > 0 && (
        <section className="instagram-section" aria-labelledby="instagram-title">
          <div className="instagram-header">
            <div>
              <p className="section-kicker">instagram</p>
              <h2 id="instagram-title">Follow the gift trail</h2>
            </div>
            <a className="text-link" href={instagramFeed.profileUrl} target="_blank" rel="noopener noreferrer">@yallatogether</a>
          </div>
          <div className="instagram-grid">
            {instagramItems.map((post) => (
              <a
                className="instagram-tile"
                href={post.permalink || instagramFeed.profileUrl}
                key={post.id}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View Yalla Together on Instagram: ${post.caption}`}
              >
                <img src={post.imageUrl} alt={post.caption} />
                <span>{post.caption}</span>
              </a>
            ))}
          </div>
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
