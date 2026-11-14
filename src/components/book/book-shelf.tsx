import Link from "next/link";

import { BookCover } from "@/components/book/book-cover";
import { bookAccentStyle } from "@/components/book/book-style";
import { Rail } from "@/components/ui/rail";
import type { Book } from "@/lib/book-types";
import { formatDuration } from "@/lib/books";

// Heights (as a share of the shelf) and widths (rem) of the empty spines that
// stand in the space waiting for further books.
const SPINES = [
  [0.82, 1.5],
  [0.9, 1.15],
  [0.74, 1.8],
  [0.86, 1.3],
  [0.7, 1.05],
  [0.94, 1.6],
  [0.78, 1.2],
] as const;

interface BookShelfProps {
  books: Book[];
  headingLevel?: "h2" | "h3";
}

/**
 * Every book standing on one long shelf. The shelf ends in a run of empty
 * spines: the library is still being added to.
 */
export function BookShelf({ books, headingLevel: Heading = "h3" }: BookShelfProps) {
  return (
    <div className="shelf relative">
      <div aria-hidden="true" className="shelf-ledge" />
      <Rail label="Books on the shelf" className="relative" listClassName="shelf-row">
        {books.map((book) => (
          <li
            key={book.slug}
            className="shelf-item"
            style={{ "--cover-ratio": book.cover.image.width / book.cover.image.height } as React.CSSProperties}
          >
            <Link href={book.href} className="accent-scope group block" style={bookAccentStyle(book)}>
              <BookCover book={book} sizes="(min-width: 64rem) 15rem, 11rem" />
              <Heading className="display mt-8 text-[1.3rem] leading-tight text-ink transition-colors group-hover:text-accent sm:text-[1.5rem]">
                {book.title}
              </Heading>
              <p className="mt-1.5 text-[0.78rem] text-ink-muted">
                {book.chapters.length} chapters · {formatDuration(book.readingMinutes)}
              </p>
            </Link>
          </li>
        ))}
        <li className="shelf-item shelf-waiting">
          <div aria-hidden="true" className="shelf-spines">
            {SPINES.map(([height, width], index) => (
              <span
                key={index}
                className="shelf-spine"
                style={{ height: `calc(var(--shelf-h) * ${height})`, width: `${width}rem` }}
              />
            ))}
          </div>
          <p className="mt-8 max-w-[12rem] font-serif text-[1.02rem] italic leading-snug text-ink-muted sm:max-w-[15rem]">
            More books will join the shelf as they are prepared.
          </p>
        </li>
      </Rail>
    </div>
  );
}
