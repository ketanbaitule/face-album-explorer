import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const isSettingsPage = pathname.startsWith("/settings");

  const mediaBaseUrl = searchParams.get("MEDIA_BASE_URL");
  const faceJsonUrl = searchParams.get("FACE_JSON_URL");

  // Settings page is always accessible.
  if (isSettingsPage) {
    return NextResponse.next();
  }

  // Configuration parameters supplied.
  if (mediaBaseUrl || faceJsonUrl) {
    const isValid = (() => {
      try {
        if (!mediaBaseUrl || !faceJsonUrl) return false;

        const mediaUrl = new URL(mediaBaseUrl);
        const faceUrl = new URL(faceJsonUrl);

        return (
          ["http:", "https:"].includes(mediaUrl.protocol) &&
          ["http:", "https:"].includes(faceUrl.protocol)
        );
      } catch {
        return false;
      }
    })();

    // Invalid parameters: redirect to settings with values.
    if (!isValid) {
      const settingsUrl = new URL("/settings", request.url);

      if (mediaBaseUrl) {
        settingsUrl.searchParams.set("MEDIA_BASE_URL", mediaBaseUrl);
      }

      if (faceJsonUrl) {
        settingsUrl.searchParams.set("FACE_JSON_URL", faceJsonUrl);
      }

      const returnUrl = request.nextUrl.clone();
      returnUrl.searchParams.delete("MEDIA_BASE_URL");
      returnUrl.searchParams.delete("FACE_JSON_URL");

      settingsUrl.searchParams.set(
        "redirect",
        returnUrl.pathname + returnUrl.search,
      );

      return NextResponse.redirect(settingsUrl);
    }

    // Valid parameters: save cookies.
    const cleanUrl = request.nextUrl.clone();

    cleanUrl.searchParams.delete("MEDIA_BASE_URL");
    cleanUrl.searchParams.delete("FACE_JSON_URL");

    const response = NextResponse.redirect(cleanUrl);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    };

    response.cookies.set("MEDIA_BASE_URL", mediaBaseUrl!, cookieOptions);
    response.cookies.set("FACE_JSON_URL", faceJsonUrl!, cookieOptions);

    return response;
  }

  // Check existing cookies.
  const mediaCookie = request.cookies.get("MEDIA_BASE_URL")?.value;
  const faceCookie = request.cookies.get("FACE_JSON_URL")?.value;

  if (!mediaCookie || !faceCookie) {
    return NextResponse.redirect(new URL("/settings", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
