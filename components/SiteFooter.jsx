import { t } from '@/lib/i18n';
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
      <nav aria-label={t('Footer navigation', lang)}>
        {getEnabledMenu(settings, lang).map((item) => (
          <Link key={item.href} href={item.href}>{item.label}</Link>
        ))}
      </nav>
      <p className="copyright">{t('Copyright', lang)} © 2026 {settings.siteName}</p>
    </footer>
  );
}
