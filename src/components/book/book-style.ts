import type { Book } from "@/lib/book-types";

/** Inline custom properties that give a book its accent. Pair with the `accent-scope` class. */
export function bookAccentStyle(book: Pick<Book, "theme">): React.CSSProperties {
  return {
    "--accent-light": book.theme.accent.light,
    "--accent-dark": book.theme.accent.dark,
  } as React.CSSProperties;
}

/** Background for a book's dark "stage" surfaces. */
export function bookStageBackground({ theme }: Pick<Book, "theme">): string {
  const { from, to, glow } = theme.stage;
  return `radial-gradient(70% 90% at 82% 0%, ${glow}2e, transparent 62%), linear-gradient(155deg, ${from}, ${to} 82%)`;
}
