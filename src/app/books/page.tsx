import { ArrowRight, Download } from "lucide-react";
import Link from "next/link";

import { BookCover } from "@/components/book/book-cover";
import { BookShelf } from "@/components/book/book-shelf";
import { BookStage } from "@/components/book/book-stage";
import { ResumeLink } from "@/components/book/resume-link";
import { PageIntro } from "@/components/layout/page-intro";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { SharingNoticeBrief } from "@/components/sharing-notice";
import { buttonClasses, ButtonLink } from "@/components/ui/button";
import { absoluteUrl, siteConfig } from "@/config/site";
import type { Book } from "@/lib/book-types";
import { formatDuration, getAllBooks } from "@/lib/books";
import { pageMetadata } from "@/lib/seo";

const description =
  "Every book in the Bible History Library, each with a complete web edition to read chapter by chapter and the original PDF to download.";

export const metadata = pageMetadata({ title: "Books", description, path: "/books" });

function BookFacts({ book }: { book: Book }) {
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-3">
      {[
        { term: "Chapters", detail: book.chapters.length },
        { term: "Printed pages", detail: book.pageCount },
        { term: "Reading time", detail: formatDuration(book.readingMinutes) },
      ].map(({ term, detail }) => (
        <div key={term} className="flex flex-col-reverse">
          <dt className="text-[0.72rem] uppercase tracking-[0.16em] text-white/60">{term}</dt>
          <dd className="font-display text-[1.35rem]">{detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/** A book presented on its own stage, with everything needed to start reading. */
function BookFeature({ book, priority }: { book: Book; priority: boolean }) {
  return (
    <BookStage book={book} aria-labelledby={`${book.slug}-title`} className="rounded-xl shadow-card">
      <div className="grid items-center gap-10 p-7 sm:p-12 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16 lg:p-16">
        <Link href={book.href} aria-label={`${book.title}: about the book`} className="mx-auto block w-[62%] max-w-[18rem] lg:w-full">
          <BookCover book={book} sizes="(min-width: 64rem) 20rem, 60vw" priority={priority} />
        </Link>
        <div>
          <h2 id={`${book.slug}-title`} className="display text-[clamp(2.6rem,7vw,4.8rem)] leading-[0.96]">
            <Link href={book.href} className="link-underline">
              {book.title}
            </Link>
          </h2>
          {book.coverLine ? (
            <p className="display mt-3 text-[1.4rem] italic sm:text-[1.7rem]" style={{ color: book.theme.stage.glow }}>
              {book.coverLine}
            </p>
          ) : null}
          <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-white/80">{book.description}</p>
          <div className="mt-7">
            <BookFacts book={book} />
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <ResumeLink
              bookSlug={book.slug}
              startHref={book.readHref}
              chapters={book.chapters.map(({ slug, href, label }) => ({ slug, href, label }))}
              variant="stageSolid"
            />
            <ButtonLink href={book.href} variant="stage">
              About the book <ArrowRight aria-hidden="true" />
            </ButtonLink>
            <a href={book.pdfHref} download={book.pdfFileName} className={buttonClasses("stage")}>
              <Download aria-hidden="true" />
              PDF
            </a>
          </div>
          <SharingNoticeBrief className="mt-6 text-white/65" />
        </div>
      </div>
    </BookStage>
  );
}

export default async function BooksPage() {
  const books = await getAllBooks();

  return (
    <>
      <PageIntro eyebrow="The library" title="Every book, free to read.">
        <p>
          {books.length === 1 ? "One book so far" : `${books.length} books`}, each given in full: a web
          edition to read chapter by chapter, and the printed edition to download.
        </p>
      </PageIntro>

      {books.length > 1 ? (
        <section aria-label="The shelf" className="pt-6">
          <BookShelf books={books} headingLevel="h2" />
        </section>
      ) : null}

      <div className="container-page space-y-8 pt-10 sm:space-y-10 sm:pt-14">
        {books.map((book, index) => (
          <Reveal key={book.slug}>
            <BookFeature book={book} priority={index === 0} />
          </Reveal>
        ))}
      </div>

      <div className="container-page">
        <Reveal className="mt-16 grid gap-8 border-t border-line pt-10 sm:mt-24 sm:grid-cols-2 sm:gap-12">
          <div>
            <h2 className="display text-[1.7rem] sm:text-[2rem]">More are in preparation.</h2>
            <p className="mt-3 max-w-md text-[0.98rem] leading-relaxed text-ink-muted">
              Further books will join the library as their web editions are finished. Each one will
              be given in full, word for word as printed.
            </p>
            <ButtonLink href="/search" variant="outline" className="mt-6">
              Search the library <ArrowRight aria-hidden="true" />
            </ButtonLink>
          </div>
          <div>
            <h2 className="display text-[1.7rem] sm:text-[2rem]">Printed copies</h2>
            <p className="mt-3 max-w-md text-[0.98rem] leading-relaxed text-ink-muted">
              To ask for a printed copy of a book, write to{" "}
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="font-semibold text-ink underline decoration-gold-bright underline-offset-4"
              >
                {siteConfig.contactEmail}
              </a>
              .
            </p>
            <ButtonLink href="/contact" variant="outline" className="mt-6">
              How to order copies
            </ButtonLink>
          </div>
        </Reveal>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Books",
          description,
          url: absoluteUrl("/books"),
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: books.length,
            itemListElement: books.map((book, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: book.title,
              url: absoluteUrl(book.href),
            })),
          },
        }}
      />
    </>
  );
}
