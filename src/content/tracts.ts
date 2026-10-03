import type { TractMeta } from "@/lib/types";

/**
 * Presentation metadata for each tract.
 *
 * Everything here is supporting site copy and art direction. The tract
 * wording itself lives in content/tracts/<slug>.json and is generated from
 * the source PDF — it is never edited here.
 *
 * To add a tract: drop the PDF in Doccuments/Tracts, run the extract and
 * verify scripts, then add an entry below.
 */
export const tractMeta: TractMeta[] = [
  {
    slug: "the-love-of-god",
    title: "The Love of God",
    seriesId: "good-news",
    description:
      "Why sinners need not be afraid of God. A study of the love that gave His Son, and what that love does in those who believe it.",
    theme: {
      accent: { light: "#8c2233", dark: "#ea8f9d" },
      cover: { from: "#6a1728", to: "#260812", glow: "#e0788a" },
      motif: "rings",
    },
    addedAt: "2026-10-03",
    featured: true,
  },
  {
    slug: "justified-by-faith",
    title: "Justified by Faith",
    seriesId: "good-news",
    description:
      "What the Bible means by justification and sanctification, how sin entered the world, and the remedy God provides through faith.",
    theme: {
      accent: { light: "#2b4a8f", dark: "#9fb8f4" },
      cover: { from: "#21346b", to: "#0b1330", glow: "#7f9cf0" },
      motif: "divide",
    },
    addedAt: "2026-10-03",
    featured: true,
  },
  {
    slug: "walking-in-the-spirit",
    title: "Walking in the Spirit",
    seriesId: "good-news",
    description:
      "Christianity as a new life rather than an improved one: abiding in the vine, repentance, and love that fulfils the commandments.",
    theme: {
      accent: { light: "#1d6658", dark: "#84d4c2" },
      cover: { from: "#1c5247", to: "#08211d", glow: "#5fcdb4" },
      motif: "waves",
    },
    addedAt: "2026-10-03",
  },
  {
    slug: "gold-tried-in-fire",
    title: "Gold Tried in Fire",
    seriesId: "good-news",
    description:
      "The message to Laodicea, the foolish virgins, and the genuine love that Scripture calls gold tried in the fire.",
    theme: {
      accent: { light: "#96500f", dark: "#f2b76b" },
      cover: { from: "#8a4310", to: "#2c1204", glow: "#f5a742" },
      motif: "embers",
    },
    addedAt: "2026-10-03",
    featured: true,
  },
  {
    slug: "sabbath-rest",
    title: "Sabbath Rest",
    seriesId: "law-and-rest",
    description:
      "The fourth commandment, the Sabbath and creation, and what it means to enter God’s rest.",
    theme: {
      accent: { light: "#45509a", dark: "#b0baf6" },
      cover: { from: "#333f80", to: "#11152f", glow: "#98a4f5" },
      motif: "arcs",
    },
    addedAt: "2026-10-03",
  },
  {
    slug: "christ-cleanses-us",
    title: "Christ Cleanses Us",
    seriesId: "good-news",
    description:
      "Confession, pruning and a cleansed conscience: how Christ deals with sin in those who are joined to Him.",
    theme: {
      accent: { light: "#13627b", dark: "#7fcde5" },
      cover: { from: "#125469", to: "#061f28", glow: "#58c4e6" },
      motif: "strata",
    },
    addedAt: "2026-10-03",
  },
  {
    slug: "nailed-to-the-cross",
    title: "Nailed to the Cross",
    seriesId: "law-and-rest",
    description:
      "What the “handwriting of ordinances” was, how faith establishes the law, and the place of the Ten Commandments.",
    theme: {
      accent: { light: "#475266", dark: "#bac5d9" },
      cover: { from: "#394152", to: "#11141b", glow: "#a9b7d1" },
      motif: "frames",
    },
    addedAt: "2026-10-03",
  },
  {
    slug: "when-we-die",
    title: "When We Die",
    seriesId: "things-to-come",
    description:
      "What Scripture says about death, immortality and eternal fire — and the hope of life at Christ’s return.",
    theme: {
      accent: { light: "#5a4a96", dark: "#c0b3f2" },
      cover: { from: "#40357a", to: "#130f26", glow: "#a892f5" },
      motif: "horizon",
    },
    addedAt: "2026-10-03",
    featured: true,
  },
  {
    slug: "the-holy-spirit",
    title: "The Holy Spirit",
    seriesId: "father-son-and-spirit",
    description:
      "The Spirit in the Old and New Testaments: who indwells the believer, the Comforter, and the latter rain.",
    theme: {
      accent: { light: "#1e5c96", dark: "#93c6f3" },
      cover: { from: "#1c558c", to: "#081d33", glow: "#6db7f7" },
      motif: "rays",
    },
    addedAt: "2026-10-03",
  },
  {
    slug: "spirit-of-antichrist",
    title: "Spirit of Antichrist",
    seriesId: "father-son-and-spirit",
    description:
      "The Bible’s own definitions of antichrist, and how the Reformers identified the system it describes.",
    theme: {
      accent: { light: "#7a2560", dark: "#e7a0cd" },
      cover: { from: "#571744", to: "#170513", glow: "#de6fb6" },
      motif: "eclipse",
    },
    addedAt: "2026-10-03",
  },
  {
    slug: "the-father-and-son",
    title: "The Father and Son",
    seriesId: "father-son-and-spirit",
    description:
      "Who God is, whether Jesus is truly God’s Son, and whom Scripture tells us to worship.",
    theme: {
      accent: { light: "#6a671a", dark: "#d8d480" },
      cover: { from: "#5c5a1b", to: "#1d1c08", glow: "#d6d05c" },
      motif: "orbit",
    },
    addedAt: "2026-10-03",
  },
  {
    slug: "babylon-is-fallen",
    title: "Babylon Is Fallen",
    seriesId: "things-to-come",
    description:
      "The three angels’ messages of Revelation 14: the judgment, the fall of Babylon, and the mark of the beast.",
    theme: {
      accent: { light: "#93381e", dark: "#f1a68a" },
      cover: { from: "#7a2d17", to: "#230c06", glow: "#f07c52" },
      motif: "steps",
    },
    addedAt: "2026-10-03",
  },
  {
    slug: "jesus-will-return",
    title: "Jesus Will Return",
    seriesId: "things-to-come",
    description:
      "The Second Coming as the Bible describes it: the resurrection, the millennium, and the counterfeits to watch for.",
    theme: {
      accent: { light: "#845f17", dark: "#e9c56e" },
      cover: { from: "#806014", to: "#281c04", glow: "#f2cd62" },
      motif: "rays",
    },
    addedAt: "2026-10-03",
  },
  {
    slug: "six-days-of-creation",
    title: "Six Days of Creation",
    seriesId: "in-the-beginning",
    description:
      "Creation in six literal days: what Jesus taught, what Genesis says, and the evidence offered for a young earth.",
    theme: {
      accent: { light: "#3e6a29", dark: "#abdb91" },
      cover: { from: "#345a22", to: "#101f0a", glow: "#8fd966" },
      motif: "strata",
    },
    addedAt: "2026-10-03",
  },
];
