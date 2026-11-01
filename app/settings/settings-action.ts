"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function saveSettings(formData: FormData): Promise<void> {
  const mediaBaseUrl = String(formData.get("MEDIA_BASE_URL") || "").trim();

  const faceJsonUrl = String(formData.get("FACE_JSON_URL") || "").trim();

  const redirectTo = String(formData.get("redirect") || "/");

  // Validate URLs
  try {
    const mediaUrl = new URL(mediaBaseUrl);
    const faceUrl = new URL(faceJsonUrl);

    if (
      !["http:", "https:"].includes(mediaUrl.protocol) ||
      !["http:", "https:"].includes(faceUrl.protocol)
    ) {
      throw new Error("Invalid URL protocol");
    }
  } catch {
    throw new Error("Please enter valid HTTP or HTTPS URLs.");
  }

  const cookieStore = await cookies();

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };

  cookieStore.set("MEDIA_BASE_URL", mediaBaseUrl, options);
  cookieStore.set("FACE_JSON_URL", faceJsonUrl, options);

  // Prevent external redirects
  const safeRedirect =
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//") &&
    !redirectTo.includes("\\")
      ? redirectTo
      : "/";

  redirect(safeRedirect);
}
