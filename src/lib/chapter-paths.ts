import { chapterSlug, getChapters, type Chapter } from "./chapters";
import type { Locale } from "./i18n";

export async function chapterStaticPaths(locale: Locale) {
  const chapters = await getChapters(locale);
  return chapters.map((chapter: Chapter) => ({
    params: { slug: chapterSlug(chapter) },
    props: { chapter, chapters },
  }));
}
