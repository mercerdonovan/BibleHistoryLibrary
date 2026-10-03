import { Suspense } from "react";

import { PageIntro } from "@/components/layout/page-intro";
import { SearchExperience } from "@/components/search/search-experience";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Search",
  description: "Search the full text of every tract in the Bible History Library — by word, topic or Bible reference.",
  path: "/search",
});

const SUGGESTIONS = ["Sabbath", "John 3:16", "faith", "Holy Spirit", "resurrection", "Babylon", "creation", "grace"];

export default function SearchPage() {
  return (
    <>
      <PageIntro eyebrow="Search" title="Find it in the text." />
      <div className="container-page min-h-[50vh] pt-10 sm:pt-14">
        {/* Reads ?q= from the URL, which is only known on the client. */}
        <Suspense fallback={<p className="text-sm text-ink-muted">Loading search…</p>}>
          <SearchExperience suggestions={SUGGESTIONS} />
        </Suspense>
      </div>
    </>
  );
}
