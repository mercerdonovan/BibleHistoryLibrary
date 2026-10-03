import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

import { series as allSeries } from "@/content/series";
import { blockAnchor } from "@/lib/block-anchor";
import { tractMeta } from "@/content/tracts";
import type {
  SearchDocument,
  Series,
  Tract,
  TractBlock,
  TractBody,
  TractSection,
} from "@/lib/types";

/**
 * Data access for tracts. This is the only module that knows the content is
 * file-based; swapping in a CMS means re-implementing these functions.
 */

const CONTENT_DIR = path.join(process.cwd(), "content", "tracts");
const WORDS_PER_MINUTE = 220;

export const blockText = (block: TractBlock): string => block.runs.map((run) => run.text).join("");

export const getTractBody = cache(async (slug: string): Promise<TractBody> => {
  const file = await readFile(path.join(CONTENT_DIR, `${slug}.json`), "utf8");
  return JSON.parse(file) as TractBody;
});

export const getSeries = (): Series[] => [...allSeries].sort((a, b) => a.order - b.order);

export const getAllTracts = cache(async (): Promise<Tract[]> => {
  const tracts = await Promise.all(
    tractMeta.map(async (meta): Promise<Tract> => {
      const body = await getTractBody(meta.slug);
      const tractSeries = allSeries.find((item) => item.id === meta.seriesId);
      if (!tractSeries) throw new Error(`Unknown series "${meta.seriesId}" on tract "${meta.slug}"`);

      const wordCount = body.blocks.reduce(
        (total, block) => total + blockText(block).split(/\s+/).filter(Boolean).length,
        0,
      );

      return {
        ...meta,
        order: body.order,
        series: tractSeries,
        href: `/tracts/${meta.slug}`,
        pdfHref: `/pdfs/${meta.slug}.pdf`,
        sourceTitle: body.sourceTitle,
        pageCount: body.pageCount,
        wordCount,
        questionCount: body.blocks.filter((block) => block.type === "question").length,
        readingMinutes: Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE)),
      };
    }),
  );
  return tracts.sort((a, b) => a.order - b.order);
});

export async function getTract(slug: string): Promise<Tract | undefined> {
  return (await getAllTracts()).find((tract) => tract.slug === slug);
}

export async function getTractsBySeries(): Promise<{ series: Series; tracts: Tract[] }[]> {
  const tracts = await getAllTracts();
  return getSeries()
    .map((item) => ({ series: item, tracts: tracts.filter((tract) => tract.seriesId === item.id) }))
    .filter((group) => group.tracts.length > 0);
}

export async function getFeaturedTracts(): Promise<Tract[]> {
  return (await getAllTracts()).filter((tract) => tract.featured);
}

export async function getNewestTracts(limit = 6): Promise<Tract[]> {
  return [...(await getAllTracts())]
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt) || b.order - a.order)
    .slice(0, limit);
}

export async function getAdjacentTracts(slug: string): Promise<{ previous?: Tract; next?: Tract }> {
  const tracts = await getAllTracts();
  const index = tracts.findIndex((tract) => tract.slug === slug);
  return { previous: tracts[index - 1], next: tracts[index + 1] };
}

export async function getRelatedTracts(tract: Tract, limit = 3): Promise<Tract[]> {
  const tracts = await getAllTracts();
  const others = tracts.filter((item) => item.slug !== tract.slug);
  const picked = (tract.related ?? [])
    .map((slug) => others.find((item) => item.slug === slug))
    .filter((item): item is Tract => Boolean(item));

  // Fill from the same series first, then by nearness in reading order.
  const byNearness = [...others].sort(
    (a, b) =>
      Number(b.seriesId === tract.seriesId) - Number(a.seriesId === tract.seriesId) ||
      Math.abs(a.order - tract.order) - Math.abs(b.order - tract.order),
  );
  for (const item of byNearness) {
    if (picked.length >= limit) break;
    if (!picked.includes(item)) picked.push(item);
  }
  return picked.slice(0, limit);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Group a tract into sections at each printed heading. */
export function getTractSections(body: TractBody): TractSection[] {
  const sections: TractSection[] = [{ id: "opening", heading: null, blocks: [] }];
  const used = new Set<string>(["opening"]);

  body.blocks.forEach((block, index) => {
    if (block.type === "heading") {
      const base = slugify(blockText(block)) || "section";
      let id = base;
      for (let n = 2; used.has(id); n += 1) id = `${base}-${n}`;
      used.add(id);
      sections.push({ id, heading: block, blocks: [{ index, block }] });
    } else {
      sections[sections.length - 1]?.blocks.push({ index, block });
    }
  });

  return sections.filter((section) => section.blocks.length > 0);
}

export async function getSearchDocuments(): Promise<SearchDocument[]> {
  const tracts = await getAllTracts();
  return Promise.all(
    tracts.map(async (tract) => {
      const body = await getTractBody(tract.slug);
      return {
        slug: tract.slug,
        title: tract.title,
        series: tract.series.title,
        description: tract.description,
        order: tract.order,
        passages: body.blocks.map((block, index) => ({
          anchor: blockAnchor(index),
          type: block.type,
          text: blockText(block),
        })),
      };
    }),
  );
}
