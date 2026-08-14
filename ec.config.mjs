import { defineEcConfig } from "astro-expressive-code";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";

export default defineEcConfig({
  themes: ["one-light", "one-dark-pro"],
  plugins: [pluginLineNumbers()],
  defaultProps: {
    wrap: true,
    showLineNumbers: false,
    overridesByLang: {
      "python,py": {
        showLineNumbers: true,
      },
    },
  },
  useDarkModeMediaQuery: false,
  themeCssSelector: (theme) =>
    theme.type === "dark"
      ? "[data-theme='dark']"
      : ":root:not([data-theme='dark'])",
  styleOverrides: {
    codeFontFamily:
      "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
    uiFontFamily:
      "'Source Serif 4 Variable', 'Source Serif 4', Georgia, serif",
  },
});
