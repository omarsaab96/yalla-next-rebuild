import { AdminEditor } from '@/components/AdminEditor';
import { adminSerialize, getContentList, getMediaList, getSettings, getTerms } from '@/lib/cms';
import { getAdminSession } from '@/lib/auth';
import { getAnalyticsSummary } from '@/lib/analytics';
import { getFormSubmissions } from '@/lib/formSubmissions';
import { hasMongoConfig } from '@/lib/mongo';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'CMS'
};

function parseSerialized(value) {
  return JSON.parse(adminSerialize(value));
}

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');

  const settings = await getSettings();
  const posts = await getContentList('post', { includeDisabled: true });
  const pages = await getContentList('page', { includeDisabled: true });
  const categories = await getTerms('category', { includeDisabled: true });
  const media = await getMediaList({ includeDisabled: true });
  const analytics = await getAnalyticsSummary();
  const formSubmissions = await getFormSubmissions();

  return (
    <AdminEditor
      mongoEnabled={hasMongoConfig()}
      session={session}
      initialData={{
        settings: parseSerialized(settings),
        pages: parseSerialized(pages),
        posts: parseSerialized(posts),
        categories: parseSerialized(categories),
        media: parseSerialized(media),
        analytics: parseSerialized(analytics),
        formSubmissions: parseSerialized(formSubmissions)
      }}
    />
  );
}
