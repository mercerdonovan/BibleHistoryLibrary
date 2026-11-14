import Image from "next/image";

import { bookBlockAnchor } from "@/lib/book-anchor";
import type { BookBlock, TextRun } from "@/lib/book-types";
import { cn } from "@/lib/utils";

/**
 * Renders canonical chapter text.
 *
 * Wording comes straight from content/books/<slug>/chapters/*.json. This
 * component decides only how each printed element is typeset: paragraphs,
 * the book's boxed quotations, and its full-page pictures. It never adds,
 * removes or reorders words.
 */

function Runs({ runs }: { runs: TextRun[] }) {
  return runs.map((run, index) => {
    let node: React.ReactNode = run.text;
    if (run.italic) node = <i>{node}</i>;
    if (run.bold) node = <b>{node}</b>;
    return <span key={index}>{node}</span>;
  });
}

interface BookBodyProps {
  id: string;
  blocks: BookBlock[];
  imageAlt: Record<number, string>;
}

export function BookBody({ id, blocks, imageAlt }: BookBodyProps) {
  const firstParagraph = blocks.findIndex((block) => block.type === "paragraph");

  return (
    <div id={id} className="book-prose">
      {blocks.map((block, index) => {
        const anchor = bookBlockAnchor(index);

        if (block.type === "paragraph") {
          return (
            <p key={anchor} id={anchor} className={cn("b-block b-paragraph", index === firstParagraph && "b-first")}>
              <Runs runs={block.runs} />
            </p>
          );
        }

        if (block.type === "callout") {
          return (
            <aside key={anchor} id={anchor} className="b-block b-callout">
              {block.paragraphs.map((runs, paragraph) => (
                <p key={paragraph}>
                  <Runs runs={runs} />
                </p>
              ))}
            </aside>
          );
        }

        return (
          <figure key={anchor} id={anchor} className="b-block b-figure">
            <Image
              src={block.src}
              width={block.width}
              height={block.height}
              sizes="(min-width: 64rem) 46rem, 100vw"
              alt={imageAlt[block.page] ?? "Illustration from the printed book."}
              className="block"
            />
          </figure>
        );
      })}
    </div>
  );
}
