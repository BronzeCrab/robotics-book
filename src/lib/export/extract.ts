import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { load } from "cheerio";
import type { ExtractedChapter } from "./types";
import { defaultLocale, type Locale } from "../i18n";

function rewriteLocalUrls(html: string, distDir: string) {
  const $ = load(html, { decodeEntities: false });
  $("script").remove();
  $("link[rel='stylesheet']").remove();

  $("[src], [href]").each((_, el) => {
    const node = $(el);
    for (const attr of ["src", "href"] as const) {
      const value = node.attr(attr);
      if (!value || value.startsWith("data:") || value.startsWith("http") || value.startsWith("file:")) {
        continue;
      }
      if (value.startsWith("/")) {
        const filePath = path.join(distDir, decodeURIComponent(value.split("?")[0] ?? value));
        node.attr(attr, pathToFileURL(filePath).href);
      }
    }
  });

  return $.root().html() ?? html;
}

export async function extractChapters(
  distDir: string,
  locale: Locale = defaultLocale,
): Promise<ExtractedChapter[]> {
  const chaptersDir =
    locale === defaultLocale
      ? path.join(distDir, "chapters")
      : path.join(distDir, locale, "chapters");

  let slugs: string[] = [];
  try {
    slugs = (await readdir(chaptersDir, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch {
    return [];
  }

  const chapters: ExtractedChapter[] = [];
  for (const slug of slugs) {
    const file = path.join(chaptersDir, slug, "index.html");
    const source = await readFile(file, "utf8");
    const $ = load(source);
    const body = $(".chapter-body");
    body.find("script, nav.pager").remove();
    chapters.push({
      id: slug,
      title: body.find("h1").first().text().trim(),
      part: body.find(".chapter-kicker").first().text().trim(),
      summary: body.find(".chapter-lede").first().text().trim(),
      html: rewriteLocalUrls(body.html() ?? "", distDir),
    });
  }
  return chapters;
}

export async function collectEbookCss(distDir: string) {
  const chunks: string[] = [];
  const astroDir = path.join(distDir, "_astro");
  try {
    const files = await readdir(astroDir);
    for (const file of files) {
      if (file.endsWith(".css")) {
        chunks.push(await readFile(path.join(astroDir, file), "utf8"));
      }
    }
  } catch {
    // no bundled css yet
  }
  return chunks.join("\n");
}
