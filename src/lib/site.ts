export const book = {
  title: "Книга по робототехнике",
  author: "Черновик",
  language: "ru",
  description:
    "Открытый конспект: геометрия манипуляторов, формулы на Typst и рабочие примеры на Python.",
  filename: "kniga-po-robototehnike",
  publisher: "robotics-book",
} as const;

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

export const ebookFormats: EbookFormat[] = [
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
];

export function downloadHref(format: EbookFormat) {
  return `/downloads/${book.filename}.${format.ext}`;
}
