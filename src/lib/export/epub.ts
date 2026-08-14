import { writeFile } from "node:fs/promises";
import path from "node:path";
import { EPub } from "epub-gen-memory";
import { book } from "../site";
import type { ExtractedChapter } from "./types";

const epubCss = `
body { font-family: Georgia, "Times New Roman", serif; line-height: 1.55; }
h1 { font-size: 1.6em; page-break-before: always; }
h2 { font-size: 1.25em; }
code, pre { font-family: "Courier New", monospace; font-size: 0.9em; }
pre { white-space: pre-wrap; }
svg { max-width: 100%; height: auto; }
img { max-width: 100%; }
figure { margin: 1em 0; }
figcaption { font-size: 0.9em; color: #555; text-align: center; }
.chapter-kicker { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.85em; }
.chapter-lede { font-style: italic; color: #444; }
.eq-display { text-align: center; margin: 1em 0; }
.book-video-frame { display: none; }
.book-video-link { margin: 0.5em 0; }
.book-scene-frame { display: none; }
.book-scene-fallback { display: block; margin: 0.5em 0; }
`;

export async function writeEpub(distDir: string, chapters: ExtractedChapter[]) {
  const generator = new EPub(
    {
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      description: book.description,
      lang: book.language,
      tocTitle: "Оглавление",
      prependChapterTitles: false,
      version: 3,
      css: epubCss,
      verbose: false,
    },
    chapters.map((chapter) => ({
      title: chapter.title,
      filename: chapter.id,
      content: chapter.html,
    })),
  );
  const buffer = await generator.genEpub();

  const out = path.join(distDir, "downloads", `${book.filename}.epub`);
  await writeFile(out, buffer);
  return out;
}
