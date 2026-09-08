'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export function HomepageCategoryCarousel({ tiles }) {
  const trackRef = useRef(null);
  const pageOffsetsRef = useRef([]);
  const [pageCount, setPageCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  function updateScrollState() {
    const track = trackRef.current;
    if (!track) return;

    setCanScrollPrev(track.scrollLeft > 4);
    setCanScrollNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);

    const closest = pageOffsetsRef.current.reduce((current, offset, index) => {
      const distance = Math.abs(offset - track.scrollLeft);
      return distance < current.distance ? { index, distance } : current;
    }, { index: 0, distance: Number.POSITIVE_INFINITY });
    setActiveIndex(closest.index);
  }

  function scrollByPage(direction) {
    const track = trackRef.current;
    if (!track) return;

    scrollToIndex(Math.max(0, Math.min(pageCount - 1, activeIndex + direction)));
  }

  function scrollToIndex(index) {
    const track = trackRef.current;
    const offset = pageOffsetsRef.current[index];
    if (!track || offset === undefined) return;

    track.scrollTo({
      left: offset,
      behavior: 'smooth'
    });
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    function updatePages() {
      const slides = Array.from(track.children);
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap) || 0;
      const availableWidth = track.clientWidth - (parseFloat(styles.paddingLeft) || 0) - (parseFloat(styles.paddingRight) || 0);
      const slideWidth = slides[0]?.getBoundingClientRect().width || 1;
      const itemsPerPage = Math.max(1, Math.floor((availableWidth + gap) / (slideWidth + gap)));
      const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
      const offsets = [];

      for (let index = 0; index < slides.length; index += itemsPerPage) {
        const offset = Math.min(maxScroll, slides[index].offsetLeft - slides[0].offsetLeft);
        if (!offsets.length || offset > offsets[offsets.length - 1]) offsets.push(offset);
      }

      pageOffsetsRef.current = offsets;
      setPageCount(offsets.length);
      updateScrollState();
    }

    updatePages();
    const observer = new ResizeObserver(updatePages);
    observer.observe(track);
    Array.from(track.children).forEach((slide) => observer.observe(slide));
    track.addEventListener('scroll', updateScrollState, { passive: true });
    return () => {
      observer.disconnect();
      track.removeEventListener('scroll', updateScrollState);
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
        {Array.from({ length: pageCount }, (_, index) => (
          <button
            type="button"
            className={index === activeIndex ? 'active carouselDot' : 'carouselDot'}
            key={index}
            aria-label={`Go to category page ${index + 1}`}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() => scrollToIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
