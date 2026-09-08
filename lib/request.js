import { cookies, headers } from 'next/headers';
import { getSettings, localize, normalizeLang } from '@/lib/cms';

export async function getRequestContext(searchParams) {
  const settings = await getSettings();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const cookieStore = await cookies();
  const headerStore = await headers();
  const lang = normalizeLang(resolvedSearchParams?.lang || headerStore.get('x-site-lang') || cookieStore.get('lang')?.value, settings);

  return {
    settings: {
      ...settings,
      siteName: (lang === 'ar' && settings.siteNameAr) || localize(settings.siteName, lang),
      description: (lang === 'ar' && settings.descriptionAr) || localize(settings.description, lang)
    },
    lang
  };
}
