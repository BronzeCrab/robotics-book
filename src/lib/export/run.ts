import { mkdir } from "node:fs/promises";
import path from "node:path";
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

  const chapters = await extractChapters(distDir);
  if (chapters.length === 0) {
    logger.warn("Нет глав для экспорта");
    return;
  }

  logger.info(`Экспорт ${chapters.length} гл. → EPUB, FB2, HTML, PDF, ZIP`);

  await writeEpub(distDir, chapters);
  logger.info("EPUB готов");

  await writeFb2(distDir, chapters);
  logger.info("FB2 готов");

  await writeSingleHtml(distDir, chapters);
  logger.info("HTML готов");

  const pdf = await writePdf(distDir, logger);
  if (pdf) logger.info("PDF готов");

  await writeSiteZip(distDir);
  logger.info("ZIP готов");
}
