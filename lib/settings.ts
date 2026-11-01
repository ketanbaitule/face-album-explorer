import { AppSettings } from "@/types/settings";
import { cookies } from "next/headers";

export async function getSettings(): Promise<AppSettings> {
  const cookieStore = await cookies();

  return {
    mediaBaseUrl: cookieStore.get("MEDIA_BASE_URL")?.value ?? "",
    faceJsonUrl: cookieStore.get("FACE_JSON_URL")?.value ?? "",
  };
}
