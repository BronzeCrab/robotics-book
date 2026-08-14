import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { book } from "../site";

async function addDir(zip: JSZip, dir: string, prefix: string) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      await addDir(zip, full, rel);
      continue;
    }
    if (entry.name.endsWith(".zip")) continue;
    zip.file(rel, await readFile(full));
  }
}

export async function writeSiteZip(distDir: string) {
  const zip = new JSZip();
  const entries = await readdir(distDir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(distDir, entry.name);
    if (entry.isDirectory()) {
      await addDir(zip, full, entry.name);
      continue;
    }
    if (entry.name.endsWith(".zip")) continue;
    const info = await stat(full);
    if (!info.isFile()) continue;
    zip.file(entry.name, await readFile(full));
  }

  const out = path.join(distDir, "downloads", `${book.filename}.zip`);
  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  await writeFile(out, buffer);
  return out;
}
