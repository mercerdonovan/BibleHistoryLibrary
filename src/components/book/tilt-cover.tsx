"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Presents a cover on a lit stage: it settles into place on load, turns
 * gently toward the pointer, and sinks a little as the page scrolls away.
 * Pointer and scroll effects are skipped for reduced motion and touch.
 */
export function TiltCover({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const spring = { stiffness: 120, damping: 18, mass: 0.6 };
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-14, 6]), spring);
  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [7, -7]), spring);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const onPointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div ref={ref} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} className="relative [perspective:1600px]">
      {/* Pool of light the book stands in */}
      <motion.div
        aria-hidden="true"
        className="stage-light absolute left-1/2 top-[46%] -z-10 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: EASE }}
      />
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="absolute left-1/2 top-[46%] -z-10 w-[138%] -translate-x-1/2 -translate-y-1/2 text-[color:var(--stage-glow)] opacity-50 motion-safe:animate-[slow-spin_160s_linear_infinite]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 2.4, delay: 0.5 }}
      >
        <circle cx="200" cy="200" r="198" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 6" />
        <circle cx="200" cy="200" r="166" fill="none" stroke="currentColor" strokeWidth="0.4" opacity="0.6" />
      </motion.svg>

      <motion.div style={reduced ? undefined : { y: drift }}>
        <motion.div
          initial={{ opacity: 0, y: 40, rotateY: -28, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
          transition={{ duration: 1.6, ease: EASE, delay: 0.15 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>{children}</motion.div>
        </motion.div>
      </motion.div>

      {/* Contact shadow on the stage floor */}
      <div aria-hidden="true" className="mx-auto mt-6 h-6 w-[78%] rounded-[50%] bg-black/55 blur-xl" />
    </div>
  );
}
