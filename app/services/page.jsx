import ContentPage, { getContentPageMetadata } from '@/components/ContentPage';

export async function generateMetadata({ searchParams }) {
  return getContentPageMetadata('services', searchParams);
}

export default function ServicesPage({ searchParams }) {
  return <ContentPage slug="services" searchParams={searchParams} />;
}
