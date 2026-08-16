import { getCollection, type CollectionEntry } from "astro:content";
import { asLocale, localePath, type Locale } from "./i18n";

export type Chapter = CollectionEntry<"chapters">;

export function chapterSlug(chapter: Chapter): string {
  const id = chapter.id.replaceAll("\\", "/");
  const slash = id.indexOf("/");
  return slash === -1 ? id : id.slice(slash + 1);
}

export function chapterLocale(chapter: Chapter): Locale {
  const id = chapter.id.replaceAll("\\", "/");
  return asLocale(id.split("/")[0]);
}

export async function getChapters(locale: Locale): Promise<Chapter[]> {
  const chapters = await getCollection(
    "chapters",
    (entry) => chapterLocale(entry) === locale,
  );
  return chapters.sort((a, b) => a.data.order - b.data.order);
}

export function chapterHref(locale: Locale, chapter: Chapter) {
  return localePath(locale, `/chapters/${chapterSlug(chapter)}/`);
}

export function neighbors(chapters: Chapter[], id: string) {
  const index = chapters.findIndex((chapter) => chapter.id === id);
  return {
    prev: index > 0 ? chapters[index - 1] : undefined,
    next: index >= 0 && index < chapters.length - 1 ? chapters[index + 1] : undefined,
  };
}

export function groupedByPart(chapters: Chapter[]) {
  const parts: { part: string; chapters: Chapter[] }[] = [];
  for (const chapter of chapters) {
    const last = parts.at(-1);
    if (!last || last.part !== chapter.data.part) {
      parts.push({ part: chapter.data.part, chapters: [chapter] });
    } else {
      last.chapters.push(chapter);
    }
  }
  return parts;
}
