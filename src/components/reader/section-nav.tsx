"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export interface SectionLink {
  id: string;
  label: string;
}

/** Sticky outline of the tract's printed headings; marks the one being read. */
export function SectionNav({ sections }: { sections: SectionLink[] }) {
  const [activeId, setActiveId] = useState<string | undefined>(sections[0]?.id);

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActiveId(top.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label="In this tract">
      <p className="eyebrow text-[0.66rem] text-ink-muted">In this tract</p>
      <ol className="mt-4 max-h-[calc(100dvh-22rem)] overflow-y-auto border-l border-line pr-2 [scrollbar-width:thin]">
        {sections.map((section) => {
          const active = section.id === activeId;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={active ? "location" : undefined}
                className={cn(
                  "-ml-px block border-l py-1.5 pl-4 text-[0.8rem] leading-snug transition-colors duration-300",
                  active
                    ? "border-accent font-semibold text-ink"
                    : "border-transparent text-ink-muted hover:border-line-strong hover:text-ink",
                )}
              >
                {section.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
