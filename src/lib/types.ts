/**
 * Content model.
 *
 * Two layers are kept deliberately apart:
 *
 *   TractBody  — canonical wording, generated from the source PDF by
 *                scripts/extract_tracts.py. Never hand-edited.
 *   TractMeta  — presentation metadata written for the site (display title,
 *                series, colours, SEO copy). Never mixed into the body.
 *
 * `Tract` is the joined shape the UI consumes. A CMS can replace the file
 * loaders in src/lib/tracts.ts without touching any component.
 */

export interface TextRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  small?: boolean;
}

export type BlockType = "paragraph" | "heading" | "question" | "scripture" | "note" | "label";

export interface TractBlock {
  type: BlockType;
  /** Present on questions: the number printed in the source. */
  number?: number;
  align?: "center";
  runs: TextRun[];
}

export interface TractBody {
  slug: string;
  order: number;
  sourcePdf: string;
  /** Title exactly as printed on the tract. */
  sourceTitle: string;
  pageCount: number;
  blocks: TractBlock[];
}

export type CoverMotif =
  | "rings"
  | "rays"
  | "strata"
  | "arcs"
  | "waves"
  | "eclipse"
  | "steps"
  | "embers"
  | "orbit"
  | "frames"
  | "horizon"
  | "divide";

export interface TractTheme {
  /** Accent used for links, rules and emphasis on the reading page. */
  accent: { light: string; dark: string };
  /** Cover artwork: a two-stop wash plus a generative motif. */
  cover: { from: string; to: string; glow: string };
  motif: CoverMotif;
}

export interface TractMeta {
  slug: string;
  /** Display title for covers, cards and metadata. Placeholder-safe: separate from the printed title. */
  title: string;
  seriesId: SeriesId;
  /** Supporting summary for cards, search and SEO. Not tract wording. */
  description: string;
  theme: TractTheme;
  /** ISO date the tract was added to the library. */
  addedAt: string;
  featured?: boolean;
  /** Optional hand-picked related tracts; otherwise derived from the series. */
  related?: string[];
}

export type SeriesId =
  | "good-news"
  | "law-and-rest"
  | "father-son-and-spirit"
  | "things-to-come"
  | "in-the-beginning";

export interface Series {
  id: SeriesId;
  title: string;
  description: string;
  order: number;
}

export interface Tract extends TractMeta {
  order: number;
  series: Series;
  href: string;
  pdfHref: string;
  sourceTitle: string;
  pageCount: number;
  wordCount: number;
  questionCount: number;
  readingMinutes: number;
}

export interface TractSection {
  id: string;
  /** Heading text as printed, or null for the opening passage. */
  heading: TractBlock | null;
  blocks: { index: number; block: TractBlock }[];
}

export interface SearchPassage {
  /** Block anchor on the tract page. */
  anchor: string;
  type: BlockType;
  text: string;
}

export interface SearchDocument {
  slug: string;
  title: string;
  series: string;
  description: string;
  order: number;
  passages: SearchPassage[];
}
