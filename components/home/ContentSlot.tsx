/** An honest placeholder for imagery the site does not have yet.
 *
 *  The v2 design calls for real try-on stills in several places. Rather than fill those
 *  frames with stock photography or a rendered mock that would imply output STYLD hasn't
 *  produced for this page, each frame states plainly what belongs there. The design brief
 *  marks these `[CONTENT REQUIRED]`; this component is that marker, in place.
 */
export default function ContentSlot({
  label,
  compact = false,
}: {
  label: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "slot slot-compact" : "slot"} role="img" aria-label={`Placeholder: ${label}`}>
      <span className="slot-tag">Content required</span>
      <span className="slot-label">{label}</span>
    </div>
  );
}
