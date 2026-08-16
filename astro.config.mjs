// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import astroExpressiveCode from "astro-expressive-code";
import { typst } from "astro-typst";
import ebookExport from "./src/integrations/ebook-export.ts";
import vue from "@astrojs/vue";
import templateCompilerOptions from "@tresjs/core/template-compiler-options";

export default defineConfig({
  site: "https://example.com",
  trailingSlash: "always",
  i18n: {
    defaultLocale: "ru",
    locales: ["ru", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    syntaxHighlight: false,
  },
  integrations: [
    astroExpressiveCode(),
    mdx(),
    vue({
      ...templateCompilerOptions,
    }),
    typst({
      options: {
        remPx: 16,
      },
      target: (id) => {
        if (id.includes("/figures/") || id.endsWith(".svg.typ")) return "svg";
        return "svg";
      },
    }),
    ebookExport(),
  ],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["@myriaddreamin/typst-ts-node-compiler"],
    },
  },
});
