"use client";

import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { BoundingBoxOverlay } from "./bounding-box";
import { getFileName, getMediaUrl } from "@/lib/media";
import type { ImageRecord } from "@/types/face";

import { Download, Expand, ImageOff } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { BoundingBoxToggle } from "@/components/shared/bounding-box-toggle";

interface PhotoGalleryProps {
  images: ImageRecord[];
  showBoxes: boolean;
  mediaBaseUrl: string;
}

export function PhotoGallery({
  images,
  showBoxes,
  mediaBaseUrl,
}: PhotoGalleryProps) {
  if (!images.length) {
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">
        No photos available for this face.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {images.map((record, index) => (
        <PhotoCard
          key={`${record.image}-${index}`}
          record={record}
          showBoxes={showBoxes}
          mediaBaseUrl={mediaBaseUrl}
        />
      ))}
    </div>
  );
}

function PhotoCard({
  record,
  showBoxes,
  mediaBaseUrl,
}: {
  record: ImageRecord;
  showBoxes: boolean;
  mediaBaseUrl: string;
}) {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>();

  const [failed, setFailed] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogShowBoxes, setDialogShowBoxes] = useState(showBoxes);

  const imageUrl = getMediaUrl(mediaBaseUrl, record.image);
  const fileName = getFileName(record.image);

  async function downloadOriginal() {
    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error("Unable to download image");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback: open the original image in a new tab.
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="group block w-full cursor-zoom-in text-left"
          aria-label={`Expand ${fileName}`}
        >
          <div className="flex min-h-48 items-center justify-center bg-muted p-2">
            {failed ? (
              <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <ImageOff className="h-8 w-8" />
                <span className="text-xs">Unable to load photo</span>
              </div>
            ) : (
              <div className="relative inline-block max-h-[420px] max-w-full">
                <img
                  src={imageUrl}
                  alt={fileName}
                  className="block h-auto max-h-[420px] w-auto max-w-full object-contain"
                  onLoad={(event) => {
                    const image = event.currentTarget;

                    setDimensions({
                      width: image.naturalWidth,
                      height: image.naturalHeight,
                    });
                  }}
                  onError={() => setFailed(true)}
                />

                {dimensions && (
                  <BoundingBoxOverlay
                    bbox={record.bbox}
                    imageWidth={dimensions.width}
                    imageHeight={dimensions.height}
                    visible={showBoxes}
                  />
                )}

                <span className="absolute bottom-2 right-2 rounded-md bg-black/70 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  <Expand className="h-4 w-4" />
                </span>
              </div>
            )}
          </div>
        </button>

        <CardContent className="space-y-3 p-4">
          <p className="truncate text-sm font-medium">{fileName}</p>

          {record.detection_confidence != null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Confidence</span>
              <Badge variant="secondary">
                {Number(record.detection_confidence).toFixed(3)}
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDialogOpen(true)}
            >
              <Expand className="mr-2 h-4 w-4" />
              Expand
            </Button>

            <Button variant="outline" size="sm" onClick={downloadOriginal}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

          <Separator />

          <details className="text-xs">
            <summary className="cursor-pointer font-medium">
              Image details
            </summary>

            <div className="mt-3 space-y-2 break-words text-muted-foreground">
              <p>Path: {record.image}</p>
              <p>Bounding box: {JSON.stringify(record.bbox ?? null)}</p>
            </div>
          </details>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="
    flex flex-col gap-3 overflow-hidden
    h-[95dvh]
    w-[calc(100vw-1rem)]
    max-w-none
    sm:w-[95vw]
    sm:max-w-none
    lg:w-[90vw]
    xl:w-[85vw]
    p-4 sm:p-6
  "
        >
          <DialogHeader className="shrink-0 pr-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <DialogTitle className="truncate">{fileName}</DialogTitle>

              <BoundingBoxToggle
                checked={dialogShowBoxes}
                onCheckedChange={setDialogShowBoxes}
              />
            </div>
          </DialogHeader>

          <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-black/95">
            <div className="relative inline-block max-h-full max-w-full">
              <img
                src={imageUrl}
                alt={fileName}
                className="block max-h-[calc(95dvh-150px)] max-w-full object-contain"
                onLoad={(event) => {
                  const image = event.currentTarget;

                  setDimensions({
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                  });
                }}
              />

              {dimensions && (
                <BoundingBoxOverlay
                  bbox={record.bbox}
                  imageWidth={dimensions.width}
                  imageHeight={dimensions.height}
                  visible={dialogShowBoxes}
                />
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3">
            <p className="truncate text-xs text-muted-foreground">
              Original image · {dimensions?.width ?? "—"} ×{" "}
              {dimensions?.height ?? "—"}
            </p>

            <Button onClick={downloadOriginal}>
              <Download className="mr-2 h-4 w-4" />
              Download original
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
