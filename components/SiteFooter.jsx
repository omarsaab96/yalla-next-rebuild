import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { getEnabledMenu } from '@/lib/cms';

export function SiteFooter({ settings, lang }) {
  return (
    <footer className="site-footer">
      <div>
        <h2><BrandLogo inverted compact /></h2>
        <p>{settings.description}</p>
      </div>
      <nav aria-label="Footer navigation">
        {getEnabledMenu(settings, lang).map((item) => (
          <Link key={item.href} href={item.href}>{item.label}</Link>
        ))}
      </nav>
      <p className="copyright">Copyright © 2026 {settings.siteName}</p>
    </footer>
  );
}
