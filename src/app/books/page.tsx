import { ArrowRight, Download } from "lucide-react";
import Link from "next/link";

import { BookCover } from "@/components/book/book-cover";
import { bookAccentStyle, bookStageBackground } from "@/components/book/book-style";
import { ResumeLink } from "@/components/book/resume-link";
import { PageIntro } from "@/components/layout/page-intro";
import { Reveal } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { SharingNoticeBrief } from "@/components/sharing-notice";
import { buttonClasses, ButtonLink } from "@/components/ui/button";
import { absoluteUrl, siteConfig } from "@/config/site";
import { formatDuration, getAllBooks } from "@/lib/books";
import { pageMetadata } from "@/lib/seo";

const description =
  "Books from the Bible History Library, each with a full web edition to read chapter by chapter and the original PDF to download.";

export const metadata = pageMetadata({ title: "Books", description, path: "/books" });

export default async function BooksPage() {
  const books = await getAllBooks();
  const [lead, ...rest] = books;
  if (!lead) return null;

  return (
    <>
      <PageIntro eyebrow="Books" title="Longer works, made to be read.">
        <p>
          Each book has a web edition to read chapter by chapter, and the original printed edition
          to download.
        </p>
      </PageIntro>

      <div className="container-page pt-10 sm:pt-14">
        {/* Lead book */}
        <Reveal>
          <section
            aria-labelledby={`${lead.slug}-title`}
            className="grain overflow-hidden rounded-xl text-stage-ink shadow-card"
            style={{ background: bookStageBackground(lead) }}
          >
            <div className="grid items-center gap-10 p-7 sm:p-12 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-16 lg:p-16">
              <Link href={lead.href} aria-label={`${lead.title}: about the book`} className="mx-auto block w-[68%] max-w-[20rem] lg:w-full">
                <BookCover book={lead} sizes="(min-width: 64rem) 22rem, 60vw" priority />
              </Link>
              <div>
                <p className="eyebrow" style={{ color: lead.theme.stage.glow }}>
                  {books.length === 1 ? "The first book" : "Newest book"}
                </p>
                <h2 id={`${lead.slug}-title`} className="display mt-4 text-[clamp(2.6rem,7vw,4.8rem)] leading-[0.96]">
                  <Link href={lead.href} className="link-underline">
                    {lead.title}
                  </Link>
                </h2>
                <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-white/80">{lead.description}</p>
                <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3">
                  {[
                    { term: "Chapters", detail: lead.chapters.length },
                    { term: "Printed pages", detail: lead.pageCount },
                    { term: "Reading time", detail: formatDuration(lead.readingMinutes) },
                  ].map(({ term, detail }) => (
                    <div key={term} className="flex flex-col-reverse">
                      <dt className="text-[0.72rem] uppercase tracking-[0.16em] text-white/60">{term}</dt>
                      <dd className="font-display text-[1.35rem]">{detail}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-8 flex flex-wrap items-center gap-2.5">
                  <ResumeLink
                    bookSlug={lead.slug}
                    startHref={lead.readHref}
                    chapters={lead.chapters.map(({ slug, href, label }) => ({ slug, href, label }))}
                    variant="stageSolid"
                  />
                  <ButtonLink href={lead.href} variant="stage">
                    About the book <ArrowRight aria-hidden="true" />
                  </ButtonLink>
                  <a href={lead.pdfHref} download={lead.pdfFileName} className={buttonClasses("stage")}>
                    <Download aria-hidden="true" />
                    PDF
                  </a>
                </div>
                <SharingNoticeBrief className="mt-6 text-white/65" />
              </div>
            </div>
          </section>
        </Reveal>

        {/* Further books: a shelf that grows as titles are added */}
        {rest.length > 0 ? (
          <section aria-labelledby="more-books-title" className="pt-16 sm:pt-24">
            <h2 id="more-books-title" className="display text-[2rem] sm:text-[2.6rem]">
              More books
            </h2>
            <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
              {rest.map((book) => (
                <li key={book.slug}>
                  <Link href={book.href} className="accent-scope group block" style={bookAccentStyle(book)}>
                    <BookCover book={book} sizes="(min-width: 64rem) 16rem, 45vw" />
                    <h3 className="display mt-5 text-[1.3rem] leading-tight transition-colors group-hover:text-accent">
                      {book.title}
                    </h3>
                    <p className="mt-1 text-[0.8rem] text-ink-muted">
                      {book.chapters.length} chapters · {book.pageCount} pages
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <Reveal className="mt-16 grid gap-8 border-t border-line pt-10 sm:mt-24 sm:grid-cols-2 sm:gap-12">
          <div>
            <h2 className="display text-[1.7rem] sm:text-[2rem]">More are in preparation.</h2>
            <p className="mt-3 max-w-md text-[0.98rem] leading-relaxed text-ink-muted">
              Further books will join this shelf as their web editions are finished. The tract
              library is open in the meantime.
            </p>
            <ButtonLink href="/library" variant="outline" className="mt-6">
              Browse the tracts <ArrowRight aria-hidden="true" />
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
