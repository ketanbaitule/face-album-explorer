import type { FaceAnalysis, FaceGalleryItem } from "@/types/face";
import { getMediaUrl } from "@/lib/media";

export async function getFaceAnalysis(
  faceJsonUrl: string,
): Promise<FaceAnalysis> {
  const response = await fetch(faceJsonUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Unable to load face analysis JSON (${response.status})`);
  }

  const data: unknown = await response.json();

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("The face analysis JSON must contain an object.");
  }

  return data as FaceAnalysis;
}

export function getGalleryItems(
  mediaBaseUrl: string,
  data: FaceAnalysis,
): FaceGalleryItem[] {
  return Object.entries(data)
    .map(([id, album]) => {
      const firstImage = album.images?.[0];
      const videos = album.videos ?? {};

      return {
        id,
        thumbnail: firstImage?.image
          ? getMediaUrl(mediaBaseUrl, firstImage.image)
          : undefined,
        thumbnailBbox: firstImage?.bbox,
        photoCount: album.images?.length ?? 0,
        videoCount: Object.keys(videos).length,
        detectionCount: Object.values(videos).reduce(
          (total, detections) =>
            total + (Array.isArray(detections) ? detections.length : 0),
          0,
        ),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}
