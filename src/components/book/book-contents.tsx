import Link from "next/link";

import type { BookChapter } from "@/lib/book-types";
import { cn, padNumber } from "@/lib/utils";

interface BookContentsProps {
  chapters: BookChapter[];
  /** Slug of the chapter being read, if any. */
  currentSlug?: string;
  /** Compact rows for the reader's drawer. */
  compact?: boolean;
  className?: string;
}

/** The book's table of contents, built from its printed chapter titles. */
export function BookContents({ chapters, currentSlug, compact = false, className }: BookContentsProps) {
  return (
    <ol className={cn("border-t border-line-strong", className)}>
      {chapters.map((chapter) => {
        const current = chapter.slug === currentSlug;
        return (
          <li key={chapter.slug} className="border-b border-line">
            <Link
              href={chapter.href}
              aria-current={current ? "page" : undefined}
              data-chapter={chapter.slug}
              className={cn(
                "group relative grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 transition-[padding] duration-500 ease-out-expo hover:pl-2",
                compact ? "py-3" : "py-4 sm:grid-cols-[3.5rem_1fr_auto] sm:py-5",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-y-0 left-0 w-0.5 origin-top bg-accent transition-transform duration-500 ease-out-expo group-hover:scale-y-100",
                  current ? "scale-y-100" : "scale-y-0",
                )}
              />
              <span className={cn("font-display text-sm tabular-nums", current ? "text-accent" : "text-ink-muted")}>
                {padNumber(chapter.number)}
              </span>
              <span
                className={cn(
                  "display leading-[1.12] transition-colors group-hover:text-accent",
                  compact ? "text-[1.15rem]" : "text-[1.35rem] sm:text-[1.7rem]",
                  current ? "text-accent" : "text-ink",
                )}
              >
                <span className="sr-only">{chapter.label}: </span>
                {chapter.title}
              </span>
              <span className="whitespace-nowrap text-[0.78rem] tabular-nums text-ink-muted">
                {chapter.readingMinutes} min
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
