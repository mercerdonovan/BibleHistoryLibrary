import Link from "next/link";

import { TractCover } from "@/components/tract/tract-cover";
import type { Tract } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TractCardProps {
  tract: Tract;
  className?: string;
  /** Show the supporting description under the cover. */
  detailed?: boolean;
  headingLevel?: "h2" | "h3" | "h4";
}

export function tractAccentStyle(tract: Pick<Tract, "theme">): React.CSSProperties {
  return {
    "--accent-light": tract.theme.accent.light,
    "--accent-dark": tract.theme.accent.dark,
    "--card-glow": tract.theme.cover.glow,
  } as React.CSSProperties;
}

export function TractMetaLine({ tract, className }: { tract: Tract; className?: string }) {
  return (
    <p className={cn("text-[0.8rem] text-ink-muted", className)}>
      {tract.questionCount} questions
      <span aria-hidden="true" className="mx-1.5 text-line-strong">
        /
      </span>
      {tract.readingMinutes} min read
    </p>
  );
}

export function TractCard({ tract, className, detailed = false, headingLevel: Heading = "h3" }: TractCardProps) {
  return (
    <Link
      href={tract.href}
      className={cn("tract-card accent-scope group outline-offset-8", className)}
      style={tractAccentStyle(tract)}
    >
      <TractCover tract={tract} />
      <div className="px-0.5 pt-3.5">
        <Heading className="font-display text-[1.15rem] leading-tight tracking-[-0.01em] text-ink transition-colors group-hover:text-accent">
          {tract.title}
        </Heading>
        {detailed ? (
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-ink-muted">{tract.description}</p>
        ) : null}
        <TractMetaLine tract={tract} className="mt-1.5" />
      </div>
    </Link>
  );
}
