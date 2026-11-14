import type { BookMeta } from "@/lib/book-types";

/**
 * Presentation metadata for each book, in shelf order.
 *
 * Supporting site copy and art direction only. The book's wording lives in
 * content/books/<slug>/ and is generated from the source PDF by
 * scripts/extract_book.py — it is never edited here.
 */
export const bookMeta: BookMeta[] = [
  {
    slug: "end-times",
    title: "The End Times",
    description:
      "From the persecutions of the first centuries, through the Reformation, to the last conflict and the return of Christ: eighteen chapters on the history of the church and what Scripture says is still to come.",
    addedAt: "2026-10-03",
    featured: true,
    theme: {
      accent: { light: "#85591a", dark: "#e5c173" },
      stage: { from: "#17204a", to: "#05070f", glow: "#d9b56c" },
    },
    imageAlt: {
      2: "Painting of a young woman in white standing before Roman officials and soldiers beside a burning altar.",
      12: "Painting of travellers approaching a stone and timber farmhouse in a green Alpine valley beneath snow-covered peaks.",
      24: "Portrait of Martin Luther in a black cap and gown.",
      32: "Painting of a monk in a dark habit standing before a long hall filled with seated dignitaries.",
      38: "Painting of a man bound to a stake above a pile of wood in a town square, with onlookers gathered round.",
      48: "Illustration of the Statue of Liberty holding up her torch, with the face of Jesus beside her against a night sky.",
      62: "Painting of a lush garden at sunset, with a river, flowers and animals, and a figure reaching up into a tree.",
      70: "Illustration of people seated around a table in a living room, looking up at a pale, glowing figure of a woman.",
      75: "Black-and-white picture of a clergyman and a man in a suit clasping hands in front of church buildings.",
      80: "Illustration of two women in a sitting room, one working at a laptop and one reading an open Bible.",
      90: "Painting of a kneeling man clinging to a figure in white robes on a hillside beneath a stormy sky.",
      98: "Painting of a crowd looking up toward a radiant figure descending in bright light, surrounded by angels.",
    },
    // Pages 32, 38 and 75 show a cross or church spires, so they stay in the reader only.
    artwork: [2, 12, 24, 48, 62, 70, 80, 90, 98],
    searchSuggestions: [
      "Luther",
      "Waldenses",
      "Wycliffe",
      "Sabbath",
      "Reformation",
      "mark of the beast",
      "Revelation 14",
      "time of trouble",
    ],
    highlight: { chapter: "the-early-reformers", anchor: "b24" },
  },
];
