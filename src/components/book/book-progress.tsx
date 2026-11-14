"use client";

import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { writePosition } from "@/components/book/reading-position";

interface BookProgressProps {
  bookSlug: string;
  chapterSlug: string;
  /** Element containing the chapter text. */
  targetId: string;
  wordsBefore: number;
  chapterWords: number;
  totalWords: number;
}

const SAVE_INTERVAL = 1200;

/**
 * Whole-book reading progress: a hairline that fills across the reader bar,
 * with a percentage beside it. Also remembers the reader's place locally.
 */
export function BookProgress({ bookSlug, chapterSlug, targetId, wordsBefore, chapterWords, totalWords }: BookProgressProps) {
  const progress = useMotionValue(wordsBefore / totalWords);
  const smooth = useSpring(progress, { stiffness: 140, damping: 28, mass: 0.3 });
  const reducedMotion = useReducedMotion();
  const [percent, setPercent] = useState(Math.round((wordsBefore / totalWords) * 100));
  const lastSaved = useRef(0);

  useMotionValueEvent(progress, "change", (value) => setPercent(Math.round(value * 100)));

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    let frame = 0;

    const currentBlock = (): string | undefined => {
      const blocks = target.querySelectorAll<HTMLElement>(".b-block");
      for (const block of blocks) {
        if (block.getBoundingClientRect().bottom > 140) return block.id;
      }
      return undefined;
    };

    const save = () => {
      lastSaved.current = Date.now();
      writePosition(bookSlug, { chapter: chapterSlug, block: currentBlock(), progress: progress.get() });
    };

    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const distance = rect.height - window.innerHeight * 0.6;
      const travelled = -rect.top + window.innerHeight * 0.4;
      const within = distance > 0 ? Math.min(1, Math.max(0, travelled / distance)) : 0;
      progress.set((wordsBefore + within * chapterWords) / totalWords);
      if (Date.now() - lastSaved.current > SAVE_INTERVAL) save();
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("pagehide", save);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pagehide", save);
      save();
    };
  }, [bookSlug, chapterSlug, targetId, wordsBefore, chapterWords, totalWords, progress]);

  return (
    <>
      <span className="tabular-nums" aria-label={`${percent} percent of the book read`}>
        {percent}%
      </span>
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 -bottom-px h-[2px] overflow-hidden">
        <motion.span className="block h-full origin-left bg-accent" style={{ scaleX: reducedMotion ? progress : smooth }} />
      </span>
    </>
  );
}
