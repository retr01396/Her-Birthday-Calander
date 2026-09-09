"use client";

import { useState } from "react";
import type { MemoryPhoto } from "@/lib/birthday/config";

/**
 * PolaroidImage — renders a configured photo inside the polaroid frame.
 * - object-fit: cover + center so portrait/landscape/square photos never distort
 * - if the file is missing or fails to load, falls back to the illustrated
 *   placeholder (no broken-image icon, no crash)
 */
export function PolaroidImage({
  photo,
  className,
  sizesHint,
}: {
  photo: MemoryPhoto;
  className?: string;
  sizesHint?: string;
}) {
  const [failed, setFailed] = useState(false);

  // An obviously-invalid entry (empty path) falls back before even trying.
  if (!photo.image || failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/birthday/photos/polaroid-1.svg"
        alt={photo.caption}
        className={className ?? "bday-polaroid-img"}
        draggable={false}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo.image}
      alt={photo.caption}
      className={className ?? "bday-polaroid-img"}
      style={{ objectFit: "cover", objectPosition: "center" }}
      onError={() => setFailed(true)}
      draggable={false}
      loading="lazy"
    />
  );
}
