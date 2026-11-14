import Image from "next/image";
import Link from "next/link";

import type { Book, BookChapter } from "@/lib/book-types";
import { cn, padNumber } from "@/lib/utils";

interface ChapterCardProps {
  book: Pick<Book, "theme">;
  chapter: BookChapter;
  headingLevel?: "h3" | "h4";
  className?: string;
}

/**
 * A chapter as a tall card. Chapters with a cleared picture use it as the
 * card's artwork; the rest are set in type, with the chapter number large.
 */
export function ChapterCard({ book, chapter, headingLevel: Heading = "h3", className }: ChapterCardProps) {
  const { from, to, glow } = book.theme.stage;
  const angle = 150 + ((chapter.number * 37) % 70);

  return (
    <Link
      href={chapter.href}
      className={cn("chapter-card group block", className)}
      style={{ "--card-glow": glow } as React.CSSProperties}
    >
      <div
        className="chapter-card-frame relative aspect-[4/5] overflow-hidden rounded-lg text-stage-ink"
        style={{ background: `linear-gradient(${angle}deg, ${from}, ${to} 88%)` }}
      >
        {chapter.artwork ? (
          <Image
            src={chapter.artwork.src}
            alt=""
            fill
            sizes="(min-width: 40rem) 16rem, 66vw"
            className="chapter-card-art object-cover object-[50%_30%]"
          />
        ) : (
          <div aria-hidden="true" className="chapter-card-art absolute inset-0">
            <span
              className="chapter-card-numeral absolute -right-[0.06em] -top-[0.16em] font-display text-[11rem] leading-none tabular-nums"
              style={{ WebkitTextStroke: `1px ${glow}` }}
            >
              {padNumber(chapter.number)}
            </span>
            <svg viewBox="0 0 200 250" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
              {[0, 1, 2, 3, 4].map((ring) => (
                <circle
                  key={ring}
                  cx="0"
                  cy="250"
                  r={70 + ring * 34}
                  fill="none"
                  stroke={glow}
                  strokeWidth="0.5"
                  opacity={0.28 - ring * 0.045}
                />
              ))}
            </svg>
          </div>
        )}

        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#04060d] via-[#04060d]/55 to-transparent to-65%" />
        <span aria-hidden="true" className="chapter-card-sheen" />

        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="eyebrow text-[0.62rem]" style={{ color: glow }}>
            {chapter.label}
          </p>
          <Heading className="display mt-2 text-[1.42rem] leading-[1.08] text-balance">{chapter.title}</Heading>
          <p className="mt-2.5 text-[0.76rem] text-stage-muted">{chapter.readingMinutes} min read</p>
        </div>
      </div>
    </Link>
  );
}
