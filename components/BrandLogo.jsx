export function BrandLogo({ inverted = false, compact = false }) {
  return (
    <span className={`brand-logo${inverted ? ' inverted' : ''}${compact ? ' compact' : ''}`}>
      <span className="brand-logo-line">
        Yalla<span className="brand-heart" aria-hidden="true">♥</span>
      </span>
      <span className="brand-logo-line brand-logo-together">together</span>
    </span>
  );
}
