import Image from "next/image";

import type { Book } from "@/lib/book-types";
import { cn } from "@/lib/utils";

interface BookCoverProps {
  book: Pick<Book, "title" | "cover">;
  /** Responsive `sizes` hint for the rendered width. */
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * The published cover, shown as a physical book: untouched artwork at its
 * printed proportions, with a spine shadow and page edge added around it.
 */
export function BookCover({ book, sizes, priority = false, className }: BookCoverProps) {
  const { image } = book.cover;
  return (
    <div className={cn("book-object", className)}>
      <div className="book-object-inner">
        <Image
          src={image.src}
          width={image.width}
          height={image.height}
          sizes={sizes}
          priority={priority}
          alt={`Front cover of ${book.title}`}
          className="block h-auto w-full rounded-r-[5px] rounded-l-[2px]"
        />
        <span aria-hidden="true" className="book-object-spine" />
        <span aria-hidden="true" className="book-object-sheen" />
      </div>
    </div>
  );
}
