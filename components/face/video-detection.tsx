"use client";

import { useEffect, useRef, useState } from "react";
import { Play, VideoOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { BoundingBoxOverlay } from "./bounding-box";
import { formatTimestamp, getMediaUrl } from "@/lib/media";
import type { VideoDetection } from "@/types/face";

interface VideoDetectionProps {
  videoPath: string;
  detections: VideoDetection[];
  showBoxes: boolean;
  mediaBaseUrl: string;
}

export function VideoDetectionGallery({
  videoPath,
  detections,
  showBoxes,
  mediaBaseUrl,
}: VideoDetectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [videoError, setVideoError] = useState(false);

  const sortedDetections = [...detections].sort(
    (a, b) => a.timestamp - b.timestamp,
  );

  const selected = sortedDetections[selectedIndex];

  useEffect(() => {
    setSelectedIndex(0);
    setVideoError(false);
    setDimensions({ width: 0, height: 0 });
  }, [videoPath]);

  function seekTo(timestamp: number, index: number) {
    setSelectedIndex(index);

    const video = videoRef.current;
    if (!video) return;

    // The metadata may not have loaded yet.
    const seek = () => {
      if (video.readyState >= 1) {
        video.currentTime = Math.max(0, timestamp);
      }
    };

    if (video.readyState >= 1) {
      seek();
    } else {
      video.addEventListener("loadedmetadata", seek, { once: true });
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="break-all font-semibold">{videoPath}</h3>
          <Badge variant="secondary">
            {sortedDetections.length} detections
          </Badge>
        </div>

        {sortedDetections.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No timestamped detections for this video.
          </p>
        ) : (
          <>
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-3">
                <p className="text-sm font-medium">Video player</p>

                {videoError ? (
                  <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-lg bg-muted text-muted-foreground">
                    <VideoOff className="h-8 w-8" />
                    <p className="text-sm">Unable to load video</p>
                  </div>
                ) : (
                  <video
                    ref={videoRef}
                    src={getMediaUrl(mediaBaseUrl, videoPath)}
                    controls
                    preload="metadata"
                    className="aspect-video w-full rounded-lg bg-black"
                    onLoadedMetadata={(event) => {
                      const video = event.currentTarget;
                      setDimensions({
                        width: video.videoWidth,
                        height: video.videoHeight,
                      });
                    }}
                    onError={() => setVideoError(true)}
                  />
                )}

                {selected && (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-muted-foreground">
                      Selected timestamp
                    </span>
                    <Badge>{selected.timestamp.toFixed(3)}s</Badge>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Selected detection</p>

                <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-muted">
                  {videoError ? (
                    <VideoOff className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <>
                      <video
                        src={getMediaUrl(mediaBaseUrl, videoPath)}
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 h-full w-full object-contain"
                        onLoadedMetadata={(event) => {
                          const video = event.currentTarget;
                          setDimensions({
                            width: video.videoWidth,
                            height: video.videoHeight,
                          });
                          video.currentTime = Math.max(
                            0,
                            selected?.timestamp ?? 0,
                          );
                        }}
                        onSeeked={(event) => {
                          // Force a redraw of the preview frame.
                          event.currentTarget.style.visibility = "visible";
                        }}
                      />

                      {selected && dimensions.width > 0 && (
                        <PreviewFrame
                          videoPath={videoPath}
                          timestamp={selected.timestamp}
                          bbox={selected.bbox}
                          showBoxes={showBoxes}
                          mediaBaseUrl={mediaBaseUrl}
                        />
                      )}
                    </>
                  )}
                </div>

                {selected && (
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-muted-foreground">
                        Bounding box:{" "}
                      </span>
                      <code>{JSON.stringify(selected.bbox ?? null)}</code>
                    </p>

                    {selected.similarity != null && (
                      <p>
                        <span className="text-muted-foreground">
                          Similarity:{" "}
                        </span>
                        {selected.similarity.toFixed(4)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-semibold">
                Detections — select a timestamp
              </h4>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {sortedDetections.map((detection, index) => (
                  <Button
                    key={`${detection.timestamp}-${index}`}
                    variant={index === selectedIndex ? "default" : "outline"}
                    size="sm"
                    onClick={() => seekTo(detection.timestamp, index)}
                  >
                    <Play className="mr-1 h-3 w-3" />
                    {formatTimestamp(detection.timestamp)}
                  </Button>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PreviewFrame({
  videoPath,
  timestamp,
  bbox,
  showBoxes,
  mediaBaseUrl,
}: {
  videoPath: string;
  timestamp: number;
  bbox?: VideoDetection["bbox"];
  showBoxes: boolean;
  mediaBaseUrl: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!video || !canvas || !context) return;

    let cancelled = false;

    const drawFrame = () => {
      if (cancelled || !video.videoWidth || !video.videoHeight) return;

      const width = video.videoWidth;
      const height = video.videoHeight;

      canvas.width = width;
      canvas.height = height;

      context.drawImage(video, 0, 0, width, height);

      if (showBoxes && bbox && bbox.length === 4) {
        const [x1, y1, x2, y2] = bbox;

        const left = Math.max(0, Math.min(x1, x2));
        const top = Math.max(0, Math.min(y1, y2));
        const right = Math.min(width, Math.max(x1, x2));
        const bottom = Math.min(height, Math.max(y1, y2));

        if (right > left && bottom > top) {
          context.strokeStyle = "#00ff00";
          context.lineWidth = Math.max(2, width / 400);

          context.strokeRect(left, top, right - left, bottom - top);
        }
      }
    };

    const seekToTimestamp = () => {
      if (cancelled) return;

      if (video.readyState < 2) return;

      if (Math.abs(video.currentTime - timestamp) < 0.02) {
        drawFrame();
      } else {
        video.currentTime = timestamp;
      }
    };

    video.addEventListener("loadeddata", seekToTimestamp);
    video.addEventListener("seeked", drawFrame);

    if (video.readyState >= 2) {
      seekToTimestamp();
    }

    return () => {
      cancelled = true;
      video.removeEventListener("loadeddata", seekToTimestamp);
      video.removeEventListener("seeked", drawFrame);
    };
  }, [videoPath, timestamp, bbox, showBoxes]);

  return (
    <>
      <video
        ref={videoRef}
        src={getMediaUrl(mediaBaseUrl, videoPath)}
        muted
        playsInline
        preload="metadata"
        className="hidden"
        crossOrigin="anonymous"
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full object-contain"
        aria-label={`Video frame at ${timestamp.toFixed(3)} seconds`}
      />
    </>
  );
}
