'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

const fallbackImage = '/media/2025/12/Yalla-Together-Logo-Header.jpg';

function FilterGroup({ title, groups, selected, onChange }) {
  const items = groups || [];
  if (!items.length) return null;

  function toggle(item, checked) {
    const id = item.id;
    const next = checked
      ? Array.from(new Set([...selected, id]))
      : selected.filter((selectedId) => selectedId !== id);
    onChange(next);
  }

  return (
    <fieldset className="finder-filter-group">
      <legend>{title}</legend>
      <div className="finder-category-groups">
        {items.map((group) => (
          <div className="finder-category-group" key={group.id}>
            <label className="finder-category-parent">
              <input
                type="checkbox"
                checked={selected.includes(group.id)}
                onChange={(event) => toggle(group, event.target.checked)}
              />
              <span>{group.name}</span>
              <small>{group.count}</small>
            </label>
            {group.children.length > 0 && (
              <div className="finder-category-children">
                {group.children.map((child) => (
                  <label key={child.id}>
                    <input
                      type="checkbox"
                      checked={selected.includes(child.id)}
                      onChange={(event) => toggle(child, event.target.checked)}
                    />
                    <span>{child.name}</span>
                    <small>{child.count}</small>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </fieldset>
  );
}

function FinderCard({ post }) {
  const [image, setImage] = useState(post.image || fallbackImage);

  return (
    <article className="finder-card">
      <Link href={post.href} className="finder-card-image">
        <img src={image} alt={post.imageAlt || post.title} onError={() => setImage(fallbackImage)} />
      </Link>
      <div className="finder-card-body">
        <p className='eyebrow'>{post.date}</p>
        <h4><Link href={post.href}>{post.title}</Link></h4>
        <p>{post.excerpt && <span>{post.excerpt}</span>}</p>
      </div>
      <div className="finder-card-footer">
        <Link className='post-card-readmore' href={post.href}>Read more</Link>
      </div>
    </article>
  );
}

export function GiftFinder({
  kicker = 'gift finder',
  heading,
  intro,
  image,
  imageAlt,
  body,
  posts,
  categories,
  searchPlaceholder = 'Search gifts, people, occasions',
  filterTitle = 'Categories',
  emptyMessage = 'No gifts match these filters.'
}) {
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selectedMatchIds = categories
      .flatMap((group) => [group, ...(group.children || [])])
      .filter((item) => selectedCategories.includes(item.id))
      .flatMap((item) => item.matchIds || [item.id])
      .map(String);

    return posts.filter((post) => {
      const matchesQuery = !normalizedQuery || `${post.title} ${post.excerpt}`.toLowerCase().includes(normalizedQuery);
      const postCategoryIds = post.categories.map(String);
      const matchesCategories = selectedMatchIds.length === 0 || selectedMatchIds.some((id) => postCategoryIds.includes(id));
      return matchesQuery && matchesCategories;
    });
  }, [posts, categories, query, selectedCategories]);

  function clearFilters() {
    setQuery('');
    setSelectedCategories([]);
  }

  return (
    <main className="gift-finder-page">
      <section className="finder-hero single-header">
        {/* <p className="section-kicker">{kicker}</p> */}
        <h1>{heading}</h1>
        {image && <img className="finder-hero-image" src={image} alt={imageAlt || heading} />}
        {intro && <div className="content" dangerouslySetInnerHTML={{ __html: intro }} />}
      </section>

      <section className="finder-layout">
        <aside className="finder-sidebar">
          <div className="finder-sidebar-inner">
            <label className="finder-search">
              <span>Search</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} />
            </label>
            <FilterGroup title={filterTitle} groups={categories} selected={selectedCategories} onChange={setSelectedCategories} />
            <button className="secondary-button" type="button" onClick={clearFilters}>Clear filters</button>
          </div>
        </aside>

        <div className="finder-results">
          <div className="finder-results-head">
            <p>{filteredPosts.length} result{filteredPosts.length === 1 ? '' : 's'}</p>
          </div>
          <div className="finder-grid">
            {filteredPosts.map((post) => <FinderCard key={post.id} post={post} />)}
          </div>
          {filteredPosts.length === 0 && <p className="finder-empty">{emptyMessage}</p>}
        </div>
      </section>

      {body && <section className="content finder-body" dangerouslySetInnerHTML={{ __html: body }} />}
    </main>
  );
}
