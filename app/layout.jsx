import './globals.css';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { SiteHeader } from '@/components/SiteHeader';
import { SiteFooter } from '@/components/SiteFooter';
import { getRequestContext } from '@/lib/request';

export const metadata = {
  metadataBase: new URL('https://yallatogether.com'),
  title: {
    default: 'Yalla Together',
    template: '%s - Yalla Together'
  },
  description: 'your go-to resource for gifts that do good and delight'
};

export default async function RootLayout({ children }) {
  const { settings, lang } = await getRequestContext();
  const headerStore = await headers();
  const currentPath = headerStore.get('x-current-path') || '';
  const isAdmin = currentPath.startsWith('/admin');
  const dir = settings.languages?.[lang]?.direction || 'ltr';

  return (
    <html lang={lang} dir={dir}>
      <body className={`${dir === 'rtl' ? 'rtl' : ''}${isAdmin ? ' admin-body' : ''}`}>
        {!isAdmin && <SiteHeader settings={settings} lang={lang} />}
        <main>{children}</main>
        {!isAdmin && <SiteFooter settings={settings} lang={lang} />}
        {!isAdmin && (
          <Suspense fallback={null}>
            <AnalyticsTracker lang={lang} />
          </Suspense>
        )}
      </body>
    </html>
  );
}
