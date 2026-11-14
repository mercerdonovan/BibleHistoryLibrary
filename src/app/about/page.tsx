import { ArrowRight } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SharingNotice } from "@/components/sharing-notice";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "What the Bible History Library is, how its books are given online, and how the web editions relate to the printed ones.",
  path: "/about",
});

const EDITIONS = [
  {
    title: "On the web",
    text: "The full text, chapter by chapter, with the book’s pictures and boxed quotations where they fall on the printed page.",
  },
  {
    title: "As a PDF",
    text: "The original file of the printed book, every page as it was laid out, to keep, print or pass on.",
  },
  {
    title: "In print",
    text: "Printed copies can be requested by email, to keep or to give away.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="About" title="A library of books, given whole.">
        <p>
          {siteConfig.name} publishes Christian books in print. This site is where each one can be
          read in full, downloaded exactly as printed, and shared with anyone.
        </p>
      </PageIntro>

      <div className="container-page">
        <section aria-labelledby="editions-title" className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[0.8fr_2fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-gold">Ways to read</p>
            <h2 id="editions-title" className="display mt-3 text-[2.2rem] sm:text-[3rem]">
              Three editions, one text.
            </h2>
          </Reveal>
          <RevealGroup as="ol" className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
            {EDITIONS.map((edition, index) => (
              <RevealItem as="li" key={edition.title} className="bg-raised p-7 sm:p-8">
                <span className="font-display text-sm tabular-nums text-gold">0{index + 1}</span>
                <h3 className="display mt-6 text-[1.7rem]">{edition.title}</h3>
                <p className="mt-3 text-[0.96rem] leading-relaxed text-ink-muted">{edition.text}</p>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <hr className="rule-gold" />

        <section aria-labelledby="text-title" className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[0.8fr_2fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-gold">The text</p>
            <h2 id="text-title" className="display mt-3 text-[2.2rem] sm:text-[3rem]">
              Word for word.
            </h2>
          </Reveal>
          <Reveal className="max-w-2xl space-y-5 font-serif text-[1.2rem] leading-[1.7] text-ink-soft">
            <p>
              Every book on this site carries the complete wording of its printed edition. Nothing is
              shortened, summarised or rephrased for the web, and the emphasis marked in print is kept
              here too.
            </p>
            <p>
              The pictures are the book’s own. Each has a short written description, so that readers
              using a screen reader know what is shown.
            </p>
            <p>
              The descriptions on the shelf and in search results are written for this site to help
              you find your way. They are not part of the books themselves.
            </p>
          </Reveal>
        </section>

        <Reveal className="pb-16 sm:pb-24">
          <SharingNotice id="sharing" className="mx-auto max-w-3xl sm:p-10" />
        </Reveal>

        <Reveal className="flex flex-wrap items-center gap-3 border-t border-line pt-10">
          <ButtonLink href="/books">
            Browse the books <ArrowRight aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            Order printed copies
          </ButtonLink>
        </Reveal>
      </div>
    </>
  );
}
