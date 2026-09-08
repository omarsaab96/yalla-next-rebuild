import ContentPage, { getContentPageMetadata } from '@/components/ContentPage';

export async function generateMetadata({ searchParams }) {
  return getContentPageMetadata('about', searchParams);
}

export default function AboutPage({ searchParams }) {
  return <ContentPage slug="about" searchParams={searchParams} />;
}
