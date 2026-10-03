"use client";

import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Headline that rises line by line out of a mask. */
export function HeroHeadline({ lines, id }: { lines: string[]; id?: string }) {
  return (
    <h1 id={id} className="display text-[clamp(2.9rem,8.4vw,6.4rem)] text-ink">
      {lines.map((line, index) => (
        <span key={line} className="block overflow-hidden pb-[0.12em]">
          <motion.span
            className={index === lines.length - 1 ? "block italic text-burgundy" : "block"}
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.1 + index * 0.12 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </h1>
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
