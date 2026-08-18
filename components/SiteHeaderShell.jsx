'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/BrandLogo';

function normalizePath(path = '/') {
  const pathOnly = path.split('?')[0] || '/';
  if (pathOnly === '/') return '/';
  return pathOnly.replace(/\/+$/, '');
}

export function SiteHeaderShell({ settings, lang, menu, homeHref }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [activeIndicator, setActiveIndicator] = useState({ left: 0, width: 0, visible: false });
  const pathname = usePathname();
  const languageMenuId = useId();
  const navRef = useRef(null);
  const languageSelectorRef = useRef(null);
  const enabledLanguages = Object.entries(settings.languages || {}).filter(([, config]) => config.enabled);
  const currentLanguage = enabledLanguages.find(([code]) => code === lang)?.[1] || enabledLanguages[0]?.[1];
  const currentPath = normalizePath(pathname);

  function isActiveHref(href) {
    const hrefPath = normalizePath(href);
    if (hrefPath === '/') return currentPath === '/';
    return currentPath === hrefPath || currentPath.startsWith(`${hrefPath}/`);
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;

    const updateIndicator = () => {
      const activeLink = nav.querySelector('.main-nav-link.active');
      if (!activeLink) {
        setActiveIndicator((current) => ({ ...current, visible: false }));
        return;
      }

      const navRect = nav.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      setActiveIndicator({
        left: linkRect.left - navRect.left,
        width: linkRect.width,
        visible: true
      });
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [currentPath, menu]);

  useEffect(() => {
    if (!isLanguageOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!languageSelectorRef.current?.contains(event.target)) {
        setIsLanguageOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLanguageOpen]);

  return (
    <header className={`site-header${isScrolled ? ' scrolled' : ''}`}>
      <div className="topline">
        <Link href={homeHref} className="brand" aria-label={`${settings.siteName} home`} scroll>
          <BrandLogo scrolled={isScrolled} />
        </Link>
        <nav
          className={`main-nav${isScrolled ? ' scrolled' : ''}${activeIndicator.visible ? ' has-active' : ''}`}
          aria-label="Main navigation"
          ref={navRef}
          style={{
            '--active-link-left': `${activeIndicator.left}px`,
            '--active-link-width': `${activeIndicator.width}px`
          }}
        >
          {menu.map((item) => {
            const active = isActiveHref(item.href);

            return (
              <Link
                key={item.href}
                className={`main-nav-link${active ? ' active' : ''}`}
                href={item.href}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="header-actions langs">
          <div className={`language-selector${isLanguageOpen ? ' open' : ''}`} ref={languageSelectorRef}>
            <button
              type="button"
              className="language-trigger"
              aria-expanded={isLanguageOpen}
              aria-controls={languageMenuId}
              onClick={() => setIsLanguageOpen((open) => !open)}
            >
              <span>{currentLanguage?.label || lang}</span>
              <svg className="language-chevron" aria-hidden="true" viewBox="0 0 20 20" focusable="false">
                <path d="M5 7.5L10 12.5L15 7.5" />
              </svg>
            </button>
            <div className="language-menu" id={languageMenuId}>
              {enabledLanguages.map(([code, config]) => (
                <Link
                  key={code}
                  className={code === lang ? 'language-option active' : 'language-option'}
                  href={`/?lang=${code}`}
                  onClick={() => setIsLanguageOpen(false)}
                >
                  <span>{config.label}</span>
                  {code === lang && <span className="language-check" aria-hidden="true">✓</span>}
                </Link>
              ))}
            </div>
          </div>
          {/* <a className="email-link" href={`mailto:${settings.email}`}>Email</a> */}
        </div>
      </div>
      {/* <p className="tagline">{settings.description}</p> */}
    </header>
  );
}
