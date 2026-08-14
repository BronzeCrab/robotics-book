import { media } from "./site";

export function isAbsoluteUrl(src: string) {
  return /^(https?:)?\/\//i.test(src.trim());
}

/**
 * Local path (`arm.mp4`, `/videos/arm.mp4`) or a full CDN URL.
 * If `media.base` is set, relative paths are prefixed with it.
 */
export function resolveMediaUrl(src: string, folder?: "videos" | "models") {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;
  if (isAbsoluteUrl(trimmed)) return trimmed;

  const path = trimmed.startsWith("/")
    ? trimmed
    : folder
      ? `/${folder}/${trimmed}`
      : `/${trimmed}`;

  if (!media.base) return path;
  return `${media.base}${path}`;
}
