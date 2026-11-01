export function getMediaUrl(mediaBaseUrl: string, path: string): string {
  // Support absolute URLs returned by the JSON.
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  // Support paths such as /photos/person.jpg and photos/person.jpg.
  const normalizedPath = path
    .replace(/\\/g, "/")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${mediaBaseUrl}/${normalizedPath.replace(/^\/+/, "")}`;
}

export function getFileName(path: string): string {
  return path.replace(/\\/g, "/").split("/").pop() ?? path;
}

export function formatTimestamp(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  const pad = (value: number) => String(value).padStart(2, "0");

  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
    : `${pad(minutes)}:${pad(secs)}`;
}
