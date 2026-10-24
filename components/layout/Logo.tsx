// Mirasha wordmark. The PNG (public/brand/mirasha-logo.png, 410×136, extracted from the
// client's logo file) is used as a mask, so the logo takes the current text colour —
// light on the dark hero header, dark on white pages, gold wherever `text-gold` is set.
const RATIO = 410 / 136;

/** `height` in px, or `fluid` to size by the width set in `className` (e.g. `w-[clamp(…)]`). */
export default function Logo({ height = 22, fluid = false, className = "" }: { height?: number; fluid?: boolean; className?: string }) {
  return (
    <span
      role="img"
      aria-label="Mirasha"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        ...(fluid ? { aspectRatio: RATIO } : { height, width: Math.round(height * RATIO) }),
        maskImage: "url(/brand/mirasha-logo.png)",
        WebkitMaskImage: "url(/brand/mirasha-logo.png)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
