"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect } from "react";

/** A hairline under the header that fills as the tract is read. */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const progress = useMotionValue(0);
  const reducedMotion = useReducedMotion();
  const smooth = useSpring(progress, { stiffness: 140, damping: 28, mass: 0.3 });

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const distance = rect.height - window.innerHeight * 0.6;
      const travelled = -rect.top + window.innerHeight * 0.4;
      progress.set(distance > 0 ? Math.min(1, Math.max(0, travelled / distance)) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [progress, targetId]);

  return (
    <div aria-hidden="true" className="no-print pointer-events-none fixed inset-x-0 top-16 z-40 h-[3px]">
      <motion.div
        className="h-full origin-left bg-accent"
        style={{ scaleX: reducedMotion ? progress : smooth }}
      />
    </div>
  );
}
