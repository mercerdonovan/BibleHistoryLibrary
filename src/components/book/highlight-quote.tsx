import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { Book, BookHighlight, TextRun } from "@/lib/book-types";

/**
 * Splits printed runs into word spans so the quotation can brighten word by
 * word as it scrolls into view. The text itself is untouched: whitespace is
 * kept as-is between the spans, so reading, selecting and copying give back
 * exactly the printed words.
 */
function Words({ runs, start, total }: { runs: TextRun[]; start: number; total: number }) {
  let index = start;
  return runs.map((run, runIndex) => {
    const tokens = run.text.split(/(\s+)/).map((token, tokenIndex) => {
      if (!token || /^\s+$/.test(token)) return token;
      const order = index++;
      return (
        <span key={tokenIndex} className="quote-word" style={{ "--i": order, "--n": total } as React.CSSProperties}>
          {token}
        </span>
      );
    });
    let node: React.ReactNode = tokens;
    if (run.italic) node = <i>{node}</i>;
    if (run.bold) node = <b>{node}</b>;
    return <span key={runIndex}>{node}</span>;
  });
}

const countWords = (runs: TextRun[]): number =>
  runs.reduce((total, run) => total + run.text.split(/\s+/).filter(Boolean).length, 0);

interface HighlightQuoteProps {
  book: Pick<Book, "title">;
  highlight: BookHighlight;
}

/** One of the book's boxed quotations, set large, with a way into its chapter. */
export function HighlightQuote({ book, highlight }: HighlightQuoteProps) {
  const counts = highlight.paragraphs.map(countWords);
  const total = counts.reduce((sum, count) => sum + count, 0);
  const starts = counts.map((_, index) => counts.slice(0, index).reduce((sum, count) => sum + count, 0));

  return (
    <figure className="mx-auto max-w-4xl text-center">
      <span aria-hidden="true" className="mx-auto block h-14 w-px bg-gradient-to-b from-transparent to-gold-bright" />
      <blockquote className="quote-reveal display mt-8 text-[clamp(1.9rem,5.2vw,3.7rem)] leading-[1.12] tracking-[-0.018em] text-ink">
        {highlight.paragraphs.map((runs, paragraph) => (
          <p key={paragraph} className="text-balance [&+&]:mt-4">
            <Words runs={runs} start={starts[paragraph] ?? 0} total={total} />
          </p>
        ))}
      </blockquote>
      <figcaption className="mt-9 text-[0.9rem] text-ink-muted">
        <span className="eyebrow text-[0.66rem] text-gold">{highlight.chapter.label}</span>
        <span aria-hidden="true" className="mx-2.5 text-line-strong">/</span>
        <cite className="not-italic">{book.title}</cite>
        <Link
          href={highlight.href}
          className="group mx-auto mt-4 flex w-fit items-center gap-2 font-semibold text-ink"
        >
          <span className="link-underline">Read it in “{highlight.chapter.title}”</span>
          <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
        </Link>
      </figcaption>
    </figure>
  );
}
