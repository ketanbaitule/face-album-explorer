"use client";

import type { BoundingBox } from "@/types/face";

interface BoundingBoxOverlayProps {
  bbox?: BoundingBox;
  imageWidth: number;
  imageHeight: number;
  visible: boolean;
}

export function BoundingBoxOverlay({
  bbox,
  imageWidth,
  imageHeight,
  visible,
}: BoundingBoxOverlayProps) {
  if (
    !visible ||
    !bbox ||
    bbox.length !== 4 ||
    imageWidth <= 0 ||
    imageHeight <= 0 ||
    !bbox.every(Number.isFinite)
  ) {
    return null;
  }

  const [x1, y1, x2, y2] = bbox;

  const left = Math.max(0, Math.min(x1, x2));
  const top = Math.max(0, Math.min(y1, y2));
  const right = Math.min(imageWidth, Math.max(x1, x2));
  const bottom = Math.min(imageHeight, Math.max(y1, y2));

  if (right <= left || bottom <= top) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute border-[3px] border-green-500"
      style={{
        left: `${(left / imageWidth) * 100}%`,
        top: `${(top / imageHeight) * 100}%`,
        width: `${((right - left) / imageWidth) * 100}%`,
        height: `${((bottom - top) / imageHeight) * 100}%`,
      }}
    />
  );
}
