import ContentPage, { getContentPageMetadata } from '@/components/ContentPage';

export async function generateMetadata() {
  return getContentPageMetadata('services');
}

export default function ServicesPage({ searchParams }) {
  return <ContentPage slug="services" searchParams={searchParams} />;
}
