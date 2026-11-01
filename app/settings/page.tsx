import { SettingsForm } from "./settings-form";

interface PageProps {
  searchParams: Promise<{
    MEDIA_BASE_URL?: string;
    FACE_JSON_URL?: string;
    redirect?: string;
  }>;
}

export const instant = false;

export default async function SettingsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-2xl font-bold">Application Settings</h1>

      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Configure your media and face JSON server URLs.
      </p>

      <SettingsForm
        mediaBaseUrl={params.MEDIA_BASE_URL || ""}
        faceJsonUrl={params.FACE_JSON_URL || ""}
        redirectTo={params.redirect || "/"}
      />
    </main>
  );
}
