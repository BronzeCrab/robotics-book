export const locales = ["ru", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ru";

export function isLocale(value: string | undefined): value is Locale {
  return value === "ru" || value === "en";
}

export function asLocale(value: string | undefined): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "ru" ? "en" : "ru";
}

/** Path without a locale prefix, always starting with `/`. */
export function stripLocale(pathname: string): string {
  for (const locale of locales) {
    if (locale === defaultLocale) continue;
    if (pathname === `/${locale}` || pathname === `/${locale}/`) return "/";
    if (pathname.startsWith(`/${locale}/`)) {
      const rest = pathname.slice(locale.length + 1);
      return rest.startsWith("/") ? rest : `/${rest}`;
    }
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function localePath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  if (clean === "/") return `/${locale}/`;
  return `/${locale}${clean}`;
}

const ru = {
  skipToContent: "К содержанию",
  toc: "Оглавление",
  downloads: "Скачать",
  navAria: "Разделы",
  themeToggle: "Переключить тему",
  langToEn: "Switch to English",
  langToRu: "Переключить на русский",
  pagerPrev: "Назад",
  pagerNext: "Дальше",
  pagerAria: "Соседние главы",
  startReading: "Начать читать",
  draft: "Черновик",
  homeLede:
    "Открытый конспект: геометрия манипуляторов, формулы на Typst и рабочие примеры на Python.",
  downloadPageTitle: "Скачать",
  downloadKicker: "Экспорт",
  downloadHeading: "Скачать книгу",
  downloadLede:
    "Файлы собираются вместе с сайтом (`pnpm build`) из тех же глав: формулы уже отрисованы, код уже подсвечен.",
  downloadWhyTitle: "Что не генерируем и почему",
  downloadWhyBody:
    "MOBI и AZW3 больше не нужны: Amazon Kindle принимает EPUB. Kobo читает EPUB напрямую, отдельный KEPUB не собираем. PDF печатается из HTML-вёрстки A4 — это тот же текст, что на сайте.",
  downloadPrintBefore: "Для печати из браузера без файла: ",
  downloadPrintLink: "открыть версию для печати",
  downloadNote:
    "Имена файлов: `{file}.pdf` и так далее в `/downloads/`. Если ссылка 404, сначала выполните `pnpm build`.",
  printKicker: "Книга",
  printTitle: "Печать",
  videoLink: "Видео",
  videoFile: "файл",
  sceneFallback:
    "Интерактивная 3D-сцена. Откройте главу на сайте, чтобы вращать модель.",
  epubToc: "Оглавление",
} as const;

export type UiKey = keyof typeof ru;

const en: Record<UiKey, string> = {
  skipToContent: "Skip to content",
  toc: "Contents",
  downloads: "Download",
  navAria: "Sections",
  themeToggle: "Toggle theme",
  langToEn: "Switch to English",
  langToRu: "Переключить на русский",
  pagerPrev: "Previous",
  pagerNext: "Next",
  pagerAria: "Adjacent chapters",
  startReading: "Start reading",
  draft: "Draft",
  homeLede:
    "Open notes: manipulator geometry, Typst formulas, and working Python examples.",
  downloadPageTitle: "Download",
  downloadKicker: "Export",
  downloadHeading: "Download the book",
  downloadLede:
    "Files are built with the site (`pnpm build`) from the same chapters: formulas already drawn, code already highlighted.",
  downloadWhyTitle: "What we do not generate, and why",
  downloadWhyBody:
    "MOBI and AZW3 are no longer needed: Amazon Kindle takes EPUB. Kobo reads EPUB directly, so we do not build a separate KEPUB. The PDF is printed from the A4 HTML layout — the same text as on the site.",
  downloadPrintBefore: "To print from the browser without a file: ",
  downloadPrintLink: "open the print version",
  downloadNote:
    "File names: `{file}.pdf` and so on under `/downloads/`. If the link is 404, run `pnpm build` first.",
  printKicker: "Book",
  printTitle: "Print",
  videoLink: "Video",
  videoFile: "file",
  sceneFallback:
    "Interactive 3D scene. Open the chapter on the site to rotate the model.",
  epubToc: "Contents",
};

export const ui = { ru, en } as const;

export function t(locale: string | undefined, key: UiKey): string {
  return ui[asLocale(locale)][key];
}
