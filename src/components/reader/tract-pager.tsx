import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import { tractAccentStyle } from "@/components/tract/tract-card";
import { TractCover } from "@/components/tract/tract-cover";
import type { Tract } from "@/lib/types";
import { cn, padNumber } from "@/lib/utils";

function PagerLink({ tract, direction }: { tract: Tract; direction: "previous" | "next" }) {
  const next = direction === "next";
  const Arrow = next ? ArrowRight : ArrowLeft;
  return (
    <Link
      href={tract.href}
      rel={next ? "next" : "prev"}
      style={tractAccentStyle(tract)}
      className={cn(
        "accent-scope group flex items-center gap-5 rounded-lg border border-line bg-raised p-4 shadow-card transition-all duration-500 ease-out-expo hover:-translate-y-1 hover:border-accent/60 hover:shadow-lift sm:p-5",
        next && "flex-row-reverse text-right sm:col-start-2",
      )}
    >
      <TractCover tract={tract} size="sm" className="w-20 shrink-0 rounded-md sm:w-24" />
      <div className="min-w-0 flex-1">
        <p className={cn("eyebrow flex items-center gap-2 text-[0.64rem] text-ink-muted", next && "justify-end")}>
          {!next ? <Arrow aria-hidden="true" className="size-3.5 transition-transform duration-500 ease-out-expo group-hover:-translate-x-1" /> : null}
          {next ? "Next tract" : "Previous tract"}
          {next ? <Arrow aria-hidden="true" className="size-3.5 transition-transform duration-500 ease-out-expo group-hover:translate-x-1" /> : null}
        </p>
        <p className="display mt-2 text-[1.5rem] leading-[1.08] text-ink transition-colors group-hover:text-accent sm:text-[1.9rem]">
          {tract.title}
        </p>
        <p className="mt-1.5 text-[0.8rem] text-ink-muted">
          No. {padNumber(tract.order)} · {tract.series.title}
        </p>
      </div>
    </Link>
  );
}

export function TractPager({ previous, next }: { previous?: Tract; next?: Tract }) {
  if (!previous && !next) return null;
  return (
    <nav aria-label="Previous and next tracts" className="grid gap-4 sm:grid-cols-2">
      {previous ? <PagerLink tract={previous} direction="previous" /> : null}
      {next ? <PagerLink tract={next} direction="next" /> : null}
    </nav>
  );
}
