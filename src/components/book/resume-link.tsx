"use client";

import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { positionSnapshot, readPosition, subscribePosition } from "@/components/book/reading-position";
import { buttonClasses, type ButtonVariant } from "@/components/ui/button";

interface ResumeLinkProps {
  bookSlug: string;
  /** Where "Read Book" goes on a first visit. */
  startHref: string;
  chapters: { slug: string; href: string; label: string }[];
  variant?: ButtonVariant;
  className?: string;
}

/** "Read Book" on a first visit; "Continue reading" once a position has been saved. */
export function ResumeLink({ bookSlug, startHref, chapters, variant = "primary", className }: ResumeLinkProps) {
  // Subscribing keeps the label current; the server and first paint show the default.
  const snapshot = useSyncExternalStore(
    subscribePosition,
    () => positionSnapshot(bookSlug),
    () => null,
  );
  const position = snapshot ? readPosition(bookSlug) : null;
  const chapter = position ? chapters.find((item) => item.slug === position.chapter) : undefined;

  if (!position || !chapter || position.progress < 0.002) {
    return (
      <Link href={startHref} className={buttonClasses(variant, className)}>
        <BookOpen aria-hidden="true" />
        Read Book
      </Link>
    );
  }

  return (
    <Link
      href={position.block ? `${chapter.href}#${position.block}` : chapter.href}
      className={buttonClasses(variant, className)}
    >
      <BookOpen aria-hidden="true" />
      Continue reading
      <span className="font-normal opacity-75">· {chapter.label}</span>
      <ArrowRight aria-hidden="true" />
    </Link>
  );
}
