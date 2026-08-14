import type { AstroIntegration } from "astro";
import { fileURLToPath } from "node:url";
import { exportEbooks } from "../lib/export/run";

export default function ebookExport(): AstroIntegration {
  return {
    name: "ebook-export",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        await exportEbooks(fileURLToPath(dir), logger);
      },
    },
  };
}
