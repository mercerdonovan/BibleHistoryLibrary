"use client";

import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useDeferredValue, useId, useMemo, useState } from "react";

import { TractCard } from "@/components/tract/tract-card";
import type { Series, Tract } from "@/lib/types";
import { cn, padNumber } from "@/lib/utils";

interface LibraryExplorerProps {
  groups: { series: Series; tracts: Tract[] }[];
}

const EASE = [0.16, 1, 0.3, 1] as const;

const normalise = (value: string): string => value.toLowerCase().normalize("NFKD").replace(/[‘’]/g, "'");

export function LibraryExplorer({ groups }: LibraryExplorerProps) {
  const [query, setQuery] = useState("");
  const [seriesId, setSeriesId] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const inputId = useId();

  const total = groups.reduce((count, group) => count + group.tracts.length, 0);

  const visible = useMemo(() => {
    const terms = normalise(deferredQuery).split(/\s+/).filter(Boolean);
    return groups
      .filter((group) => !seriesId || group.series.id === seriesId)
      .map((group) => ({
        series: group.series,
        tracts: group.tracts.filter((tract) => {
          const haystack = normalise(`${tract.title} ${tract.series.title} ${tract.description}`);
          return terms.every((term) => haystack.includes(term));
        }),
      }))
      .filter((group) => group.tracts.length > 0);
  }, [groups, deferredQuery, seriesId]);

  const shown = visible.reduce((count, group) => count + group.tracts.length, 0);
  const filtering = Boolean(deferredQuery.trim() || seriesId);

  const chip = (active: boolean) =>
    cn(
      "min-h-10 whitespace-nowrap rounded-md border px-3.5 text-[0.86rem] font-medium transition-all duration-300",
      active
        ? "border-ink bg-ink text-bg"
        : "border-line bg-raised text-ink-soft hover:border-line-strong hover:text-ink",
    );

  return (
    <div>
      {/* Controls */}
      <div className="sticky top-16 z-30 -mx-[clamp(1.125rem,4vw,3rem)] border-y border-line bg-bg/85 px-[clamp(1.125rem,4vw,3rem)] py-3 backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative lg:w-80">
            <label htmlFor={inputId} className="sr-only">
              Filter tracts by title or topic
            </label>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              id={inputId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter by title or topic"
              autoComplete="off"
              className="h-11 w-full rounded-md border border-line bg-raised pl-10 pr-10 text-[0.95rem] text-ink placeholder:text-ink-muted focus:border-ink focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear filter"
                onClick={() => setQuery("")}
                className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded text-ink-muted hover:text-ink"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            ) : null}
          </div>

          <div
            role="group"
            aria-label="Filter by series"
            className="-mx-[clamp(1.125rem,4vw,3rem)] flex gap-2 overflow-x-auto px-[clamp(1.125rem,4vw,3rem)] [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:px-0 [&::-webkit-scrollbar]:hidden"
          >
            <button type="button" aria-pressed={seriesId === null} onClick={() => setSeriesId(null)} className={chip(seriesId === null)}>
              All series
            </button>
            {groups.map(({ series }) => (
              <button
                key={series.id}
                type="button"
                aria-pressed={seriesId === series.id}
                onClick={() => setSeriesId(seriesId === series.id ? null : series.id)}
                className={chip(seriesId === series.id)}
              >
                {series.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p role="status" aria-live="polite" className="pt-6 text-sm text-ink-muted">
        {filtering ? `Showing ${shown} of ${total} tracts` : `${total} tracts in ${groups.length} series`}
      </p>

      {/* Shelves */}
      <div className="mt-2">
        {visible.map(({ series, tracts }) => {
          const seriesNumber = groups.findIndex((group) => group.series.id === series.id) + 1;
          return (
            <section
              key={series.id}
              id={series.id}
              aria-labelledby={`${series.id}-title`}
              className="grid scroll-mt-44 gap-x-12 gap-y-6 border-b border-line py-12 last:border-b-0 lg:grid-cols-[17rem_1fr] lg:py-16"
            >
              <header className="lg:sticky lg:top-44 lg:self-start">
                <p className="font-display text-sm tabular-nums text-gold">
                  Series {padNumber(seriesNumber)}
                </p>
                <h2 id={`${series.id}-title`} className="display mt-2 text-[2.1rem] sm:text-[2.6rem]">
                  {series.title}
                </h2>
                <p className="mt-3 max-w-sm text-[0.95rem] leading-relaxed text-ink-muted">{series.description}</p>
                <p className="mt-4 text-[0.8rem] font-medium uppercase tracking-[0.16em] text-ink-muted">
                  {tracts.length} {tracts.length === 1 ? "tract" : "tracts"}
                </p>
              </header>

              <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 xl:grid-cols-4">
                <AnimatePresence mode="popLayout" initial={false}>
                  {tracts.map((tract) => (
                    <motion.li
                      key={tract.slug}
                      layout
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      <TractCard tract={tract} headingLevel="h3" />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          );
        })}

        {visible.length === 0 ? (
          <div className="py-24 text-center">
            <p className="display text-[2rem]">Nothing by that title.</p>
            <p className="mx-auto mt-3 max-w-md text-ink-muted">
              This filter looks at titles and topics. To look inside the tracts themselves,{" "}
              <Link
                href={`/search?q=${encodeURIComponent(query.trim())}`}
                className="font-semibold text-ink underline decoration-gold-bright underline-offset-4"
              >
                search the full text
              </Link>
              .
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
