import ContentPage, { getContentPageMetadata } from '@/components/ContentPage';

export async function generateMetadata({ searchParams }) {
  return getContentPageMetadata('cookies-and-privacy-policy', searchParams);
}

export default function CookiesAndPrivacyPolicyPage({ searchParams }) {
  return <ContentPage slug="cookies-and-privacy-policy" searchParams={searchParams} />;
}
