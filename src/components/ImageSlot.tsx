import Image from "next/image";

type Shape = "rect" | "rounded" | "circle" | "pill";

const SHAPE_RADIUS: Record<Shape, string> = {
  rect: "0",
  rounded: "var(--radius-m)",
  circle: "50%",
  pill: "999px",
};

/**
 * GiraSun image surface.
 *
 * - With `src`: renders an optimized next/image filling the slot.
 * - Without `src`: renders the dashed placeholder (matches the original
 *   `<image-slot>` web component visual). Useful for in-progress layouts.
 */
export function ImageSlot({
  src,
  alt = "",
  placeholder = "Imagen",
  shape = "rounded",
  radius,
  className,
  style,
  priority,
}: {
  src?: string;
  alt?: string;
  placeholder?: string;
  shape?: Shape;
  radius?: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
}) {
  const borderRadius = radius != null ? `${radius}px` : SHAPE_RADIUS[shape];
  const wrapperStyle: React.CSSProperties = { borderRadius, overflow: "hidden", ...style };

  if (!src) {
    return (
      <div className={`image-slot ${className ?? ""}`.trim()} style={wrapperStyle}>
        {placeholder}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%", ...wrapperStyle }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1280px) 50vw, 100vw"
        style={{ objectFit: "cover" }}
        priority={priority}
      />
    </div>
  );
}
