import Image from "next/image";

import { bookStageStyle } from "@/components/book/book-style";
import type { Book } from "@/lib/book-types";
import { cn } from "@/lib/utils";

interface BookStageProps {
  book: Pick<Book, "theme" | "cover">;
  as?: "section" | "header" | "div";
  className?: string;
  children: React.ReactNode;
  "aria-labelledby"?: string;
}

/**
 * The always-dark surface a book is presented on: its own colour wash, the
 * cover artwork blown up and softened into a backdrop, and film grain. Each
 * book therefore lights its stage in its own colours with no extra artwork.
 */
export function BookStage({ book, as: Component = "section", className, children, ...rest }: BookStageProps) {
  return (
    <Component
      className={cn("book-stage grain relative isolate overflow-hidden text-stage-ink", className)}
      style={bookStageStyle(book)}
      {...rest}
    >
      <div aria-hidden="true" className="book-stage-backdrop">
        <Image src={book.cover.image.src} alt="" fill sizes="40vw" className="object-cover" />
      </div>
      {children}
    </Component>
  );
}
