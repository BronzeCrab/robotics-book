export type ExtractedChapter = {
  id: string;
  title: string;
  part: string;
  summary: string;
  html: string;
};

export type ExportLogger = {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
};
