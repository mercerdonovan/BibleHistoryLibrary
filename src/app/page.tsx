import { ArrowRight, BookOpen, Download, Mail, Share2 } from "lucide-react";
import Link from "next/link";

import { BookCover } from "@/components/book/book-cover";
import { BookShelf } from "@/components/book/book-shelf";
import { BookStage } from "@/components/book/book-stage";
import { ChapterCard } from "@/components/book/chapter-card";
import { HighlightQuote } from "@/components/book/highlight-quote";
import { ResumeLink } from "@/components/book/resume-link";
import { TiltCover } from "@/components/book/tilt-cover";
import { HeroFade, MaskedLines } from "@/components/motion/entrance";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { SharingNotice } from "@/components/sharing-notice";
import { buttonClasses, ButtonLink } from "@/components/ui/button";
import { Rail } from "@/components/ui/rail";
import { absoluteUrl, siteConfig } from "@/config/site";
import { formatDuration, getAllBooks, getBookHighlight, getFeaturedBook } from "@/lib/books";

const WAYS = [
  {
    icon: BookOpen,
    title: "Read online",
    text: "Chapter by chapter on any screen, in light or dark, at the text size you choose. Your place is kept on this device.",
  },
  {
    icon: Download,
    title: "Download",
    text: "Each book’s original PDF: every page exactly as printed, to keep or print at home.",
  },
  {
    icon: Share2,
    title: "Share",
    text: "Send a whole book, or a single chapter, to anyone with one tap.",
  },
  {
    icon: Mail,
    title: "Printed copies",
    text: "Write to ask for copies to keep or to give away.",
    href: "/contact",
  },
] as const;

export default async function HomePage() {
  const [books, featured] = await Promise.all([getAllBooks(), getFeaturedBook()]);
  if (!featured) return null;
  const highlight = await getBookHighlight(featured);
  const glow = featured.theme.stage.glow;

  return (
    <>
      {/* ── Spotlight: the featured book on its own lit stage ─────────────── */}
      <BookStage book={featured} aria-labelledby="featured-title" className="border-b border-white/10">
        <div className="featured-hero container-page relative pb-14 pt-8 sm:pb-20 sm:pt-14 lg:py-20">
          <div className="featured-cover">
            <HeroFade>
              <TiltCover>
                <Link href={featured.href} aria-label={`${featured.title}: about the book`} className="block">
                  <BookCover book={featured} sizes="(min-width: 64rem) 25rem, 38vw" priority />
                </Link>
              </TiltCover>
            </HeroFade>
          </div>

          <div className="featured-head">
            <HeroFade>
              <h1 className="eyebrow flex items-center gap-3" style={{ color: glow }}>
                <span aria-hidden="true" className="hidden h-px w-8 bg-current sm:block" />
                Bible History Library
              </h1>
            </HeroFade>
            <MaskedLines
              as="h2"
              id="featured-title"
              lines={[featured.title]}
              className="mt-3 text-[clamp(2.5rem,11vw,3.6rem)] leading-[0.95] tracking-[-0.03em] sm:mt-5 lg:text-[clamp(4.6rem,7.6vw,7.6rem)] lg:leading-[0.9]"
            />
            {featured.coverLine ? (
              <HeroFade delay={0.35}>
                <p className="display mt-2 text-[clamp(1.15rem,4.6vw,1.5rem)] italic lg:mt-4 lg:text-[clamp(1.6rem,2.6vw,2.3rem)]" style={{ color: glow }}>
                  {featured.coverLine}
                </p>
              </HeroFade>
            ) : null}
          </div>

          <HeroFade delay={0.45} className="featured-actions flex flex-wrap items-center gap-2.5">
            <ResumeLink
              bookSlug={featured.slug}
              startHref={featured.readHref}
              chapters={featured.chapters.map(({ slug, href, label }) => ({ slug, href, label }))}
              variant="stageSolid"
              className="w-full sm:w-auto"
            />
            <ButtonLink href={featured.href} variant="stage" className="flex-1 sm:flex-none">
              About the book
            </ButtonLink>
            <a href={featured.pdfHref} download={featured.pdfFileName} className={buttonClasses("stage", "flex-1 sm:flex-none")}>
              <Download aria-hidden="true" />
              PDF
            </a>
          </HeroFade>

          <HeroFade delay={0.55} className="featured-desc">
            <p className="max-w-xl text-[1.02rem] leading-relaxed text-white/78 sm:text-[1.1rem]">{featured.description}</p>
          </HeroFade>

          <HeroFade delay={0.65} className="featured-meta">
            <dl className="flex max-w-lg justify-between gap-6 border-t border-white/15 pt-5 sm:justify-start sm:gap-12">
              {[
                { term: "chapters", detail: featured.chapters.length },
                { term: "of reading", detail: formatDuration(featured.readingMinutes) },
                { term: "printed pages", detail: featured.pageCount },
              ].map(({ term, detail }) => (
                <div key={term} className="flex flex-col-reverse justify-end">
                  <dt className="mt-1 text-[0.76rem] leading-snug text-white/60">{term}</dt>
                  <dd className="display whitespace-nowrap text-[1.4rem] tabular-nums sm:text-[1.9rem]">{detail}</dd>
                </div>
              ))}
            </dl>
          </HeroFade>
        </div>
      </BookStage>

      {/* ── Chapters, as a browsable row ─────────────────────────────────── */}
      <section aria-labelledby="chapters-title" className="pt-16 sm:pt-24">
        <Reveal className="container-page flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
          <div>
            <p className="eyebrow text-gold">Inside {featured.title}</p>
            <h2 id="chapters-title" className="display mt-3 text-[2.3rem] sm:text-[3.4rem]">
              Chapter by chapter
            </h2>
          </div>
          <Link href={featured.readHref} className="link-underline pb-1 text-sm font-semibold text-ink">
            Full contents
          </Link>
        </Reveal>
        <Reveal delay={0.1}>
          <Rail label={`Chapters of ${featured.title}`} className="mt-3">
            {featured.chapters.map((chapter) => (
              <li key={chapter.slug} className="w-[66vw] max-w-[16rem] sm:w-[16rem]">
                <ChapterCard book={featured} chapter={chapter} />
              </li>
            ))}
          </Rail>
        </Reveal>
      </section>

      {/* ── A quotation from the book ────────────────────────────────────── */}
      {highlight ? (
        <section aria-label="From the book" className="container-page pt-16 sm:pt-28">
          <HighlightQuote book={featured} highlight={highlight} />
        </section>
      ) : null}

      {/* ── The shelf ────────────────────────────────────────────────────── */}
      <section aria-labelledby="shelf-title" className="pt-20 sm:pt-32">
        <Reveal className="container-page grid items-end gap-x-12 gap-y-4 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-gold">The library</p>
            <h2 id="shelf-title" className="display mt-3 text-[2.3rem] sm:text-[3.4rem]">
              On the shelf
            </h2>
          </div>
          <p className="max-w-md text-[0.98rem] leading-relaxed text-ink-muted lg:justify-self-end">
            Every book here is complete: the full text to read online, and the printed edition to
            download.{" "}
            <Link href="/books" className="font-semibold text-ink underline decoration-gold-bright underline-offset-4">
              See all books
            </Link>
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <BookShelf books={books} />
        </Reveal>
      </section>

      {/* ── Ways to read ─────────────────────────────────────────────────── */}
      <section aria-labelledby="ways-title" className="container-page pt-16 sm:pt-24">
        <Reveal className="grain overflow-hidden rounded-xl bg-navy text-stage-ink">
          <div className="grid gap-10 p-7 sm:p-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16 lg:p-16">
            <div className="self-center">
              <p className="eyebrow text-[#dab86e]">Free to read</p>
              <h2 id="ways-title" className="display mt-4 text-[2.4rem] leading-[1] sm:text-[3.4rem]">
                Whole books,
                <span className="block italic text-[#dab86e]">freely given.</span>
              </h2>
              <p className="mt-6 max-w-md text-[1rem] leading-relaxed text-stage-muted">
                Nothing here is shortened or rewritten. Each book is given in full, word for word as
                printed, to read, to keep and to pass on.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <ButtonLink href="/books" variant="stageSolid">
                  Browse the books <ArrowRight aria-hidden="true" />
                </ButtonLink>
                <ButtonLink href="/search" variant="stage">
                  Search every book
                </ButtonLink>
              </div>
            </div>
            <ul className="grid content-center gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2">
              {WAYS.map(({ icon: Icon, title, text, ...rest }) => {
                const href = "href" in rest ? rest.href : undefined;
                return (
                  <li key={title} className="flex flex-col bg-navy p-6">
                    <Icon aria-hidden="true" className="size-5 text-[#dab86e]" />
                    <h3 className="display mt-5 text-[1.45rem]">{title}</h3>
                    <p className="mt-2 text-[0.92rem] leading-relaxed text-stage-muted">{text}</p>
                    {href ? (
                      <Link href={href} className="link-underline mt-4 self-start text-[0.88rem] font-semibold text-stage-ink">
                        How to ask
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
        <Reveal className="pt-6">
          <SharingNotice id="sharing" headingLevel="h3" />
        </Reveal>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Books from ${siteConfig.name}`,
          numberOfItems: books.length,
          itemListElement: books.map((book, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: book.title,
            url: absoluteUrl(book.href),
          })),
        }}
      />
    </>
  );
}
