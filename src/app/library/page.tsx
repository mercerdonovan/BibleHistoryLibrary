import { PageIntro } from "@/components/layout/page-intro";
import { LibraryExplorer } from "@/components/library/library-explorer";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { getAllTracts, getTractsBySeries } from "@/lib/tracts";

const description =
  "Every tract in the Bible History Library, arranged by series. Filter by title or topic, then read online, print or download.";

export const metadata = pageMetadata({ title: "Library", description, path: "/library" });

export default async function LibraryPage() {
  const [groups, tracts] = await Promise.all([getTractsBySeries(), getAllTracts()]);

  return (
    <>
      <PageIntro eyebrow="The library" title="Every tract, on one shelf.">
        <p>
          {tracts.length} Bible studies in {groups.length} series. Each follows the same pattern: a
          question, the passage that answers it, and a short note.
        </p>
      </PageIntro>
      <div className="container-page">
        <LibraryExplorer groups={groups} />
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Library",
          description,
          url: absoluteUrl("/library"),
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: tracts.length,
            itemListElement: tracts.map((tract, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: tract.title,
              url: absoluteUrl(tract.href),
            })),
          },
        }}
      />
    </>
  );
}
