import Link from 'next/link';
import { BrandLogo } from '@/components/BrandLogo';
import { getEnabledMenu, localizedHref } from '@/lib/cms';

export function SiteHeader({ settings, lang }) {
  const menu = getEnabledMenu(settings, lang);

  return (
    <header className="site-header">
      <div className="topline">
        <Link href={localizedHref('/', lang)} className="brand" aria-label={`${settings.siteName} home`}>
          <BrandLogo compact />
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          {menu.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
        </nav>
        <div className="header-actions">
          {Object.entries(settings.languages || {})
            .filter(([, config]) => config.enabled)
            .map(([code, config]) => (
              <Link key={code} className={code === lang ? 'language-link active' : 'language-link'} href={`/?lang=${code}`}>
                {config.label}
              </Link>
            ))}
          <a className="email-link" href={`mailto:${settings.email}`}>Email</a>
        </div>
      </div>
      <p className="tagline">{settings.description}</p>
    </header>
  );
}
