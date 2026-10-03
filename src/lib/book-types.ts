/**
 * Book content model.
 *
 * As with tracts, canonical wording (generated from the source PDF into
 * content/books/<slug>/) is kept apart from presentation metadata
 * (src/content/books.ts). `Book` is the joined shape the UI consumes.
 */

import type { TextRun } from "@/lib/types";

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
  addedAt: string;
  theme: {
    accent: { light: string; dark: string };
    stage: { from: string; to: string; glow: string };
  };
  /** Text alternatives for the book's pictures, keyed by printed page. */
  imageAlt: Record<number, string>;
}

export interface BookChapter extends BookChapterEntry {
  href: string;
  readingMinutes: number;
  /** Words in all earlier chapters; used for whole-book progress. */
  wordsBefore: number;
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
