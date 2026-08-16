import { mkdir } from "node:fs/promises";
import path from "node:path";
import { locales, localePath, t } from "../i18n";
import { getBook } from "../site";
import { extractChapters } from "./extract";
import { writeEpub } from "./epub";
import { writeFb2 } from "./fb2";
import { writeSingleHtml } from "./html";
import { writePdf } from "./pdf";
import { writeSiteZip } from "./zip";
import type { ExportLogger } from "./types";

export async function exportEbooks(distDir: string, logger: ExportLogger) {
  const downloadsDir = path.join(distDir, "downloads");
  await mkdir(downloadsDir, { recursive: true });

  for (const locale of locales) {
    const book = getBook(locale);
    const chapters = await extractChapters(distDir, locale);
    if (chapters.length === 0) {
      logger.warn(`Нет глав для экспорта (${locale})`);
      continue;
    }

    logger.info(`${locale}: ${chapters.length} гл. → EPUB, FB2, HTML, PDF`);

    await writeEpub(distDir, chapters, book, t(locale, "epubToc"));
    logger.info(`EPUB (${locale}) готов`);

    await writeFb2(distDir, chapters, book);
    logger.info(`FB2 (${locale}) готов`);

    await writeSingleHtml(distDir, chapters, book);
    logger.info(`HTML (${locale}) готов`);

    const pdf = await writePdf(distDir, logger, book, localePath(locale, "/print/"));
    if (pdf) logger.info(`PDF (${locale}) готов`);
  }

  await writeSiteZip(distDir);
  logger.info("ZIP готов");
}
