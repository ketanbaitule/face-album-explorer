"use client";

import { saveSettings } from "./settings-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsFormProps {
  mediaBaseUrl: string;
  faceJsonUrl: string;
  redirectTo: string;
}

export function SettingsForm({
  mediaBaseUrl,
  faceJsonUrl,
  redirectTo,
}: SettingsFormProps) {
  return (
    <form action={saveSettings} className="max-w-xl space-y-5">
      <input type="hidden" name="redirect" value={redirectTo} />

      <div className="space-y-2">
        <Label htmlFor="MEDIA_BASE_URL">Media Base URL</Label>
        <Input
          id="MEDIA_BASE_URL"
          name="MEDIA_BASE_URL"
          type="url"
          defaultValue={mediaBaseUrl}
          placeholder="https://example.com/media"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="FACE_JSON_URL">Face JSON URL</Label>
        <Input
          id="FACE_JSON_URL"
          name="FACE_JSON_URL"
          type="url"
          defaultValue={faceJsonUrl}
          placeholder="https://example.com/faces.json"
          required
        />
      </div>

      <Button type="submit">Save Settings</Button>
    </form>
  );
}
