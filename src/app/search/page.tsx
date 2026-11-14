import { Suspense } from "react";

import { PageIntro } from "@/components/layout/page-intro";
import { SearchExperience } from "@/components/search/search-experience";
import { getAllBooks } from "@/lib/books";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Search",
  description: "Search the full text of every book in the Bible History Library — by word, name, phrase or Bible reference.",
  path: "/search",
});

export default async function SearchPage() {
  const books = await getAllBooks();
  // A few suggestions from each book, all known to appear in the text.
  const suggestions = [...new Set(books.flatMap((book) => book.searchSuggestions.slice(0, books.length > 1 ? 4 : 8)))];

  return (
    <>
      <PageIntro eyebrow="Search" title="Find it in the text." />
      <div className="container-page min-h-[50vh] pt-10 sm:pt-14">
        {/* Reads ?q= from the URL, which is only known on the client. */}
        <Suspense fallback={<p className="text-sm text-ink-muted">Loading search…</p>}>
          <SearchExperience suggestions={suggestions} showBookTitles={books.length > 1} />
        </Suspense>
      </div>
    </>
  );
}
