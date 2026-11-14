export interface SearchPassage {
  /** Block anchor on the chapter page. */
  anchor: string;
  type: "paragraph" | "callout";
  text: string;
}

/** One chapter of one book. */
export interface SearchDocument {
  id: string;
  href: string;
  bookTitle: string;
  chapterLabel: string;
  /** Chapter title as printed. */
  title: string;
  /** Book order, then chapter order. */
  order: number;
  passages: SearchPassage[];
}

export interface SearchHit {
  document: SearchDocument;
  score: number;
  /** Number of passages containing every search term. */
  matchCount: number;
  passages: SearchPassage[];
}

/** Case-, accent- and quote-insensitive form. Length-preserving, so offsets map back to the original. */
export function fold(value: string): string {
  return value
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .toLowerCase();
}

export function queryTerms(query: string): string[] {
  return [...new Set(fold(query).split(/\s+/).filter(Boolean))];
}

const PASSAGE_WEIGHT: Record<SearchPassage["type"], number> = {
  callout: 12,
  paragraph: 9,
};

export function searchDocuments(documents: SearchDocument[], query: string, passagesPerHit = 3): SearchHit[] {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];
  const phrase = fold(query.trim());

  const hits: SearchHit[] = [];
  for (const document of documents) {
    const titleMatch = terms.every((term) => fold(document.title).includes(term));

    const scored = document.passages
      .map((passage) => {
        const text = fold(passage.text);
        if (!terms.every((term) => text.includes(term))) return null;
        const phraseBonus = terms.length > 1 && text.includes(phrase) ? 12 : 0;
        return { passage, score: PASSAGE_WEIGHT[passage.type] + phraseBonus };
      })
      .filter((entry): entry is { passage: SearchPassage; score: number } => entry !== null)
      .sort((a, b) => b.score - a.score);

    if (!titleMatch && scored.length === 0) continue;

    hits.push({
      document,
      matchCount: scored.length,
      score:
        (titleMatch ? 120 : 0) +
        scored.slice(0, 8).reduce((total, entry) => total + entry.score, 0),
      passages: scored.slice(0, passagesPerHit).map((entry) => entry.passage),
    });
  }

  return hits.sort((a, b) => b.score - a.score || a.document.order - b.document.order);
}

export interface SnippetPart {
  text: string;
  match: boolean;
}

/** A window of the passage around the first match, split into highlighted parts. */
export function snippet(text: string, terms: string[], radius = 110): SnippetPart[] {
  const folded = fold(text);
  const first = terms.reduce((earliest, term) => {
    const at = folded.indexOf(term);
    return at >= 0 && at < earliest ? at : earliest;
  }, Number.POSITIVE_INFINITY);
  const anchor = Number.isFinite(first) ? first : 0;

  let start = Math.max(0, anchor - radius);
  let end = Math.min(text.length, anchor + radius * 1.6);
  if (start > 0) start = text.indexOf(" ", start) + 1 || start;
  if (end < text.length) end = text.lastIndexOf(" ", end) > start ? text.lastIndexOf(" ", end) : end;

  const ranges: [number, number][] = [];
  for (const term of terms) {
    for (let at = folded.indexOf(term, start); at >= 0 && at < end; at = folded.indexOf(term, at + term.length)) {
      ranges.push([at, Math.min(at + term.length, end)]);
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);

  const parts: SnippetPart[] = [];
  let cursor = start;
  if (start > 0) parts.push({ text: "… ", match: false });
  for (const [from, to] of ranges) {
    if (from < cursor) continue;
    if (from > cursor) parts.push({ text: text.slice(cursor, from), match: false });
    parts.push({ text: text.slice(from, to), match: true });
    cursor = to;
  }
  if (cursor < end) parts.push({ text: text.slice(cursor, end), match: false });
  if (end < text.length) parts.push({ text: " …", match: false });
  return parts;
}
