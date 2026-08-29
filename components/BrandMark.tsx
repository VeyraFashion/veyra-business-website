/** The STYLD mark: a constructed "D" — stem + true semicircle bowl (radius = bowl width),
 *  so the curve holds at any size. Geometry sourced from the mono-ink logo export at
 *  Extras/exports/styld-4d-mono-ink/mark.svg. Renders in `currentColor` so it inherits
 *  whatever ink/ground pairing the surrounding element sets (e.g. the nav's dark
 *  `.home-mark-symbol` tile), rather than being locked to the exported ink/bone colourway.
 */
export default function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 96 120"
      className={className}
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="0" y="0" width="24" height="120" />
      <path d="M36 0 A60 60 0 0 1 36 120 Z" />
    </svg>
  );
}
