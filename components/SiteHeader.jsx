import { getEnabledMenu, localizedHref } from '@/lib/cms';
import { SiteHeaderShell } from '@/components/SiteHeaderShell';

export function SiteHeader({ settings, lang }) {
  const menu = getEnabledMenu(settings, lang);
  const headerSettings = {
    siteName: settings.siteName || '',
    email: settings.email || '',
    languages: Object.fromEntries(
      Object.entries(settings.languages || {}).map(([code, config]) => [
        code,
        {
          label: config.label || code,
          enabled: Boolean(config.enabled),
          direction: config.direction || 'ltr'
        }
      ])
    )
  };

  return (
    <SiteHeaderShell
      settings={headerSettings}
      lang={lang}
      menu={menu}
      homeHref={localizedHref('/', lang)}
    />
  );
}
