"use client";

import { MotionConfig } from "motion/react";

/** Honour prefers-reduced-motion everywhere: transforms drop out, fades stay. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
