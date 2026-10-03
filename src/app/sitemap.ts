import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/config/site";
import { getAllTracts } from "@/lib/tracts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tracts = await getAllTracts();
  const newest = tracts.reduce((latest, tract) => (tract.addedAt > latest ? tract.addedAt : latest), "");

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: newest, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/library"), lastModified: newest, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/search"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/books"), changeFrequency: "monthly", priority: 0.3 },
  ];

  return [
    ...pages,
    ...tracts.map((tract) => ({
      url: absoluteUrl(tract.href),
      lastModified: tract.addedAt,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
