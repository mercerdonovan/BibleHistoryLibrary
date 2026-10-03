import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import { bookMeta } from "@/content/books";
import type { Book, BookChapter, BookChapterBody, BookManifest } from "@/lib/book-types";

/**
 * Data access for books. The only module that knows books are file-based;
 * a CMS would re-implement these functions.
 */

const CONTENT_DIR = path.join(process.cwd(), "content", "books");
const WORDS_PER_MINUTE = 220;

const minutes = (words: number): number => Math.max(1, Math.round(words / WORDS_PER_MINUTE));

const readJson = async <T>(...segments: string[]): Promise<T> =>
  JSON.parse(await readFile(path.join(CONTENT_DIR, ...segments), "utf8")) as T;

export const getAllBooks = cache(async (): Promise<Book[]> => {
  return Promise.all(
    bookMeta.map(async (meta): Promise<Book> => {
      const manifest = await readJson<BookManifest>(meta.slug, "book.json");
      const href = `/books/${meta.slug}`;

      let wordsBefore = 0;
      const chapters = manifest.chapters.map((entry): BookChapter => {
        const chapter = {
          ...entry,
          href: `${href}/read/${entry.slug}`,
          readingMinutes: minutes(entry.wordCount),
          wordsBefore,
        };
        wordsBefore += entry.wordCount;
        return chapter;
      });

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
    }),
  );
});

export async function getBook(slug: string): Promise<Book | undefined> {
  return (await getAllBooks()).find((book) => book.slug === slug);
}

export const getChapterBody = cache(async (book: Book, chapterSlug: string): Promise<BookChapterBody | undefined> => {
  const entry = book.chapters.find((chapter) => chapter.slug === chapterSlug);
  if (!entry) return undefined;
  return readJson<BookChapterBody>(book.slug, "chapters", entry.file);
});

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
