import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookContents } from "@/components/book/book-contents";
import { BookCover } from "@/components/book/book-cover";
import { BookStage } from "@/components/book/book-stage";
import { bookAccentStyle } from "@/components/book/book-style";
import { ResumeLink } from "@/components/book/resume-link";
import { Reveal } from "@/components/motion/reveal";
import { ReaderActions } from "@/components/reader/reader-actions";
import { JsonLd } from "@/components/seo/json-ld";
import { SharingNotice, SharingNoticeBrief } from "@/components/sharing-notice";
import { ButtonLink } from "@/components/ui/button";
import { absoluteUrl, siteConfig } from "@/config/site";
import { formatDuration, getAllBooks, getBook } from "@/lib/books";

interface BookPageProps {
  params: Promise<{ book: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllBooks()).map((book) => ({ book: book.slug }));
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const book = await getBook((await params).book);
  if (!book) return {};
  return {
    title: book.title,
    description: book.description,
    alternates: { canonical: book.href },
    openGraph: {
      type: "book",
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: book.title,
      description: book.description,
      url: absoluteUrl(book.href),
    },
    twitter: { card: "summary_large_image", title: book.title, description: book.description },
  };
}

export default async function BookPage({ params }: BookPageProps) {
  const book = await getBook((await params).book);
  if (!book) notFound();

  const url = absoluteUrl(book.href);
  const chapterLinks = book.chapters.map(({ slug, href, label }) => ({ slug, href, label }));

  return (
    <article className="accent-scope" style={bookAccentStyle(book)}>
      {/* ── Title stage ──────────────────────────────────────────────────── */}
      <BookStage book={book} as="header">
        <div className="container-page relative pb-14 pt-8 sm:pb-20 sm:pt-12">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2 text-[0.8rem] text-white/70">
              <li>
                <Link href="/books" className="link-underline hover:text-white">
                  Books
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{book.title}</li>
            </ol>
          </nav>

          <div className="mt-10 grid items-center gap-12 sm:mt-14 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-20">
            <div className="mx-auto w-[70%] max-w-[22rem] lg:w-full lg:max-w-none">
              <BookCover book={book} sizes="(min-width: 64rem) 24rem, 70vw" priority />
            </div>

            <div>
              <p className="eyebrow" style={{ color: book.theme.stage.glow }}>
                A book from {siteConfig.name}
              </p>
              <h1 className="display mt-5 text-[clamp(3rem,10vw,6.6rem)] leading-[0.94]">{book.title}</h1>
              {book.coverLine ? (
                <p className="display mt-4 text-[1.5rem] italic text-white/80 sm:text-[1.9rem]">{book.coverLine}</p>
              ) : null}
              <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-white/80">{book.description}</p>

              <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                {[
                  { term: "Chapters", detail: book.chapters.length },
                  { term: "Printed pages", detail: book.pageCount },
                  { term: "Reading time", detail: formatDuration(book.readingMinutes) },
                  { term: "Pictures", detail: book.imageCount },
                ].map(({ term, detail }) => (
                  <div key={term} className="flex flex-col-reverse">
                    <dt className="text-[0.72rem] uppercase tracking-[0.16em] text-white/60">{term}</dt>
                    <dd className="font-display text-[1.35rem]">{detail}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-9 flex flex-wrap items-center gap-2.5">
                <ResumeLink bookSlug={book.slug} startHref={book.readHref} chapters={chapterLinks} variant="stageSolid" />
                <ReaderActions
                  title={book.title}
                  text={`${book.title} — a book from ${siteConfig.name}`}
                  url={url}
                  pdfHref={book.pdfHref}
                  pdfFileName={book.pdfFileName}
                  showPrint={false}
                  variant="stage"
                  shareVariant="stage"
                  className="contents"
                />
              </div>
              <SharingNoticeBrief href="#sharing" className="mt-6 max-w-xl text-white/65" />
            </div>
          </div>
        </div>
      </BookStage>

      <div className="container-page">
        {/* ── Contents ───────────────────────────────────────────────────── */}
        <section aria-labelledby="contents-title" className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[0.8fr_2fr] lg:gap-16">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-accent">Contents</p>
            <h2 id="contents-title" className="display mt-3 text-[2.2rem] sm:text-[3rem]">
              {book.chapters.length} chapters
            </h2>
            <p className="mt-4 max-w-sm text-[0.98rem] leading-relaxed text-ink-muted">
              The web edition follows the printed book chapter by chapter, with its pictures and
              quotations in place. Your place is remembered on this device.
            </p>
            <ButtonLink href={book.readHref} variant="outline" className="mt-6">
              Open the reader <ArrowRight aria-hidden="true" />
            </ButtonLink>
          </Reveal>
          <Reveal>
            <BookContents chapters={book.chapters} />
          </Reveal>
        </section>

        {/* ── Back cover ─────────────────────────────────────────────────── */}
        {book.cover.backCover.length > 0 ? (
          <>
            <hr className="rule-gold" />
            <section aria-labelledby="back-cover-title" className="grid gap-10 py-16 sm:py-24 lg:grid-cols-[0.8fr_2fr] lg:gap-16">
              <Reveal>
                <p className="eyebrow text-accent">From the back cover</p>
                <h2 id="back-cover-title" className="display mt-3 text-[2.2rem] sm:text-[3rem]">
                  As printed
                </h2>
              </Reveal>
              <Reveal>
                <blockquote className="max-w-2xl space-y-5 border-l-2 border-accent/70 pl-6 font-serif text-[1.2rem] leading-[1.65] text-ink sm:text-[1.3rem]">
                  {book.cover.backCover.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </blockquote>
              </Reveal>
            </section>
          </>
        ) : null}

        {/* ── Editions ───────────────────────────────────────────────────── */}
        <hr className="rule-gold" />
        <section aria-labelledby="editions-title" className="py-16 sm:py-24">
          <Reveal>
            <p className="eyebrow text-accent">Ways to read</p>
            <h2 id="editions-title" className="display mt-3 text-[2.2rem] sm:text-[3rem]">
              Three editions, one text
            </h2>
          </Reveal>
          <Reveal className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-3">
            <div className="flex flex-col bg-raised p-7 sm:p-8">
              <h3 className="display text-[1.6rem]">On the web</h3>
              <p className="mt-3 flex-1 text-[0.96rem] leading-relaxed text-ink-muted">
                Made for reading on a phone or a desk: one chapter at a time, in light or dark, with
                your place kept for next time.
              </p>
              <ResumeLink bookSlug={book.slug} startHref={book.readHref} chapters={chapterLinks} className="mt-6 self-start" />
            </div>
            <div className="flex flex-col bg-raised p-7 sm:p-8">
              <h3 className="display text-[1.6rem]">The original PDF</h3>
              <p className="mt-3 flex-1 text-[0.96rem] leading-relaxed text-ink-muted">
                The book exactly as printed, all {book.pageCount} pages. This is the edition to use
                for printing or passing on an exact copy.
              </p>
              <ReaderActions
                title={book.title}
                text={`${book.title} — a book from ${siteConfig.name}`}
                url={url}
                pdfHref={book.pdfHref}
                pdfFileName={book.pdfFileName}
                showPrint={false}
                showShare={false}
                className="mt-6"
              />
            </div>
            <div className="flex flex-col bg-raised p-7 sm:p-8">
              <h3 className="display text-[1.6rem]">In print</h3>
              <p className="mt-3 flex-1 text-[0.96rem] leading-relaxed text-ink-muted">
                Printed copies are available on request. Write to us and say how many you would like
                and where to send them.
              </p>
              <a
                href={`mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(`Printed copy: ${book.title}`)}`}
                className="link-underline mt-6 self-start break-all text-[1.02rem] font-semibold text-ink"
              >
                {siteConfig.contactEmail}
              </a>
            </div>
          </Reveal>

          <Reveal className="mt-12">
            <SharingNotice id="sharing" className="mx-auto max-w-3xl sm:p-10" />
          </Reveal>
        </section>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Book",
              "@id": `${url}#book`,
              name: book.title,
              description: book.description,
              url,
              inLanguage: "en",
              numberOfPages: book.pageCount,
              bookFormat: "https://schema.org/EBook",
              isAccessibleForFree: true,
              image: absoluteUrl(book.cover.image.src),
              publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
              encoding: { "@type": "MediaObject", encodingFormat: "application/pdf", contentUrl: absoluteUrl(book.pdfHref) },
              potentialAction: { "@type": "ReadAction", target: absoluteUrl(book.readHref) },
              hasPart: book.chapters.map((chapter) => ({
                "@type": "Chapter",
                name: chapter.title,
                position: chapter.number,
                url: absoluteUrl(chapter.href),
              })),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Books", item: absoluteUrl("/books") },
                { "@type": "ListItem", position: 2, name: book.title, item: url },
              ],
            },
          ],
        }}
      />
    </article>
  );
}
