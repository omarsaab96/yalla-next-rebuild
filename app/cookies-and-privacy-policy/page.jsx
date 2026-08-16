import ContentPage, { getContentPageMetadata } from '@/components/ContentPage';

export async function generateMetadata() {
  return getContentPageMetadata('cookies-and-privacy-policy');
}

export default function CookiesAndPrivacyPolicyPage({ searchParams }) {
  return <ContentPage slug="cookies-and-privacy-policy" searchParams={searchParams} />;
}
