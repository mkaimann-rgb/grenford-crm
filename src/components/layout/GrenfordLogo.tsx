import Image from "next/image";

/**
 * Original-GRENFORD-Logo (Datei „ChatGPT Image 12. März 2026, 22_15_50.png“ aus dem
 * Drive-Ordner „Grenford Logo“). Nur zugeschnitten und Hintergrund transparent gemacht –
 * Monogramm, Schrift und Proportionen sind unverändert.
 */
const LOGO_WIDTH = 639;
const LOGO_HEIGHT = 476;

export function GrenfordLogo({ width = 132 }: { width?: number }) {
  return (
    <Image
      src="/brand/grenford-logo.png"
      alt="GRENFORD"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority
      className="mx-auto h-auto"
      style={{ width }}
    />
  );
}
