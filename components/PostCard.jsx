import Link from 'next/link';
import { localizedHref, renderContentItem } from '@/lib/cms';

export function PostCard({ post, lang = 'en', large = false }) {
  const item = renderContentItem(post, lang);
  const href = localizedHref(`/${post.slug}/`, lang);

  return (
    <article className={large ? 'post-card post-card-large' : 'post-card'}>
      <Link href={href} className="post-image-link" aria-label={item.titleText}>
        <img src={post.featuredImage || '/media/2025/12/Yalla-Together-Logo-Header.jpg'} alt={item.imageAlt || item.titleText} />
      </Link>
      <div className="post-card-body">
        <p className="eyebrow">{item.dateText}</p>
        <h2><Link href={href}>{item.titleText}</Link></h2>
        <p>{item.excerptText.replace(/Read More.*/, '').slice(0, 170)}</p>
      </div>
    </article>
  );
}
