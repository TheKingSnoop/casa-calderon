import { initials } from "@/lib/format";

/**
 * Member photo, or their initials when there's no `avatar` in their file.
 * Decorative next to the name, so alt="" (the name is already in the text).
 */
export function Avatar({
  name,
  src,
  size = 96,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const style = { width: size, height: size };
  if (src) {
    return (
      // Static export: no image optimiser. Images are pre-sized in public/images.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        style={style}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full bg-surface font-semibold text-muted"
      style={{ ...style, fontSize: size / 2.6 }}
    >
      {initials(name)}
    </span>
  );
}
