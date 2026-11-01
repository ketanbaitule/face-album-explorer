import { FaceGallery } from "@/components/gallery/face-gallery";
import { Button } from "@/components/ui/button";
import { getFaceAnalysis, getGalleryItems } from "@/lib/face-data";
import { getSettings } from "@/lib/settings";
import { Images, Settings } from "lucide-react";
import Link from "next/link";

export const instant = false;

export default async function HomePage() {
  let albums;
  const appSetting = await getSettings();

  try {
    const data = await getFaceAnalysis(appSetting.faceJsonUrl);
    albums = getGalleryItems(appSetting.mediaBaseUrl, data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return (
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">
            Face Album Explorer
          </h1>

          <Button variant="outline">
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </header>

        <div className="mt-8 rounded-xl border border-destructive/40 p-6">
          <h2 className="font-semibold">Unable to load face albums</h2>

          <p className="mt-2 text-sm text-muted-foreground">{message}</p>

          <p className="mt-2 text-sm text-muted-foreground">
            Check that your JSON is available at the configured media URL.
          </p>

          <Button variant="outline" className="mt-5">
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-primary/10 p-3">
            <Images className="h-7 w-7 text-primary" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Face Album Explorer
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Browse detected faces, photos, and video appearances.
            </p>
          </div>
        </div>

        <Button variant="outline">
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
          </Link>
        </Button>
      </header>

      <FaceGallery albums={albums} />
    </main>
  );
}
