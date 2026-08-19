export function InstagramFeed({ ctaHref, ctaLabel, heading, intro, items }) {
  if (!items.length) return null;
  const leftItems = items.slice(0, 3);
  const rightItems = items.slice(3, 6);

  function renderPost(post) {
    const Wrapper = post.href ? 'a' : 'div';
    const wrapperProps = post.href
      ? { href: post.href, target: '_blank', rel: 'noopener noreferrer' }
      : {};

    return (
      <Wrapper className="instagram-post-card" key={`${post.image}-${post.title}`} {...wrapperProps}>
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
        <div className="instagram-posts" aria-label="Social feed media">
          <div className="instarow row1">{leftItems.map(renderPost)}</div>
          <div className="instarow row2">{rightItems.map(renderPost)}</div>
        </div>

        {/* <div className="instagram-posts" aria-label="More social feed media">
          
        </div> */}

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
    </section>
  );
}
