import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { tractAccentStyle } from "@/components/tract/tract-card";
import type { Tract } from "@/lib/types";
import { padNumber } from "@/lib/utils";

/** Editorial index: tracts as ruled rows rather than cards. */
export function TractIndexList({ tracts }: { tracts: Tract[] }) {
  return (
    <RevealGroup as="ol" className="border-t border-line-strong">
      {tracts.map((tract) => (
        <RevealItem as="li" key={tract.slug} className="border-b border-line">
          <Link
            href={tract.href}
            style={tractAccentStyle(tract)}
            className="accent-scope group relative grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 gap-y-1 py-5 transition-[padding] duration-500 ease-out-expo hover:pl-3 sm:grid-cols-[3.5rem_1.2fr_1fr_auto] sm:py-6"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-accent transition-transform duration-500 ease-out-expo group-hover:scale-y-100"
            />
            <span className="font-display text-sm tabular-nums text-ink-muted">{padNumber(tract.order)}</span>
            <span className="display text-[1.5rem] leading-[1.1] text-ink transition-colors group-hover:text-accent sm:text-[1.9rem]">
              {tract.title}
            </span>
            <span className="col-start-2 text-sm text-ink-muted sm:col-start-3">
              {tract.series.title}
              <span aria-hidden="true" className="mx-1.5 text-line-strong">/</span>
              {tract.readingMinutes} min
            </span>
            <ArrowUpRight
              aria-hidden="true"
              className="col-start-3 row-start-1 size-5 self-center text-ink-muted transition-all duration-500 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent sm:col-start-4"
            />
          </Link>
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
