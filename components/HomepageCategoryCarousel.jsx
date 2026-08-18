'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export function HomepageCategoryCarousel({ tiles }) {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  function updateScrollState() {
    const track = trackRef.current;
    if (!track) return;

    setCanScrollPrev(track.scrollLeft > 4);
    setCanScrollNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);

    const slides = Array.from(track.children);
    const closest = slides.reduce((current, slide, index) => {
      const distance = Math.abs(slide.offsetLeft - track.scrollLeft);
      return distance < current.distance ? { index, distance } : current;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });
    setActiveIndex(closest.index);
  }

  function scrollByPage(direction) {
    const track = trackRef.current;
    if (!track) return;

    track.scrollBy({
      left: direction * Math.max(track.clientWidth * 0.78, 260),
      behavior: 'smooth'
    });
  }

  function scrollToIndex(index) {
    const track = trackRef.current;
    const slide = track?.children[index];
    if (!track || !slide) return;

    track.scrollTo({
      left: slide.offsetLeft,
      behavior: 'smooth'
    });
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    updateScrollState();
    track.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      track.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [tiles]);

  return (
    <div className="homepage-category-carousel">
      <div className="carousel-controls" aria-label="Category carousel controls">
        <button type="button" aria-label="Previous categories" disabled={!canScrollPrev} onClick={() => scrollByPage(-1)}>
          <span className="carousel-arrow-icon prev" aria-hidden="true" />
        </button>
        <button type="button" aria-label="Next categories" disabled={!canScrollNext} onClick={() => scrollByPage(1)}>
          <span className="carousel-arrow-icon next" aria-hidden="true" />
        </button>
      </div>
      <div className="homepage-category-track" ref={trackRef}>
        {tiles.map((tile) => (
          <Link className="category-tile homepage-category-slide" href={tile.href} key={tile.title}>
            <img className="category-illustration" src={tile.image} alt={tile.imageAlt || tile.title} />
            <span>{tile.title}</span>
          </Link>
        ))}
      </div>
      <div className="carousel-dots" aria-label="Category carousel pagination">
        {tiles.map((tile, index) => (
          <button
            type="button"
            className={index === activeIndex ? 'active carouselDot' : 'carouselDot'}
            key={tile.title}
            aria-label={`Go to ${tile.title}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() => scrollToIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
