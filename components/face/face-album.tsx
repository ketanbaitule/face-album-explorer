"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, Film } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

import { BoundingBoxToggle } from "@/components/shared/bounding-box-toggle";
import { PhotoGallery } from "./photo-gallery";
import { VideoDetectionGallery } from "./video-detection";

import type { FaceAlbum as FaceAlbumType } from "@/types/face";

interface FaceAlbumProps {
  faceId: string;
  album: FaceAlbumType;
  mediaBaseUrl: string;
}

export function FaceAlbum({ faceId, album, mediaBaseUrl }: FaceAlbumProps) {
  const [showBoxes, setShowBoxes] = useState(true);

  const images = album.images ?? [];
  const videos = album.videos ?? {};
  const videoEntries = Object.entries(videos).filter(([, detections]) =>
    Array.isArray(detections),
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 sticky top-0 bg-white z-[1] mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-3">
          <Button variant="ghost" className="-ml-3">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All face albums
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Album: {faceId}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Explore photos, video appearances, and detections.
            </p>
          </div>
        </div>

        <BoundingBoxToggle checked={showBoxes} onCheckedChange={setShowBoxes} />
      </div>
      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <Separator />

        <Tabs defaultValue="photos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="photos">
              <Camera className="mr-2 h-4 w-4" />
              Photos ({images.length})
            </TabsTrigger>

            <TabsTrigger value="videos">
              <Film className="mr-2 h-4 w-4" />
              Videos ({videoEntries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos">
            <PhotoGallery
              images={images}
              showBoxes={showBoxes}
              mediaBaseUrl={mediaBaseUrl}
            />
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            {videoEntries.length ? (
              videoEntries.map(([videoPath, detections]) => (
                <VideoDetectionGallery
                  key={videoPath}
                  videoPath={videoPath}
                  detections={detections}
                  showBoxes={showBoxes}
                  mediaBaseUrl={mediaBaseUrl}
                />
              ))
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No video detections available for this face.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
