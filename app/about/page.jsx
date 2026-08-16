import ContentPage, { getContentPageMetadata } from '@/components/ContentPage';

export async function generateMetadata() {
  return getContentPageMetadata('about');
}

export default function AboutPage({ searchParams }) {
  return <ContentPage slug="about" searchParams={searchParams} />;
}
