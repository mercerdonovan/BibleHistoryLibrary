import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * The library's permission notice. The wording is supplied by the publisher
 * and must be shown exactly as written — edit it only here.
 */
export const SHARING_NOTICE_TITLE = "Free to Read, Download & Share";

interface SharingNoticeProps {
  headingLevel?: "h2" | "h3";
  id?: string;
  className?: string;
}

export function SharingNotice({ headingLevel: Heading = "h2", id, className }: SharingNoticeProps) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      className={cn("sharing-notice scroll-mt-28 rounded-lg border border-line bg-raised p-6 sm:p-8", className)}
    >
      <Heading id={id ? `${id}-title` : undefined} className="display text-[1.5rem] leading-tight sm:text-[1.8rem]">
        {SHARING_NOTICE_TITLE}
      </Heading>
      <div className="mt-4 space-y-3 text-[0.95rem] leading-relaxed text-ink-soft">
        <p>This material may be freely read, downloaded, printed, copied, and shared.</p>
        <p>
          You may distribute it digitally or physically without charge, provided that the original
          content is preserved exactly as published.
        </p>
        <p>
          <strong className="font-semibold text-ink">
            Do not remove, rewrite, alter, paraphrase, add to, or otherwise change any of the words
            or wording of this publication.
          </strong>
        </p>
        <p>If you share or reproduce this material, it must remain complete and unaltered.</p>
      </div>
    </section>
  );
}

/** One-line form of the notice, for use beside Share and Download controls. */
export function SharingNoticeBrief({ href = "/about#sharing", className }: { href?: string; className?: string }) {
  return (
    <p className={cn("no-print text-[0.82rem] leading-relaxed", className)}>
      Free to read, download and share, provided it is kept complete and unaltered.{" "}
      <Link href={href} className="font-semibold underline decoration-gold-bright underline-offset-4">
        Read the full notice
      </Link>
    </p>
  );
}
