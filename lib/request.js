import { cookies } from 'next/headers';
import { getSettings, normalizeLang } from '@/lib/cms';

export async function getRequestContext(searchParams) {
  const settings = await getSettings();
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const cookieStore = await cookies();
  const lang = normalizeLang(resolvedSearchParams?.lang || cookieStore.get('lang')?.value, settings);

  return { settings, lang };
}
