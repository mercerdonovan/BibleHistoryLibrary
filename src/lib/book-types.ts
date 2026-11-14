/**
 * Book content model.
 *
 * Two layers are kept deliberately apart:
 *
 *   BookManifest / BookChapterBody — canonical wording, generated from the
 *     source PDF into content/books/<slug>/ by scripts/extract_book.py.
 *     Never hand-edited.
 *   BookMeta — presentation metadata written for the site (display title,
 *     description, colours, picture alt text). Never mixed into the text.
 *
 * `Book` is the joined shape the UI consumes. A CMS can replace the file
 * loaders in src/lib/books.ts without touching any component.
 */

/** A run of printed text with the emphasis it carries on the page. */
export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

export interface BookImage {
  src: string;
  width: number;
  height: number;
}

export type BookBlock =
  | { type: "paragraph"; page: number; runs: TextRun[] }
  /** A boxed quotation printed beside the text. Each entry is one group of lines. */
  | { type: "callout"; page: number; paragraphs: TextRun[][] }
  | ({ type: "image"; page: number } & BookImage);

/** Canonical chapter text, one file per chapter. */
export interface BookChapterBody {
  slug: string;
  number: number;
  /** As printed, e.g. "Chapter 1". */
  label: string;
  title: string;
  /** The title as broken across lines on the printed page. */
  titleLines: string[];
  startPage: number;
  endPage: number;
  blocks: BookBlock[];
}

export interface BookChapterEntry {
  slug: string;
  number: number;
  label: string;
  title: string;
  file: string;
  startPage: number;
  endPage: number;
  wordCount: number;
  imageCount: number;
}

/** Generated manifest: content/books/<slug>/book.json. */
export interface BookManifest {
  slug: string;
  sourcePdf: string;
  coverPdf: string;
  pageCount: number;
  cover: {
    image: BookImage;
    /** Text printed on the front cover, top to bottom. */
    frontLines: string[];
    /** Text printed on the back cover, as paragraphs. */
    backCover: string[];
    address: string[];
  };
  chapters: BookChapterEntry[];
}

/** Presentation metadata written for the site. Not book wording. */
export interface BookMeta {
  slug: string;
  /** Display title. */
  title: string;
  /** Supporting summary for cards, the book page and SEO. */
  description: string;
  /** ISO date the book was added to the library. */
  addedAt: string;
  /** Shown in the home page spotlight. Without one, the first book is used. */
  featured?: boolean;
  theme: {
    accent: { light: string; dark: string };
    stage: { from: string; to: string; glow: string };
  };
  /** Text alternatives for the book's pictures, keyed by printed page. */
  imageAlt: Record<number, string>;
  /**
   * Printed pages whose pictures may also be used as artwork around the site
   * (chapter cards). Leave out any picture that shows a cross or other
   * religious symbol: those appear only in the reader, where the book prints them.
   */
  artwork: number[];
  /** Words and references known to appear in the text, offered on the search page. */
  searchSuggestions: string[];
  /**
   * One of the book's boxed quotations, shown whole on the home page.
   * Points at a callout block by chapter slug and block anchor (e.g. "b24").
   */
  highlight?: { chapter: string; anchor: string };
}

/** A printed callout, quoted whole, with where it appears. */
export interface BookHighlight {
  paragraphs: TextRun[][];
  chapter: BookChapter;
  href: string;
}

export interface BookChapter extends BookChapterEntry {
  href: string;
  readingMinutes: number;
  /** Words in all earlier chapters; used for whole-book progress. */
  wordsBefore: number;
  /** A picture from this chapter cleared for use as card artwork, if any. */
  artwork?: BookImage & { page: number };
}

export interface Book extends BookMeta {
  href: string;
  readHref: string;
  pdfHref: string;
  pdfFileName: string;
  pageCount: number;
  wordCount: number;
  readingMinutes: number;
  imageCount: number;
  cover: BookManifest["cover"];
  /** Line printed beneath the title on the cover, if any. */
  coverLine?: string;
  chapters: BookChapter[];
}
