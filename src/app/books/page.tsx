import { ArrowRight } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { Reveal } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Books",
  description: "Longer works are being prepared for the Bible History Library. In the meantime, the tract library is open.",
  path: "/books",
});

// Spine heights and tints for the empty shelf: [height %, colour token, width rem].
const SPINES = [
  [78, "var(--burgundy)", 2.6],
  [92, "var(--ink)", 3.4],
  [70, "var(--gold-bright)", 2.2],
  [86, "var(--ink-soft)", 3],
  [96, "var(--burgundy)", 3.8],
  [74, "var(--ink)", 2.4],
  [88, "var(--gold-bright)", 3.2],
] as const;

export default function BooksPage() {
  return (
    <>
      <PageIntro eyebrow="Books" title="The next shelf is being filled.">
        <p>
          Longer works are in preparation and will be added here as they are ready — to read
          online, as the tracts are now.
        </p>
      </PageIntro>

      <div className="container-page pt-14 sm:pt-20">
        <Reveal>
          <div
            role="img"
            aria-label="An empty bookshelf, with outlines where books will stand"
            className="relative mx-auto max-w-3xl"
          >
            <div className="flex h-56 items-end justify-center gap-2 px-6 sm:h-72 sm:gap-3">
              {SPINES.map(([height, colour, width], index) => (
                <div
                  key={index}
                  className="relative rounded-t-[5px] border border-dashed opacity-70"
                  style={{ height: `${height}%`, width: `${width}rem`, borderColor: colour }}
                >
                  <span className="absolute inset-x-2 top-4 h-px" style={{ background: colour }} />
                  <span className="absolute inset-x-2 top-6 h-px opacity-50" style={{ background: colour }} />
                  <span className="absolute inset-x-2 bottom-5 h-px opacity-50" style={{ background: colour }} />
                </div>
              ))}
            </div>
            <div className="h-2 rounded-sm bg-ink" />
            <div className="mx-4 h-3 rounded-b-md bg-sunken" />
          </div>
        </Reveal>

        <Reveal className="mx-auto mt-14 max-w-xl text-center">
          <h2 className="display text-[2rem] sm:text-[2.6rem]">Until then, start with the tracts.</h2>
          <p className="mt-4 text-[1rem] leading-relaxed text-ink-muted">
            Each one is a complete study that can be read in a sitting. To ask about printed books,
            write to{" "}
            <a href={`mailto:${siteConfig.contactEmail}`} className="font-semibold text-ink underline decoration-gold-bright underline-offset-4">
              {siteConfig.contactEmail}
            </a>
            .
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/library">
              Browse the library <ArrowRight aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline">
              Order copies
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </>
  );
}
