import Link from "next/link";
import Image from "next/image";
import { Camera, Film, ScanFace } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FaceGalleryItem } from "@/types/face";
import { FaceThumbnail } from "./face-thumbnail";

interface GalleryItemProps {
  album: FaceGalleryItem;
}

export function GalleryItem({ album }: GalleryItemProps) {
  return (
    <Link
      href={`/face/${encodeURIComponent(album.id)}`}
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full overflow-hidden border-border/70 transition-all group-hover:-translate-y-1 group-hover:border-primary/50 group-hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {album.thumbnail ? (
            <FaceThumbnail
              src={album.thumbnail}
              bbox={album.thumbnailBbox}
              alt={`Face thumbnail for ${album.id}`}
              paddingPercent={30}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ScanFace className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}

          <Badge className="absolute left-3 top-3">{album.id}</Badge>
        </div>

        <CardContent className="space-y-3 p-4">
          <h3 className="truncate font-semibold">{album.id}</h3>

          <div className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Camera className="h-3.5 w-3.5" />
              {album.photoCount} photos
            </span>

            <span className="flex items-center gap-1">
              <Film className="h-3.5 w-3.5" />
              {album.videoCount} videos
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            {album.detectionCount} video detections
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
