export function BrandLogo({ inverted = false, compact = false, scrolled=false }) {
  return (
    <img
      className={`brand-logo${inverted ? ' inverted' : ''}${compact ? ' compact' : ''}`}
      src={scrolled ? "/media/2025/12/Yalla-Together-Logo-Header-colored.png" : "/media/2025/12/Yalla-Together-Logo-Header.png"}
      alt="Yalla together" />
  );
}
