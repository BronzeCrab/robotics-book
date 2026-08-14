import { writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import sharp from "sharp";
import { book } from "../site";
import type { ExtractedChapter } from "./types";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

type Binary = { id: string; contentType: string; data: string };

export async function writeFb2(distDir: string, chapters: ExtractedChapter[]) {
  const binaries: Binary[] = [];
  const sections: string[] = [];

  for (const chapter of chapters) {
    const $ = load(chapter.html, { decodeEntities: false });
    $("script, style, link").remove();

    const svgs = $("svg").toArray();
    for (const [index, svgEl] of svgs.entries()) {
      const markup = $.html(svgEl) ?? "";
      try {
        const png = await sharp(Buffer.from(markup)).png().toBuffer();
        const id = `${chapter.id}-img-${index + 1}`;
        binaries.push({ id, contentType: "image/png", data: png.toString("base64") });
        $(svgEl).replaceWith(`<image l:href="#${id}"/>`);
      } catch {
        $(svgEl).remove();
      }
    }

    const blocks: string[] = [];
    $("h1, h2, h3, p, figcaption, li, pre, image").each((_, el) => {
      const tag = el.type === "tag" ? el.tagName.toLowerCase() : "";
      if (tag === "image") {
        blocks.push($.html(el) ?? "");
        return;
      }
      const text = $(el).text().trim();
      if (!text) return;
      if (tag === "h1" || tag === "h2" || tag === "h3") {
        blocks.push(`<title><p>${escapeXml(text)}</p></title>`);
        return;
      }
      if (tag === "pre") {
        for (const line of text.split("\n")) {
          blocks.push(`<p>${escapeXml(line || " ")}</p>`);
        }
        return;
      }
      blocks.push(`<p>${escapeXml(text)}</p>`);
    });

    sections.push(
      `<section>
        <title><p>${escapeXml(chapter.title)}</p></title>
        ${chapter.summary ? `<p>${escapeXml(chapter.summary)}</p>` : ""}
        ${blocks.join("\n")}
      </section>`,
    );
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink">
  <description>
    <title-info>
      <genre>science</genre>
      <author><nickname>${escapeXml(book.author)}</nickname></author>
      <book-title>${escapeXml(book.title)}</book-title>
      <annotation><p>${escapeXml(book.description)}</p></annotation>
      <lang>${book.language}</lang>
    </title-info>
    <document-info>
      <author><nickname>${escapeXml(book.author)}</nickname></author>
      <date>${new Date().toISOString().slice(0, 10)}</date>
      <program-used>robotics-book export</program-used>
    </document-info>
  </description>
  <body>
    ${sections.join("\n")}
  </body>
  ${binaries
    .map(
      (binary) =>
        `<binary id="${binary.id}" content-type="${binary.contentType}">${binary.data}</binary>`,
    )
    .join("\n")}
</FictionBook>
`;

  const out = path.join(distDir, "downloads", `${book.filename}.fb2`);
  await writeFile(out, xml, "utf8");
  return out;
}
