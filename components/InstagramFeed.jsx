'use client';

import { useEffect, useState } from 'react';

const AUTOPLAY_DELAY = 3500;

function SocialIcon({ type }) {
  if (type === 'instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.2" />
      </svg>
    );
  }

  if (type === 'facebook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M14 8.5h2.2V5.2c-.4-.1-1.7-.2-3.1-.2-3.1 0-5.1 1.9-5.1 5.3v3H5v3.7h3V24h3.8v-7h3.1l.5-3.7h-3.6v-2.6c0-1.1.3-2.2 2.2-2.2z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function InstagramFeed({ ctaHref, email, facebookUrl, heading, instagramUrl, intro, items }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const followLinks = [
    { type: 'instagram', label: 'Instagram', href: instagramUrl || ctaHref },
    { type: 'facebook', label: 'Facebook', href: facebookUrl },
    { type: 'email', label: 'Email', href: email ? `mailto:${email}` : '' }
  ].filter((link) => link.href);

  useEffect(() => {
    if (items.length < 2) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % items.length);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  function renderPost(post, index) {
    const Wrapper = post.href ? 'a' : 'div';
    const wrapperProps = post.href
      ? { href: post.href, target: '_blank', rel: 'noopener noreferrer' }
      : {};

    return (
      <Wrapper
        className="instagram-post-card instagram-carousel-slide"
        key={`${post.image}-${post.title || index}`}
        {...wrapperProps}
      >
        <img src={post.image} alt={post.title || post.caption || 'Social feed image'} />
        {(post.title || post.caption) && (
          <span className="instagram-post-overlay">
            {post.title && <strong>{post.title}</strong>}
            {post.caption && <small>{post.caption}</small>}
          </span>
        )}
      </Wrapper>
    );
  }

  return (
    <section className="instagram-feed-section" aria-labelledby="instagram-feed-title">
      <div className="instagram-feed-grid">
        <div style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <div className="instagram-phone" aria-label="Instagram app preview">
            <div className="iphone-frame">
              <div className="iphone-notch" aria-hidden="true" />
              <div className="iphone-screen">
                <div style={{ position: 'relative' }}>
                  <div className="instagram-app-header" aria-hidden="true">
                    <span className="instagram-camera-icon" />
                    <span className="instagram-app-title">
                      <img src="/media/insta-logo.png" alt={'Social feed image'} />
                    </span>
                    <img width="12" src="/media/heart.png" alt={'Social feed image'} />
                  </div>

                  <img src="/media/insta-head.jpg" alt={'Social feed image'} />
                  <div className="instagram-posts instagram-carousel" aria-label="Social feed media">
                    <div
                      className="instagram-carousel-track"
                      style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                    >
                      {items.map(renderPost)}
                    </div>
                  </div>
                  <img style={{marginTop:15}}src="/media/insta-foot.jpg" alt={'Social feed image'} />
                  {items.length > 1 && (
                    <div className="carousel-dots instagram-carousel-dots" aria-label="Instagram feed pagination">
                      {items.map((post, index) => (
                        <button
                          type="button"
                          className={index === activeIndex ? 'active carouselDot' : 'carouselDot'}
                          key={`${post.image}-${index}`}
                          aria-label={`Go to social feed image ${index + 1}`}
                          aria-current={index === activeIndex ? 'true' : undefined}
                          onClick={() => setActiveIndex(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="instagram-app-footer" aria-hidden="true">
                  <span />
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="instagram-follow-panel">
          <p className="section-kicker">social feed</p>
          <h2 id="instagram-feed-title">{heading}</h2>
          {intro && <p>{intro}</p>}
          {followLinks.length > 0 && (
            <div className="social-follow-links" aria-label="Follow and contact links">
              {followLinks.map((link) => (
                <a
                  href={link.href}
                  key={link.label}
                  target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                  rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                >
                  <span className={`social-follow-icon social-follow-icon-${link.label.toLowerCase()}`} aria-hidden="true">
                    <SocialIcon type={link.type} />
                  </span>
                  <span className="social-follow-label">{link.label}</span>
                  {/* <strong>{link.label === 'Email' ? email : link.href.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</strong> */}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section >
  );
}
