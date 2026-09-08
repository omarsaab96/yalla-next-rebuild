import ContentPage, { getContentPageMetadata } from '@/components/ContentPage';

export async function generateMetadata({ searchParams }) {
  return getContentPageMetadata('contact', searchParams);
}

export default function ContactPage({ searchParams }) {
  return <ContentPage slug="contact" searchParams={searchParams} />;
}
