import { ArrowRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="atmosphere grain">
      <div className="container-page flex min-h-[70vh] flex-col items-start justify-center py-24">
        <p className="eyebrow text-gold">Page not found</p>
        <h1 className="display mt-4 max-w-3xl text-[clamp(2.6rem,8vw,5.5rem)]">This page isn’t on the shelf.</h1>
        <p className="mt-5 max-w-lg text-[1.05rem] leading-relaxed text-ink-soft">
          The address may have changed, or the link may be incomplete. Every tract is still in the library.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/library">
            Browse the library <ArrowRight aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href="/search" variant="outline">
            Search the tracts
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
