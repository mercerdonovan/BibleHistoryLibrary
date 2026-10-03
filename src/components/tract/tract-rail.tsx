"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface TractRailProps {
  /** Accessible name for the scrolling region. */
  label: string;
  children: React.ReactNode;
  className?: string;
}

/** Horizontal, snap-scrolling shelf with previous/next controls on larger screens. */
export function TractRail({ label, children, className }: TractRailProps) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  const scrollBy = (direction: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const control =
    "pointer-events-auto hidden size-11 place-items-center rounded-full border border-line-strong bg-raised text-ink shadow-card transition-all duration-300 hover:scale-105 hover:border-ink disabled:pointer-events-none disabled:opacity-0 md:grid";

  return (
    <div className={cn("relative", className)}>
      <ul ref={ref} onScroll={measure} aria-label={label} tabIndex={-1} className="rail">
        {children}
      </ul>
      <div className="pointer-events-none absolute inset-y-0 left-2 right-2 flex items-center justify-between pb-16 lg:left-4 lg:right-4">
        <button type="button" aria-label={`Scroll ${label} back`} disabled={edges.start} onClick={() => scrollBy(-1)} className={control}>
          <ArrowLeft aria-hidden="true" className="size-4" />
        </button>
        <button type="button" aria-label={`Scroll ${label} forward`} disabled={edges.end} onClick={() => scrollBy(1)} className={control}>
          <ArrowRight aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}
