/**
 * Casa Calderon logo. PLACEHOLDER: a "CC" monogram in a circle.
 *
 * To use a real logo, replace the <svg> below (keep `viewBox`, `aria-hidden`
 * and `currentColor` so it follows the text colour in light/dark mode and on
 * the cover photo), and update src/app/icon.svg (the browser tab icon) to match.
 *
 * Decorative: it always sits next to the site name, so screen readers skip it.
 */
export function Logo({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
      data-logo="placeholder"
    >
      <circle
        cx="24"
        cy="24"
        r="22.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <text
        x="24"
        y="24"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        fontFamily="var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif"
        fontSize="17"
        fontWeight="600"
        letterSpacing="-0.5"
      >
        CC
      </text>
    </svg>
  );
}
