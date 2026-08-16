import { defaultLocale, type Locale } from "./i18n";

export type BookMeta = {
  title: string;
  author: string;
  language: Locale;
  description: string;
  filename: string;
  publisher: string;
};

export const books: Record<Locale, BookMeta> = {
  ru: {
    title: "Книга по робототехнике",
    author: "Черновик",
    language: "ru",
    description:
      "Открытый конспект: геометрия манипуляторов, формулы на Typst и рабочие примеры на Python.",
    filename: "kniga-po-robototehnike",
    publisher: "robotics-book",
  },
  en: {
    title: "A Book on Robotics",
    author: "Draft",
    language: "en",
    description:
      "Open notes: manipulator geometry, Typst formulas, and working Python examples.",
    filename: "robotics-book",
    publisher: "robotics-book",
  },
};

export function getBook(locale: Locale = defaultLocale) {
  return books[locale];
}

/** Default (Russian) edition — used when a locale is not passed. */
export const book = books.ru;

/**
 * Origin for heavy files (mp4, glb), without a trailing slash.
 * Empty = files from this site (`/videos/…`, `/models/…`).
 * Example: "https://media.example.com"
 */
export const media = {
  base: "",
} as const;

export type EbookFormatId = "pdf" | "epub" | "fb2" | "html" | "zip";

export type EbookFormat = {
  id: EbookFormatId;
  ext: string;
  title: string;
  blurb: string;
  readers: string;
};

const ebookFormatsByLocale: Record<Locale, EbookFormat[]> = {
  ru: [
    {
      id: "pdf",
      ext: "pdf",
      title: "PDF",
      blurb: "Печать и чтение на любом экране, страница A4.",
      readers: "Принтер, планшет, браузер",
    },
    {
      id: "epub",
      ext: "epub",
      title: "EPUB 3",
      blurb: "Основной формат электронных книг. Kindle теперь тоже берёт EPUB.",
      readers: "Kindle, Apple Books, Яндекс Книги, Kobo, PocketBook",
    },
    {
      id: "fb2",
      ext: "fb2",
      title: "FB2",
      blurb: "FictionBook — привычный формат читалок в рунете.",
      readers: "FBReader, Cool Reader, PocketBook, «Читай!», Литрес",
    },
    {
      id: "html",
      ext: "html",
      title: "HTML",
      blurb: "Вся книга одним файлом, открывается в браузере без сервера.",
      readers: "Любой браузер",
    },
    {
      id: "zip",
      ext: "zip",
      title: "Сайт (ZIP)",
      blurb: "Офлайн-копия веб-книги: оглавление, поиск по страницам, тёмная тема.",
      readers: "Распаковать и открыть index.html",
    },
  ],
  en: [
    {
      id: "pdf",
      ext: "pdf",
      title: "PDF",
      blurb: "Print and read on any screen, A4 pages.",
      readers: "Printer, tablet, browser",
    },
    {
      id: "epub",
      ext: "epub",
      title: "EPUB 3",
      blurb: "The main ebook format. Kindle now takes EPUB too.",
      readers: "Kindle, Apple Books, Kobo, PocketBook",
    },
    {
      id: "fb2",
      ext: "fb2",
      title: "FB2",
      blurb: "FictionBook — common in Russian-language readers.",
      readers: "FBReader, Cool Reader, PocketBook",
    },
    {
      id: "html",
      ext: "html",
      title: "HTML",
      blurb: "The whole book as one file, opens in a browser with no server.",
      readers: "Any browser",
    },
    {
      id: "zip",
      ext: "zip",
      title: "Site (ZIP)",
      blurb: "Offline copy of the web book: contents, in-page search, dark theme.",
      readers: "Unzip and open index.html",
    },
  ],
};

export function ebookFormats(locale: Locale = defaultLocale) {
  return ebookFormatsByLocale[locale];
}

export function downloadHref(format: EbookFormat, locale: Locale = defaultLocale) {
  const filename = format.id === "zip" ? books.ru.filename : getBook(locale).filename;
  return `/downloads/${filename}.${format.ext}`;
}
