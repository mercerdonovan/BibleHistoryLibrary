import { ArrowRight } from "lucide-react";

import { PageIntro } from "@/components/layout/page-intro";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SharingNotice } from "@/components/sharing-notice";
import { ButtonLink } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { getAllTracts } from "@/lib/tracts";

export const metadata = pageMetadata({
  title: "About",
  description:
    "What the Bible History Library is, how its tracts are written, and how the online editions relate to the printed ones.",
  path: "/about",
});

const PRINCIPLES = [
  {
    title: "A question",
    text: "Each study moves one plain question at a time — the kind a thoughtful reader would actually ask.",
  },
  {
    title: "The passage",
    text: "The answer is given first in the words of Scripture, quoted in full with its reference.",
  },
  {
    title: "A short note",
    text: "A brief note follows, drawing out what the passage says before moving to the next question.",
  },
];

export default async function AboutPage() {
  const tracts = await getAllTracts();

  return (
    <>
      <PageIntro eyebrow="About" title="A library that lets the Bible answer.">
        <p>
          {siteConfig.name} is a free collection of Bible study tracts. The same tracts are handed
          out in print; this site is where they can be read in full, shared, and printed again.
        </p>
      </PageIntro>

      <div className="container-page">
        <section aria-labelledby="pattern-title" className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[0.8fr_2fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow text-gold">How the tracts work</p>
            <h2 id="pattern-title" className="display mt-3 text-[2.2rem] sm:text-[3rem]">
              One pattern, {tracts.length} studies.
            </h2>
          </Reveal>
          <RevealGroup as="ol" className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
            {PRINCIPLES.map((principle, index) => (
              <RevealItem as="li" key={principle.title} className="bg-raised p-7 sm:p-8">
                <span className="font-display text-sm tabular-nums text-gold">0{index + 1}</span>
                <h3 className="display mt-6 text-[1.7rem]">{principle.title}</h3>
                <p className="mt-3 text-[0.96rem] leading-relaxed text-ink-muted">{principle.text}</p>
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
              Every tract on this site carries the complete wording of its printed edition. Nothing
              is shortened, summarised or rephrased for the web, and the emphasis marked in print is
              kept here too.
            </p>
            <p>
              The short descriptions on covers and in search results are written for this site to
              help you find your way. They are not part of the tracts themselves.
            </p>
            <p>
              If you would rather have the original layout, each tract can be downloaded as a PDF or
              printed directly from its page.
            </p>
          </Reveal>
        </section>

        <Reveal className="pb-16 sm:pb-24">
          <SharingNotice id="sharing" className="mx-auto max-w-3xl sm:p-10" />
        </Reveal>

        <Reveal className="flex flex-wrap items-center gap-3 border-t border-line pt-10">
          <ButtonLink href="/library">
            Browse the library <ArrowRight aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline">
            Order printed copies
          </ButtonLink>
        </Reveal>
      </div>
    </>
  );
}
