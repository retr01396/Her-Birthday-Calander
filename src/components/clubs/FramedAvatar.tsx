"use client";

import { FRAME_CLIP_PATHS, FrameShape } from "@/types/roster";

interface FramedAvatarProps {
  src?: string | null;
  name: string;
  shape: FrameShape;
  borderColor: string;
  borderWidth: number;
  shadow: boolean;
  /** Square size in px (default 72). */
  size?: number;
  className?: string;
}

/**
 * Renders a member photo with the club's chosen frame. Circle and rounded
 * shapes use real border-radius (border + box-shadow). Geometric shapes
 * (hexagon / shield / octagon) use clip-path with a colored backing layer
 * that reads as a border, plus a drop-shadow filter.
 */
export default function FramedAvatar({
  src,
  name,
  shape,
  borderColor,
  borderWidth,
  shadow,
  size = 72,
  className = "",
}: FramedAvatarProps) {
  const clip = FRAME_CLIP_PATHS[shape];
  const style = { width: size, height: size };

  const fallback = (
    <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 bg-slate-100">
      {name.charAt(0).toUpperCase()}
    </div>
  );

  // Circle / rounded rectangle — real border and box-shadow.
  if (!clip) {
    const radius =
      shape === "circle" ? "9999px" : `${Math.max(6, Math.round(size * 0.2))}px`;
    return (
      <div
        className={`relative overflow-hidden flex-shrink-0 ${className}`}
        style={{
          ...style,
          borderRadius: radius,
          border:
            borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : undefined,
          boxShadow: shadow
            ? "0 6px 16px rgba(15, 23, 42, 0.18)"
            : undefined,
        }}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          fallback
        )}
      </div>
    );
  }

  // Geometric clip-path frame: colored backing layer (border) + inset image.
  return (
    <div
      className={`flex-shrink-0 ${className}`}
      style={{
        ...style,
        clipPath: clip,
        backgroundColor: borderWidth > 0 ? borderColor : "transparent",
        filter: shadow
          ? "drop-shadow(0 6px 16px rgba(15, 23, 42, 0.18))"
          : undefined,
      }}
    >
      <div
        className="w-full h-full overflow-hidden bg-slate-100"
        style={{ clipPath: clip, padding: borderWidth }}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          fallback
        )}
      </div>
    </div>
  );
}
