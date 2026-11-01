export type BoundingBox = [number, number, number, number];

export interface ImageRecord {
  image: string;
  bbox?: BoundingBox;
  detection_confidence?: number;
}

export interface VideoDetection {
  timestamp: number;
  bbox?: BoundingBox;
  similarity?: number;
}

export interface FaceAlbum {
  images: ImageRecord[];
  videos: Record<string, VideoDetection[]>;
}

export type FaceAnalysis = Record<string, FaceAlbum>;

// export interface FaceGalleryItem {
//   id: string;
//   thumbnail?: string;
//   photoCount: number;
//   videoCount: number;
//   detectionCount: number;
// }

export interface FaceGalleryItem {
  id: string;
  thumbnail?: string;
  thumbnailBbox?: BoundingBox;
  photoCount: number;
  videoCount: number;
  detectionCount: number;
}
