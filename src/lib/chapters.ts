import { getCollection, type CollectionEntry } from "astro:content";

export type Chapter = CollectionEntry<"chapters">;

export async function getChapters(): Promise<Chapter[]> {
  const chapters = await getCollection("chapters");
  return chapters.sort((a, b) => a.data.order - b.data.order);
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
