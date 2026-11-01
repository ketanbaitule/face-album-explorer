"use client";

import { useMemo, useState } from "react";
import { Search, ScanFace } from "lucide-react";

import { Input } from "@/components/ui/input";
import { GalleryItem } from "./gallery-item";
import type { FaceGalleryItem } from "@/types/face";

interface FaceGalleryProps {
  albums: FaceGalleryItem[];
}

export function FaceGallery({ albums }: FaceGalleryProps) {
  const [search, setSearch] = useState("");

  const filteredAlbums = useMemo(
    () =>
      albums.filter((album) =>
        album.id.toLowerCase().includes(search.toLowerCase()),
      ),
    [albums, search],
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">Face albums</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {filteredAlbums.length} of {albums.length} albums
          </p>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search face ID..."
            className="pl-9"
          />
        </div>
      </div>

      {filteredAlbums.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredAlbums.map((album) => (
            <GalleryItem key={album.id} album={album} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-center">
          <ScanFace className="h-10 w-10 text-muted-foreground" />
          <p className="font-medium">No face albums found</p>
          <p className="text-sm text-muted-foreground">Try another face ID.</p>
        </div>
      )}
    </section>
  );
}
