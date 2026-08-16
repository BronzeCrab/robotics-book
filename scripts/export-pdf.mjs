import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright-core");

const distDir = process.argv[2];
const outFile = process.argv[3];
const printPath = process.argv[4] || "/print/";
if (!distDir || !outFile) {
  console.error("usage: export-pdf.mjs <distDir> <outFile> [printPath]");
  process.exit(1);
}

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://127.0.0.1");
  let filePath = path.join(distDir, decodeURIComponent(url.pathname));
  if (filePath.endsWith(path.sep) || !path.extname(filePath)) {
    filePath = path.join(filePath, "index.html");
  }
  try {
    const data = await readFile(filePath);
    res.writeHead(200, {
      "content-type": mime[path.extname(filePath)] ?? "application/octet-stream",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
if (!address || typeof address === "string") {
  throw new Error("no port");
}

const channels = ["msedge", "chrome", "chromium"];
let browser;
for (const channel of channels) {
  try {
    browser = await chromium.launch({ channel, headless: true });
    break;
  } catch {
    // try next
  }
}
if (!browser) {
  throw new Error(
    "Не найден Chrome/Edge. Выполните: pnpm exec playwright install chromium",
  );
}

const page = await browser.newPage();
await page.emulateMedia({ media: "print" });
await page.goto(`http://127.0.0.1:${address.port}${printPath}`, {
  waitUntil: "networkidle",
});
await page.pdf({
  path: outFile,
  format: "A4",
  printBackground: true,
  margin: { top: "16mm", bottom: "18mm", left: "14mm", right: "16mm" },
});
await browser.close();
await new Promise((resolve) => server.close(resolve));
