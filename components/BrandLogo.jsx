export function BrandLogo({ inverted = false, compact = false, scrolled = false, responsiveWhite = false }) {
  const logo = (
    <img
      className={`brand-logo${inverted ? ' inverted' : ''}${compact ? ' compact' : ''}`}
      src={scrolled ? "/media/2025/12/Yalla-Together-Logo-Header-colored.png" : "/media/2025/12/Yalla-Together-Logo-Header.png"}
      alt="Yalla together" />
  );

  if (!responsiveWhite) return logo;

  return (
    <picture>
      <source media="(max-width: 900px)" srcSet="/media/2025/12/Yalla-Together-Logo-Header.png" />
      {logo}
    </picture>
  );
}
