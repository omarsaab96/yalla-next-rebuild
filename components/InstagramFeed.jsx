'use client';

import { useEffect, useState } from 'react';

const AUTOPLAY_DELAY = 3500;

export function InstagramFeed({ ctaHref, ctaLabel, heading, intro, items }) {
  const [activeIndex, setActiveIndex] = useState(0);

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
          {ctaHref && ctaLabel && (
            <a href={ctaHref} target="_blank" rel="noopener noreferrer">
              {ctaLabel}
            </a>
          )}
        </div>
      </div>
    </section >
  );
}
