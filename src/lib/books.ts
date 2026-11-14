import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import { bookMeta } from "@/content/books";
import { bookBlockAnchor } from "@/lib/book-anchor";
import type { Book, BookChapter, BookChapterBody, BookHighlight, BookManifest, BookMeta, TextRun } from "@/lib/book-types";
import type { SearchDocument, SearchPassage } from "@/lib/search";

/**
 * Data access for books. The only module that knows books are file-based;
 * a CMS would re-implement these functions.
 */

const CONTENT_DIR = path.join(process.cwd(), "content", "books");
const WORDS_PER_MINUTE = 220;

const minutes = (words: number): number => Math.max(1, Math.round(words / WORDS_PER_MINUTE));

const readJson = async <T>(...segments: string[]): Promise<T> =>
  JSON.parse(await readFile(path.join(CONTENT_DIR, ...segments), "utf8")) as T;

const readChapter = cache(
  (bookSlug: string, file: string): Promise<BookChapterBody> => readJson<BookChapterBody>(bookSlug, "chapters", file),
);

async function loadBook(meta: BookMeta): Promise<Book> {
  const manifest = await readJson<BookManifest>(meta.slug, "book.json");
  const href = `/books/${meta.slug}`;
  const artworkPages = new Set(meta.artwork);

  let wordsBefore = 0;
  const chapters = await Promise.all(
    manifest.chapters.map(async (entry): Promise<BookChapter> => {
      const before = wordsBefore;
      wordsBefore += entry.wordCount;

      let artwork: BookChapter["artwork"];
      if (entry.imageCount > 0 && artworkPages.size > 0) {
        const body = await readChapter(meta.slug, entry.file);
        const image = body.blocks.find((block) => block.type === "image" && artworkPages.has(block.page));
        if (image?.type === "image") {
          artwork = { src: image.src, width: image.width, height: image.height, page: image.page };
        }
      }

      return {
        ...entry,
        href: `${href}/read/${entry.slug}`,
        readingMinutes: minutes(entry.wordCount),
        wordsBefore: before,
        artwork,
      };
    }),
  );

  // The cover prints the title, then (optionally) a line beneath it, then the imprint.
  const titleWords = meta.title.split(" ").length;
  let consumed = 0;
  let index = 0;
  while (index < manifest.cover.frontLines.length && consumed < titleWords) {
    consumed += manifest.cover.frontLines[index]?.split(" ").length ?? 0;
    index += 1;
  }
  const coverLine = manifest.cover.frontLines[index];

  return {
    ...meta,
    href,
    readHref: `${href}/read`,
    pdfHref: `/book-assets/${meta.slug}/${meta.slug}.pdf`,
    pdfFileName: `${meta.slug}.pdf`,
    pageCount: manifest.pageCount,
    wordCount: wordsBefore,
    readingMinutes: minutes(wordsBefore),
    imageCount: chapters.reduce((total, chapter) => total + chapter.imageCount, 0),
    cover: manifest.cover,
    coverLine: coverLine && !/^bible$/i.test(coverLine) ? coverLine : undefined,
    chapters,
  };
}

export const getAllBooks = cache(async (): Promise<Book[]> => Promise.all(bookMeta.map(loadBook)));

export async function getBook(slug: string): Promise<Book | undefined> {
  return (await getAllBooks()).find((book) => book.slug === slug);
}

/** The book in the home page spotlight. */
export async function getFeaturedBook(): Promise<Book | undefined> {
  const books = await getAllBooks();
  return books.find((book) => book.featured) ?? books[0];
}

/** ISO date of the most recent addition, for the sitemap. */
export async function getLastAdded(): Promise<string> {
  return (await getAllBooks()).reduce((latest, book) => (book.addedAt > latest ? book.addedAt : latest), "");
}

export async function getChapterBody(book: Book, chapterSlug: string): Promise<BookChapterBody | undefined> {
  const entry = book.chapters.find((chapter) => chapter.slug === chapterSlug);
  if (!entry) return undefined;
  return readChapter(book.slug, entry.file);
}

/** The book's chosen callout, exactly as printed. Undefined if unset or not a callout. */
export async function getBookHighlight(book: Book): Promise<BookHighlight | undefined> {
  if (!book.highlight) return undefined;
  const { chapter: chapterSlug, anchor } = book.highlight;
  const chapter = book.chapters.find((item) => item.slug === chapterSlug);
  const body = chapter ? await readChapter(book.slug, chapter.file) : undefined;
  const block = body?.blocks.find((_, index) => bookBlockAnchor(index) === anchor);
  if (!chapter || block?.type !== "callout") return undefined;
  return { paragraphs: block.paragraphs, chapter, href: `${chapter.href}#${anchor}` };
}

export function getAdjacentChapters(book: Book, chapterSlug: string): { previous?: BookChapter; next?: BookChapter } {
  const index = book.chapters.findIndex((chapter) => chapter.slug === chapterSlug);
  return { previous: book.chapters[index - 1], next: book.chapters[index + 1] };
}

/** "5 hr 10 min" style duration for long works. */
export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const rest = totalMinutes % 60;
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} hr` : `${hours} hr ${rest} min`;
}

const plain = (runs: TextRun[]): string => runs.map((run) => run.text).join("");

/** One search document per chapter, with passage anchors matching the reader. */
export async function getSearchDocuments(): Promise<SearchDocument[]> {
  const books = await getAllBooks();
  const documents = await Promise.all(
    books.flatMap((book, bookIndex) =>
      book.chapters.map(async (chapter): Promise<SearchDocument> => {
        const body = await readChapter(book.slug, chapter.file);
        const passages: SearchPassage[] = [];
        body.blocks.forEach((block, index) => {
          if (block.type === "paragraph") {
            passages.push({ anchor: bookBlockAnchor(index), type: "paragraph", text: plain(block.runs) });
          } else if (block.type === "callout") {
            passages.push({
              anchor: bookBlockAnchor(index),
              type: "callout",
              text: block.paragraphs.map(plain).join(" "),
            });
          }
        });
        return {
          id: `${book.slug}/${chapter.slug}`,
          href: chapter.href,
          bookTitle: book.title,
          chapterLabel: chapter.label,
          title: chapter.title,
          order: bookIndex * 1000 + chapter.number,
          passages,
        };
      }),
    ),
  );
  return documents;
}
