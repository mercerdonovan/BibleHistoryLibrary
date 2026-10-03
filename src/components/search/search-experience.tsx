"use client";

import { ArrowRight, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";

import { queryTerms, searchDocuments, snippet } from "@/lib/search";
import type { BlockType, SearchDocument } from "@/lib/types";
import { padNumber } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const PASSAGE_LABEL: Record<BlockType, string> = {
  heading: "Section",
  question: "Question",
  scripture: "Scripture",
  note: "Note",
  label: "Passage",
  paragraph: "Passage",
};

type IndexState = { status: "loading" } | { status: "ready"; documents: SearchDocument[] } | { status: "error" };

export function SearchExperience({ suggestions }: { suggestions: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const deferredQuery = useDeferredValue(query);
  const [index, setIndex] = useState<IndexState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/search-index.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<SearchDocument[]>;
      })
      .then((documents) => setIndex({ status: "ready", documents }))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setIndex({ status: "error" });
      });
    return () => controller.abort();
  }, []);

  // Keep the address bar shareable without adding a history entry per keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = query.trim();
      const next = trimmed ? `${pathname}?q=${encodeURIComponent(trimmed)}` : pathname;
      router.replace(next, { scroll: false });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [query, pathname, router]);

  const terms = useMemo(() => queryTerms(deferredQuery), [deferredQuery]);
  const hits = useMemo(
    () => (index.status === "ready" ? searchDocuments(index.documents, deferredQuery) : []),
    [index, deferredQuery],
  );
  const hasQuery = terms.length > 0;

  const applySuggestion = (value: string) => {
    setQuery(value);
    inputRef.current?.focus();
  };

  return (
    <div>
      <form role="search" onSubmit={(event) => event.preventDefault()} className="relative">
        <label htmlFor={inputId} className="sr-only">
          Search the full text of every tract
        </label>
        <Search aria-hidden="true" className="pointer-events-none absolute left-1 top-1/2 size-6 -translate-y-1/2 text-ink-muted sm:size-7" />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="A word, a verse, a question…"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="search"
          className="display h-16 w-full border-b-2 border-line-strong bg-transparent pl-11 pr-12 text-[1.6rem] text-ink placeholder:text-ink-muted/70 focus:border-ink focus:outline-none sm:h-20 sm:pl-14 sm:text-[2.4rem] [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => applySuggestion("")}
            className="absolute right-0 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-md text-ink-muted hover:text-ink"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        ) : null}
      </form>

      <p role="status" aria-live="polite" className="mt-4 min-h-6 text-sm text-ink-muted">
        {index.status === "error"
          ? "The search index could not be loaded. Please reload the page."
          : !hasQuery
            ? "Searches every word of every tract."
            : index.status === "loading"
              ? "Loading the library…"
              : hits.length === 0
                ? `No tract mentions “${deferredQuery.trim()}”.`
                : `Found in ${hits.length} ${hits.length === 1 ? "tract" : "tracts"}`}
      </p>

      {!hasQuery ? (
        <div className="mt-10">
          <h2 className="eyebrow text-[0.68rem] text-ink-muted">Try searching for</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <li key={suggestion}>
                <button
                  type="button"
                  onClick={() => applySuggestion(suggestion)}
                  className="min-h-10 rounded-md border border-line bg-raised px-3.5 text-[0.9rem] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <ol className="mt-8 border-t border-line">
        <AnimatePresence initial={false} mode="popLayout">
          {hits.map((hit) => {
            const href = `/tracts/${hit.document.slug}`;
            return (
              <motion.li
                key={hit.document.slug}
                layout="position"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="grid gap-x-10 gap-y-4 border-b border-line py-8 md:grid-cols-[17rem_1fr]"
              >
                <div>
                  <p className="text-[0.8rem] text-ink-muted">
                    <span className="font-display tabular-nums">No. {padNumber(hit.document.order)}</span>
                    <span aria-hidden="true" className="mx-1.5 text-line-strong">/</span>
                    {hit.document.series}
                  </p>
                  <h2 className="display mt-2 text-[1.9rem] leading-[1.05]">
                    <Link href={href} className="link-underline">
                      {hit.document.title}
                    </Link>
                  </h2>
                  <p className="mt-2 text-[0.82rem] text-ink-muted">
                    {hit.matchCount > 0
                      ? `${hit.matchCount} matching ${hit.matchCount === 1 ? "passage" : "passages"}`
                      : "Matches the title or topic"}
                  </p>
                </div>

                <div>
                  {hit.passages.length > 0 ? (
                    <ul className="space-y-3">
                      {hit.passages.map((passage) => (
                        <li key={passage.anchor}>
                          <Link
                            href={`${href}#${passage.anchor}`}
                            className="group block rounded-lg border border-line bg-raised p-4 transition-all duration-300 hover:border-line-strong hover:shadow-card"
                          >
                            <span className="eyebrow flex items-center justify-between text-[0.62rem] text-gold">
                              {PASSAGE_LABEL[passage.type]}
                              <ArrowRight aria-hidden="true" className="size-3.5 text-ink-muted transition-transform duration-500 ease-out-expo group-hover:translate-x-1" />
                            </span>
                            <span className="mt-2 block font-serif text-[1.05rem] leading-relaxed text-ink-soft">
                              {snippet(passage.text, terms).map((part, partIndex) =>
                                part.match ? (
                                  <mark key={partIndex} className="rounded-[3px] bg-gold-bright/35 px-0.5 text-ink">
                                    {part.text}
                                  </mark>
                                ) : (
                                  <span key={partIndex}>{part.text}</span>
                                ),
                              )}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[0.98rem] leading-relaxed text-ink-muted">{hit.document.description}</p>
                  )}
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </div>
  );
}
