"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useRef } from "react";

import { tractAccentStyle } from "@/components/tract/tract-card";
import { TractCover } from "@/components/tract/tract-cover";
import type { Tract } from "@/lib/types";

const EASE = [0.16, 1, 0.3, 1] as const;

// Resting pose for each cover in the fan: [x %, y %, rotate deg, scale, z].
const POSES = [
  { x: "-58%", y: "6%", rotate: -11, scale: 0.84, z: 10, depth: 60 },
  { x: "0%", y: "-4%", rotate: 0, scale: 1, z: 30, depth: 0 },
  { x: "58%", y: "8%", rotate: 10, scale: 0.84, z: 20, depth: 110 },
] as const;

/** Three covers fanned on a lit stage; they drift apart in depth as the page scrolls. */
export function HeroStage({ tracts }: { tracts: Tract[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const drifts = [
    useTransform(progress, [0, 1], [0, POSES[0].depth]),
    useTransform(progress, [0, 1], [0, POSES[1].depth]),
    useTransform(progress, [0, 1], [0, POSES[2].depth]),
  ];

  return (
    <div ref={ref} className="relative mx-auto aspect-[5/4] w-full max-w-[34rem] lg:aspect-square">
      {/* Stage light */}
      <motion.div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 size-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,var(--atmosphere-b),transparent)] blur-2xl"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
      />
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full text-gold-bright/40 motion-safe:animate-[slow-spin_140s_linear_infinite]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.4 }}
      >
        <circle cx="200" cy="200" r="198" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="1 7" />
        <circle cx="200" cy="200" r="160" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </motion.svg>

      {tracts.slice(0, 3).map((tract, index) => {
        const pose = POSES[index] ?? POSES[1];
        return (
          <div
            key={tract.slug}
            className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2"
            style={{ zIndex: pose.z }}
          >
           <motion.div style={{ y: drifts[index] }}>
            <motion.div
              initial={{ opacity: 0, x: "0%", y: "30%", rotate: 0, scale: 0.7 }}
              animate={{ opacity: 1, x: pose.x, y: pose.y, rotate: pose.rotate, scale: pose.scale }}
              transition={{ duration: 1.4, ease: EASE, delay: 0.25 + index * 0.12 }}
            >
              <Link
                href={tract.href}
                aria-label={`Read ${tract.title}`}
                className="tract-card accent-scope block"
                style={tractAccentStyle(tract)}
              >
                <TractCover tract={tract} className="shadow-lift" />
              </Link>
            </motion.div>
           </motion.div>
          </div>
        );
      })}
    </div>
  );
}
