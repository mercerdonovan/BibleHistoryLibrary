/**
 * Where a reader left off, kept in this browser only (no account, no server).
 */

export interface ReadingPosition {
  /** Chapter slug. */
  chapter: string;
  /** Anchor of the block at the top of the screen. */
  block?: string;
  /** Whole-book progress, 0–1. */
  progress: number;
}

const key = (bookSlug: string): string => `bhl:book:${bookSlug}`;
const EVENT = "bhl:reading-position";

export function readPosition(bookSlug: string): ReadingPosition | null {
  try {
    const raw = window.localStorage.getItem(key(bookSlug));
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<ReadingPosition>;
    return typeof value.chapter === "string" && typeof value.progress === "number"
      ? { chapter: value.chapter, block: value.block, progress: value.progress }
      : null;
  } catch {
    return null; // storage unavailable or unreadable: behave as a first visit
  }
}

export function writePosition(bookSlug: string, position: ReadingPosition): void {
  try {
    window.localStorage.setItem(key(bookSlug), JSON.stringify(position));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Private browsing or full storage: resuming is a convenience, not a requirement.
  }
}

/** For useSyncExternalStore: re-read when the position changes in this or another tab. */
export function subscribePosition(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function positionSnapshot(bookSlug: string): string | null {
  try {
    return window.localStorage.getItem(key(bookSlug));
  } catch {
    return null;
  }
}
