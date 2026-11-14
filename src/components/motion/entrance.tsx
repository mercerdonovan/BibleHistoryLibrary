"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

interface MaskedLinesProps {
  lines: string[];
  as?: "h1" | "h2";
  id?: string;
  className?: string;
  /** Classes for the last line, e.g. an italic accent. */
  lastLineClassName?: string;
  delay?: number;
}

/** A display heading whose lines rise one by one out of a mask. */
export function MaskedLines({ lines, as: Heading = "h1", id, className, lastLineClassName, delay = 0.1 }: MaskedLinesProps) {
  return (
    <Heading id={id} className={cn("display", className)}>
      {lines.map((line, index) => (
        <span key={line} className="block overflow-hidden pb-[0.12em]">
          <motion.span
            className={cn("block", index === lines.length - 1 && lines.length > 1 && lastLineClassName)}
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.1, ease: EASE, delay: delay + index * 0.12 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Heading>
  );
}

export function HeroFade({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
