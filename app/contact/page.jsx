import ContentPage, { getContentPageMetadata } from '@/components/ContentPage';

export async function generateMetadata() {
  return getContentPageMetadata('contact');
}

export default function ContactPage({ searchParams }) {
  return <ContentPage slug="contact" searchParams={searchParams} />;
}
