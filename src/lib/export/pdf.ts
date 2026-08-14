import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { book } from "../site";
import type { ExportLogger } from "./types";

export async function writePdf(distDir: string, logger: ExportLogger) {
  const out = path.join(distDir, "downloads", `${book.filename}.pdf`);
  const script = path.join(process.cwd(), "scripts", "export-pdf.mjs");

  const code = await new Promise<number>((resolve) => {
    const child = spawn(process.execPath, [script, distDir, out], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("close", (exitCode) => {
      if (stderr.trim()) logger.warn(stderr.trim());
      resolve(exitCode ?? 1);
    });
  });

  if (code === 0) return out;

  logger.warn("PDF не собран. Нужен Chrome или Edge, либо: pnpm exec playwright install chromium");
  await writeFile(
    `${out}.txt`,
    "PDF не собран. Нужен Chrome или Edge, либо: pnpm exec playwright install chromium\n",
    "utf8",
  );
  return null;
}
