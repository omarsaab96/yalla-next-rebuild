import { HomepageTemplate } from '@/components/templates/pages/HomepageTemplate';
import { getContentList, getHomepage, renderContentItem } from '@/lib/cms';
import { getRequestContext } from '@/lib/request';

export const dynamic = 'force-dynamic';

export default async function HomePage({ searchParams }) {
  const { settings, lang } = await getRequestContext(searchParams);
  const homepage = await getHomepage();
  const item = homepage ? renderContentItem(homepage, lang) : null;
  const posts = settings.features.blog === false ? [] : await getContentList('post');
  const heroPost = posts[0] ? renderContentItem(posts[0], lang) : null;

  return (
    <HomepageTemplate
      homepage={homepage}
      item={item}
      settings={settings}
      lang={lang}
      posts={posts}
      heroPost={heroPost}
    />
  );
}
