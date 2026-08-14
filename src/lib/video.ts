import { resolveMediaUrl } from "./media";

export type VideoKind = "youtube" | "vimeo" | "file";

export type ParsedVideo = {
  kind: VideoKind;
  /** URL for the playable embed or file */
  embedSrc: string;
  /** Canonical watch/open URL for fallbacks and print */
  watchUrl: string;
  providerLabel: string;
};

function youtubeId(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1).split("/")[0] ?? "";
    }
    if (url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtube-nocookie.com")) {
      if (url.searchParams.get("v")) return url.searchParams.get("v") ?? "";
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" || parts[0] === "shorts" || parts[0] === "live") {
        return parts[1] ?? "";
      }
    }
  } catch {
    return "";
  }
  return "";
}

function vimeoId(value: string) {
  try {
    const url = new URL(value);
    if (!url.hostname.endsWith("vimeo.com")) return "";
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts[0] === "video" ? parts[1] : parts[0];
    return id && /^\d+$/.test(id) ? id : "";
  } catch {
    return "";
  }
}

export function parseVideoSrc(src: string): ParsedVideo {
  const trimmed = src.trim();
  const yt = youtubeId(trimmed);
  if (yt) {
    return {
      kind: "youtube",
      embedSrc: `https://www.youtube-nocookie.com/embed/${yt}`,
      watchUrl: `https://www.youtube.com/watch?v=${yt}`,
      providerLabel: "YouTube",
    };
  }

  const vimeo = vimeoId(trimmed);
  if (vimeo) {
    return {
      kind: "vimeo",
      embedSrc: `https://player.vimeo.com/video/${vimeo}`,
      watchUrl: `https://vimeo.com/${vimeo}`,
      providerLabel: "Vimeo",
    };
  }

  const fileSrc = resolveMediaUrl(trimmed, "videos");
  return {
    kind: "file",
    embedSrc: fileSrc,
    watchUrl: fileSrc,
    providerLabel: "файл",
  };
}
