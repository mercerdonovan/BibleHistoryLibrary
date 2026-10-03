import { CoverMotif } from "@/components/tract/cover-motif";
import type { Tract } from "@/lib/types";
import { cn, padNumber } from "@/lib/utils";

interface TractCoverProps {
  tract: Pick<Tract, "title" | "order" | "theme" | "series">;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const titleSize = {
  sm: "text-[1.35rem]",
  md: "text-[1.7rem] sm:text-[1.9rem]",
  lg: "text-[2.4rem] sm:text-[3.2rem]",
} as const;

/**
 * Typographic cover. Decorative as a whole: wherever it appears, the tract
 * title is also present as real text beside it, so the cover is aria-hidden.
 */
export function TractCover({ tract, size = "md", className }: TractCoverProps) {
  const { cover, motif } = tract.theme;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "cover grain relative aspect-[3/4] w-full overflow-hidden rounded-lg text-stage-ink",
        className,
      )}
      style={{
        background: `radial-gradient(120% 80% at 80% 0%, ${cover.glow}38, transparent 60%), linear-gradient(160deg, ${cover.from}, ${cover.to} 78%)`,
      }}
    >
      <CoverMotif
        motif={motif}
        color={cover.glow}
        className="cover-motif absolute inset-0 h-full w-full opacity-45"
      />
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, transparent 30%, ${cover.to}e6 88%)` }}
      />
      {/* Inset keyline */}
      <div className="absolute inset-[7px] rounded-[9px] border border-white/15" />
      <div className="cover-sheen pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-between p-[9%]">
        <div className="flex items-start justify-between gap-2">
          <span className="eyebrow text-[0.58rem] text-white/75">{tract.series.title}</span>
          <span className="font-display text-sm tabular-nums text-white/75">
            {padNumber(tract.order)}
          </span>
        </div>
        <div>
          <span className="mb-3 block h-px w-8" style={{ background: cover.glow }} />
          <span className={cn("display block leading-[0.98] text-balance", titleSize[size])}>
            {tract.title}
          </span>
        </div>
      </div>
    </div>
  );
}
