import { writeFile } from "node:fs/promises";
import path from "node:path";
import { collectEbookCss } from "./extract";
import type { BookMeta } from "../site";
import type { ExtractedChapter } from "./types";

export async function writeSingleHtml(
  distDir: string,
  chapters: ExtractedChapter[],
  book: BookMeta,
) {
  const css = await collectEbookCss(distDir);
  const body = chapters
    .map(
      (chapter) => `
<section class="print-chapter" id="${chapter.id}">
  ${chapter.html}
</section>`,
    )
    .join("\n");

  const html = `<!doctype html>
<html lang="${book.language}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width" />
  <title>${book.title}</title>
  <style>
    :root { color-scheme: light; }
    body { margin: 0 auto; max-width: 65ch; padding: 2rem 1.25rem 4rem; font: 1.05rem/1.65 Georgia, serif; }
    .print-chapter { margin: 0 0 3rem; }
    svg { max-width: 100%; height: auto; }
    pre { white-space: pre-wrap; }
    ${css}
  </style>
</head>
<body>
  <h1>${book.title}</h1>
  <p>${book.description}</p>
  ${body}
</body>
</html>
`;

  const out = path.join(distDir, "downloads", `${book.filename}.html`);
  await writeFile(out, html, "utf8");
  return out;
}
