"use client";

import { useEffect, useState } from "react";
import { ScanFace } from "lucide-react";
import type { BoundingBox } from "@/types/face";

interface FaceThumbnailProps {
  src: string;
  bbox?: BoundingBox;
  alt: string;
  paddingPercent?: number;
}

export function FaceThumbnail({
  src,
  bbox,
  alt,
  paddingPercent = 30,
}: FaceThumbnailProps) {
  const [croppedSrc, setCroppedSrc] = useState<string>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | undefined;

    setCroppedSrc(undefined);
    setFailed(false);

    const image = new window.Image();

    // The media server must permit cross-origin image access.
    image.crossOrigin = "anonymous";

    image.onload = () => {
      if (cancelled) return;

      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) throw new Error("Canvas unavailable");

        const imageWidth = image.naturalWidth;
        const imageHeight = image.naturalHeight;

        let x1 = 0;
        let y1 = 0;
        let x2 = imageWidth;
        let y2 = imageHeight;

        if (bbox && bbox.length === 4 && bbox.every(Number.isFinite)) {
          const [bx1, by1, bx2, by2] = bbox;

          const left = Math.min(bx1, bx2);
          const top = Math.min(by1, by2);
          const right = Math.max(bx1, bx2);
          const bottom = Math.max(by1, by2);

          const faceWidth = right - left;
          const faceHeight = bottom - top;

          if (faceWidth > 0 && faceHeight > 0) {
            const padX = (faceWidth * paddingPercent) / 100;
            const padY = (faceHeight * paddingPercent) / 100;

            x1 = Math.max(0, Math.floor(left - padX));
            y1 = Math.max(0, Math.floor(top - padY));
            x2 = Math.min(imageWidth, Math.ceil(right + padX));
            y2 = Math.min(imageHeight, Math.ceil(bottom + padY));
          }
        }

        const cropWidth = x2 - x1;
        const cropHeight = y2 - y1;

        if (cropWidth <= 0 || cropHeight <= 0) {
          throw new Error("Invalid face bounding box");
        }

        // Keep the thumbnail sharp without stretching it.
        const scale = Math.min(1, 400 / Math.max(cropWidth, cropHeight));

        canvas.width = Math.max(1, Math.round(cropWidth * scale));
        canvas.height = Math.max(1, Math.round(cropHeight * scale));

        context.drawImage(
          image,
          x1,
          y1,
          cropWidth,
          cropHeight,
          0,
          0,
          canvas.width,
          canvas.height,
        );

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

        if (!cancelled) {
          setCroppedSrc(dataUrl);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    image.onerror = () => {
      if (!cancelled) setFailed(true);
    };

    image.src = src;

    return () => {
      cancelled = true;

      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, bbox, paddingPercent]);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted">
        <ScanFace className="h-12 w-12 text-muted-foreground/50" />
      </div>
    );
  }

  if (!croppedSrc) {
    return <div className="h-full w-full animate-pulse bg-muted" />;
  }

  return (
    <img src={croppedSrc} alt={alt} className="h-full w-full object-contain" />
  );
}
