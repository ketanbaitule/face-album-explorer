import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Face Album Explorer",
  description: "Browse face albums, photos, and video detections.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
