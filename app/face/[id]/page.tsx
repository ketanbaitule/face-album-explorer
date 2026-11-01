import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FaceAlbum } from "@/components/face/face-album";
import { getFaceAnalysis } from "@/lib/face-data";
import { getSettings } from "@/lib/settings";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const instant = false;

export default async function FacePage({ params }: PageProps) {
  const { id } = await params;
  const appSetting = await getSettings();

  let faceData;

  try {
    faceData = await getFaceAnalysis(appSetting.faceJsonUrl);
  } catch {
    return (
      <main className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="text-2xl font-bold">Unable to load face album</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Check that the face analysis JSON server is running.
        </p>
        <Button variant="outline" className="mt-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to gallery
          </Link>
        </Button>
      </main>
    );
  }

  const album = faceData[id];

  if (!album) notFound();

  return (
    <FaceAlbum
      faceId={id}
      album={album}
      mediaBaseUrl={appSetting.mediaBaseUrl}
    />
  );
}
