#!/usr/bin/env python3
"""
Extract a book from its source PDFs into structured JSON, images and a cover.

    .venv/bin/pip install pymupdf pillow
    .venv/bin/python scripts/extract_book.py

Reads   Doccuments/Books/PDF End Times 103 pages.pdf   (the book)
        Doccuments/Books/PDF End Times Cover.pdf       (the printed cover spread)
        Doccuments/Books/End Times 103 pages new.pages (only to settle line-end hyphens)
Writes  content/books/end-times/book.json              (title, chapters, cover text)
        content/books/end-times/chapters/NN-slug.json  (canonical chapter text)
        public/book-assets/end-times/…                     (cover, pictures, PDF)

The PDF is the canonical source. The extractor never changes wording. It:
  - reads the two text columns of each page in order,
  - starts a paragraph wherever the book indents one,
  - keeps the boxed call-out quotations as their own blocks, in place,
  - places each full-page picture at the paragraph break where it falls,
  - records bold / italic emphasis as marks.

One thing a PDF cannot say is whether a hyphen at the end of a line belongs
to the word ("ninety-five") or was added by the layout ("punish-ment"). For
those the decision is made by the KEEP_HYPHEN table below, and every decision
is written to content/books/<slug>/line-end-hyphens.txt for review.

Run scripts/verify_book.py afterwards.
"""

from __future__ import annotations

import json
import re
import shutil
import sys
import zipfile
from pathlib import Path

import fitz  # PyMuPDF
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "Doccuments" / "Books"

BOOK = {
    "slug": "end-times",
    "pdf": "PDF End Times 103 pages.pdf",
    "cover_pdf": "PDF End Times Cover.pdf",
    "pages_source": "End Times 103 pages new.pages",
}

PAGE_MIDDLE = 306
TITLE_SIZE = 40
CALLOUT_SIZE = 13
CALLOUT_GROUP_GAP = 20
IMAGE_DPI = 200
DASHES = "-–—"
CHAPTER_LABEL = re.compile(r"Chapter \d+")


# ── Pages document (hyphenation reference only) ────────────────────────────


def _snappy(data: bytes) -> bytes:
    i = 0
    while data[i] & 0x80:
        i += 1
    i += 1
    out = bytearray()
    while i < len(data):
        tag = data[i]
        i += 1
        kind = tag & 3
        if kind == 0:
            length = tag >> 2
            if length < 60:
                length += 1
            else:
                size = length - 59
                length = int.from_bytes(data[i : i + size], "little") + 1
                i += size
            out += data[i : i + length]
            i += length
            continue
        if kind == 1:
            length = ((tag >> 2) & 7) + 4
            offset = ((tag >> 5) << 8) | data[i]
            i += 1
        else:
            size = 2 if kind == 2 else 4
            length = (tag >> 2) + 1
            offset = int.from_bytes(data[i : i + size], "little")
            i += size
        for _ in range(length):
            out.append(out[-offset])
    return bytes(out)


def pages_text(path: Path) -> str:
    """All text stored in a Pages document, with whitespace removed."""
    with zipfile.ZipFile(path) as archive:
        raw = archive.read("Index/Document.iwa")
    out = bytearray()
    i = 0
    while i < len(raw):
        length = int.from_bytes(raw[i + 1 : i + 4], "little")
        out += _snappy(raw[i + 4 : i + 4 + length])
        i += 4 + length
    return re.sub(r"\s+", "", out.decode("utf-8", "replace"))


# ── PDF reading ────────────────────────────────────────────────────────────


def page_lines(page: fitz.Page) -> list[dict]:
    lines = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            spans = [s for s in line["spans"] if "Helvetica" not in s["font"]]  # page numbers
            if not "".join(s["text"] for s in spans).strip():
                continue
            chars = []
            for span in spans:
                style = (bool(span["flags"] & 16), bool(span["flags"] & 2))
                chars.extend((c, style) for c in span["text"])
            x0, y0, x1, _ = line["bbox"]
            size = max(s["size"] for s in spans if s["text"].strip())
            lines.append({"x0": x0, "x1": x1, "y": y0, "size": size, "chars": chars, "page": page.number + 1})
    return lines


def line_text(line: dict) -> str:
    return "".join(c for c, _ in line["chars"])


def reading_order(lines: list[dict]) -> list[dict]:
    """Full-width headings first, then the left column, then the right."""
    def column(line: dict) -> int:
        if line["size"] >= TITLE_SIZE or CHAPTER_LABEL.fullmatch(line_text(line).strip()):
            return 0
        return 1 if (line["x0"] + line["x1"]) / 2 < PAGE_MIDDLE and line["x0"] < 200 else 2

    return sorted(lines, key=lambda l: (column(l), round(l["y"]), l["x0"]))


# Compounds whose hyphen belongs to the word when it falls at the end of a
# line. Every other line-end hyphen is the book's own hyphenation of a single
# word ("punish-ment") and is closed up. Decided from how the book spells the
# same word mid-line elsewhere; the few with no such evidence are marked
# REVIEW in line-end-hyphens.txt.
KEEP_HYPHEN = {
    "sin-stricken", "heaven-sent", "safe-conduct", "self-denial", "seven-hilled",
    "money-changers", "ninety-five", "semi-judaizers", "sabbath-keeping",
    "sabbath-keepers", "leopard-like", "worldly-wise", "well-pleasing",
    "soul-destroying", "well-being", "self-styled", "soon-coming",
    "covenant-keeping", "self-reproach", "palm-branches", "re-instated",
    "school-teacher", "flood-gates", "down-trodden",
}
# No mid-line instance of these exists in the book to confirm the choice.
REVIEW = {"school-teacher", "flood-gates", "down-trodden", "country-men", "anti-christian", "school-men"}


class Hyphens:
    """Decides whether a line-end hyphen is part of the word."""

    def __init__(self, reference: str):
        self.reference = reference
        self.decisions: list[str] = []
        self.unresolved: list[str] = []
        self.kept = 0
        self.removed = 0

    def join(self, before: str, after: str, page: int) -> bool:
        """True to keep the hyphen. `before` ends with it; `after` is the next line."""
        left = re.findall(r"[\w\u2019]+-$", before.strip())
        right = re.findall(r"^[\w\u2019]+", after.strip())
        if not left or not right:
            self.unresolved.append(f"p{page}: …{before.strip()[-30:]!r} + {after.strip()[:20]!r}")
            return True
        word = left[0] + right[0]
        keep = word.lower() in KEEP_HYPHEN
        typed = word in self.reference
        result = word if keep else word.replace("-", "", 1)
        flag = "  REVIEW" if word.lower() in REVIEW else ""
        source = "typed in the Pages source" if typed else "added by the layout"
        self.decisions.append(f"p{page:<4} {word:<22} -> {result:<20} ({source}){flag}")
        self.kept += keep
        self.removed += not keep
        return keep


def join_lines(lines: list[dict], hyphens: Hyphens) -> list[tuple[str, tuple]]:
    chars: list[tuple[str, tuple]] = []
    for line in lines:
        text = line_text(line)
        if chars:
            while chars and chars[-1][0].isspace():
                chars.pop()
            last = chars[-1][0]
            if last == "-":
                before = "".join(c for c, _ in chars[-40:])
                if not hyphens.join(before, text, line["page"]):
                    chars.pop()
            elif last not in DASHES:
                chars.append((" ", chars[-1][1]))
        chars.extend(line["chars"])
    return chars


def to_runs(chars: list[tuple[str, tuple]]) -> list[dict]:
    normalised: list[tuple[str, tuple]] = []
    for char, style in chars:
        if char.isspace():
            if normalised and normalised[-1][0] != " ":
                normalised.append((" ", normalised[-1][1]))
        else:
            normalised.append((char, style))
    while normalised and normalised[-1][0] == " ":
        normalised.pop()

    runs: list[dict] = []
    current = None
    for char, style in normalised:
        if style != current:
            runs.append({"text": "", "_style": style})
            current = style
        runs[-1]["text"] += char
    for run in runs:
        bold, italic = run.pop("_style")
        if bold:
            run["bold"] = True
        if italic:
            run["italic"] = True
    # Emphasis on a lone punctuation mark or space is a stray, not emphasis.
    merged: list[dict] = []
    for run in runs:
        marks = {k: v for k, v in run.items() if k != "text"}
        if merged and (marks == {k: v for k, v in merged[-1].items() if k != "text"} or not re.search(r"\w", run["text"])):
            merged[-1]["text"] += run["text"]
        else:
            merged.append(run)
    return merged


def slugify(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower().replace("’", "")).strip("-")


# ── Book assembly ──────────────────────────────────────────────────────────


def extract_images(doc: fitz.Document, out_dir: Path, slug: str) -> dict[int, dict]:
    """Full-page pictures, rendered exactly as cropped on the printed page (page number removed)."""
    out_dir.mkdir(parents=True, exist_ok=True)
    images: dict[int, dict] = {}
    for page in doc:
        if not page.get_images():
            continue
        for block in page.get_text("dict")["blocks"]:
            if block.get("lines"):
                page.add_redact_annot(fitz.Rect(block["bbox"]))
        page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE, graphics=fitz.PDF_REDACT_LINE_ART_NONE)
        pixmap = page.get_pixmap(dpi=IMAGE_DPI)
        image = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)
        name = f"page-{page.number + 1:03d}.jpg"
        image.save(out_dir / name, "JPEG", quality=88, optimize=True, progressive=True)
        images[page.number + 1] = {
            "src": f"/book-assets/{slug}/images/{name}",
            "width": image.width,
            "height": image.height,
            "page": page.number + 1,
        }
    return images


def extract_cover(pdf: Path, out_dir: Path, slug: str) -> dict:
    """Front cover (right half of the printed spread) and the back-cover text."""
    doc = fitz.open(pdf)
    spread = doc[0]
    half = spread.rect.width / 2
    front = fitz.Rect(half, 0, spread.rect.width, spread.rect.height)
    pixmap = spread.get_pixmap(dpi=IMAGE_DPI, clip=front)
    image = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)
    out_dir.mkdir(parents=True, exist_ok=True)
    image.save(out_dir / "cover.jpg", "JPEG", quality=90, optimize=True, progressive=True)

    front_lines, back_lines = [], []
    for block in spread.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            text = "".join(s["text"] for s in line["spans"])
            if not text.replace("_", "").strip():
                continue
            entry = {"text": text, "x0": line["bbox"][0], "y": line["bbox"][1], "size": max(s["size"] for s in line["spans"])}
            (front_lines if entry["x0"] >= half else back_lines).append(entry)

    # Back cover: the blurb (left-hand text block) as paragraphs, and the return address.
    clean = lambda text: " ".join(text.split())
    blurb_lines = sorted((l for l in back_lines if l["x0"] < 100), key=lambda l: l["y"])
    blurb: list[list[str]] = []
    for previous, line in zip([None, *blurb_lines], blurb_lines):
        if previous is None or line["y"] - previous["y"] > 20:
            blurb.append([])
        blurb[-1].append(clean(line["text"]))
    address = [clean(l["text"]) for l in sorted(back_lines, key=lambda l: l["y"]) if 100 <= l["x0"] < 200]

    return {
        "image": {"src": f"/book-assets/{slug}/cover.jpg", "width": image.width, "height": image.height},
        "frontLines": [clean(l["text"]) for l in sorted(front_lines, key=lambda l: l["y"])],
        "backCover": [" ".join(lines) for lines in blurb],
        "address": address,
    }


def main() -> int:
    slug = BOOK["slug"]
    pdf = SOURCE_DIR / BOOK["pdf"]
    content_dir = ROOT / "content" / "books" / slug
    public_dir = ROOT / "public" / "book-assets" / slug
    chapters_dir = content_dir / "chapters"
    if chapters_dir.exists():
        shutil.rmtree(chapters_dir)
    chapters_dir.mkdir(parents=True)

    hyphens = Hyphens(pages_text(SOURCE_DIR / BOOK["pages_source"]))
    doc = fitz.open(pdf)

    # 1. A flat stream of items in reading order.
    stream: list[dict] = []
    for page in doc:
        lines = reading_order(page_lines(page))
        if page.get_images() and not lines:
            stream.append({"kind": "image", "page": page.number + 1})
            continue
        if page.get_images():
            raise SystemExit(f"p{page.number + 1}: picture shares a page with text; placement needs review")
        for line in lines:
            text = line_text(line)
            if line["size"] >= TITLE_SIZE:
                kind = "title"
            elif line["size"] >= CALLOUT_SIZE:
                kind = "callout"
            elif CHAPTER_LABEL.fullmatch(text.strip()) and line["x0"] > 200:
                kind = "chapter-label"
            else:
                kind = "body"
            stream.append({"kind": kind, "line": line, "page": page.number + 1})

    # 2. Group the stream into chapters and blocks.
    chapters: list[dict] = []
    pending: list[dict] = []          # lines of the paragraph being built
    pending_images: list[int] = []    # pictures waiting for the paragraph to finish
    callout: list[dict] = []
    title_lines: list[dict] = []

    def chapter() -> dict:
        return chapters[-1]

    def flush_paragraph() -> None:
        nonlocal pending
        if pending:
            chapter()["blocks"].append({"type": "paragraph", "page": pending[0]["page"], "runs": to_runs(join_lines(pending, hyphens))})
            pending = []
        for page_number in pending_images:
            chapter()["blocks"].append({"type": "image", "page": page_number})
        pending_images.clear()

    def flush_callout() -> None:
        nonlocal callout
        if not callout:
            return
        groups: list[list[dict]] = [[callout[0]]]
        for previous, line in zip(callout, callout[1:]):
            if line["y"] - previous["y"] > CALLOUT_GROUP_GAP or line["page"] != previous["page"]:
                groups.append([])
            groups[-1].append(line)
        chapter()["blocks"].append(
            {"type": "callout", "page": callout[0]["page"], "paragraphs": [to_runs(join_lines(group, hyphens)) for group in groups]}
        )
        callout = []

    def flush_title() -> None:
        nonlocal title_lines
        if title_lines:
            chapter()["title"] = " ".join(" ".join(line_text(l).split()) for l in title_lines)
            chapter()["titleLines"] = [" ".join(line_text(l).split()) for l in title_lines]
            title_lines = []

    after_break = True  # the next body line starts a paragraph even without an indent
    for item in stream:
        kind = item["kind"]
        if kind == "chapter-label":
            flush_callout()
            flush_paragraph()
            chapters.append({"label": " ".join(line_text(item["line"]).split()), "startPage": item["page"], "blocks": []})
            after_break = True
        elif kind == "title":
            title_lines.append(item["line"])
        elif kind == "image":
            pending_images.append(item["page"])
            if not pending:
                flush_paragraph()
        elif kind == "callout":
            flush_title()
            if not callout and pending:
                # The quotation box sits between paragraphs in the book's text flow.
                flush_paragraph()
            callout.append(item["line"])
            after_break = True
        else:
            flush_title()
            flush_callout()
            line = item["line"]
            if line_text(line).startswith("\t") or after_break:
                flush_paragraph()
            pending.append(line)
            after_break = False
    flush_callout()
    flush_paragraph()

    # 3. Pictures and cover.
    images = extract_images(fitz.open(pdf), public_dir / "images", slug)
    cover = extract_cover(SOURCE_DIR / BOOK["cover_pdf"], public_dir, slug)
    shutil.copyfile(pdf, public_dir / f"{slug}.pdf")

    # 4. Write.
    manifest_chapters = []
    for index, chap in enumerate(chapters, start=1):
        for block in chap["blocks"]:
            if block["type"] == "image":
                block.update(images[block["page"]])
        chap_slug = slugify(chap["title"])
        end_page = (chapters[index]["startPage"] - 1) if index < len(chapters) else doc.page_count
        data = {
            "slug": chap_slug,
            "number": index,
            "label": chap["label"],
            "title": chap["title"],
            "titleLines": chap["titleLines"],
            "startPage": chap["startPage"],
            "endPage": end_page,
            "blocks": chap["blocks"],
        }
        file_name = f"{index:02d}-{chap_slug}.json"
        (chapters_dir / file_name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        words = sum(
            len("".join(r["text"] for r in block["runs"]).split())
            for block in chap["blocks"]
            if block["type"] == "paragraph"
        )
        manifest_chapters.append(
            {
                "slug": chap_slug,
                "number": index,
                "label": chap["label"],
                "title": chap["title"],
                "file": file_name,
                "startPage": chap["startPage"],
                "endPage": end_page,
                "wordCount": words,
                "imageCount": sum(b["type"] == "image" for b in chap["blocks"]),
            }
        )
        counts = {t: sum(b["type"] == t for b in chap["blocks"]) for t in ("paragraph", "callout", "image")}
        print(f"{chap['label']:<11} {chap['title']:<32} pp.{chap['startPage']}-{end_page} {counts} {words} words")

    manifest = {
        "slug": slug,
        "sourcePdf": BOOK["pdf"],
        "coverPdf": BOOK["cover_pdf"],
        "pageCount": doc.page_count,
        "cover": cover,
        "chapters": manifest_chapters,
    }
    (content_dir / "book.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    (content_dir / "line-end-hyphens.txt").write_text(
        "Every hyphen that falls at the end of a printed line, and how the web edition treats it.\n"
        "Generated by scripts/extract_book.py; change KEEP_HYPHEN there to alter a decision.\n\n"
        + "\n".join(hyphens.decisions)
        + "\n",
        encoding="utf-8",
    )
    print(f"\nline-end hyphens: {hyphens.kept} kept, {hyphens.removed} closed up, {len(hyphens.unresolved)} unresolved")
    for note in hyphens.unresolved:
        print("  UNRESOLVED", note)
    return 1 if hyphens.unresolved else 0


if __name__ == "__main__":
    sys.exit(main())
