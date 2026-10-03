#!/usr/bin/env python3
"""
Extract canonical tract text from the source PDFs into structured JSON.

    python3 -m venv .venv && .venv/bin/pip install pymupdf
    .venv/bin/python scripts/extract_tracts.py

Reads   Doccuments/Tracts/NN-slug.pdf
Writes  content/tracts/slug.json      (canonical body, never hand-edited)
        public/pdfs/slug.pdf          (download copy of the source PDF)

The extractor never changes wording. It only:
  - rejoins lines that the PDF layout wrapped,
  - records bold / italic / underline / small emphasis as marks,
  - classifies each paragraph (heading, question, scripture, note, ...),
  - collapses runs of whitespace to a single space.

Run scripts/verify_tracts.py afterwards; it re-reads the PDFs through an
independent code path and fails if a single character differs.
"""

from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

import fitz  # PyMuPDF

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "Doccuments" / "Tracts"
CONTENT_DIR = ROOT / "content" / "tracts"
PDF_DIR = ROOT / "public" / "pdfs"

LEFT_MARGIN = 63
RIGHT_EDGE = 535  # justified lines end at ~551; anything shorter ends a paragraph
TITLE_SIZE = 20
SMALL_SIZE = 8.6
PARAGRAPH_GAP = 12.5

Style = tuple  # (bold, italic, underline, small)


def underline_segments(page: fitz.Page) -> list[tuple[float, float, float]]:
    """Horizontal hairlines drawn under text: (x0, x1, y)."""
    segments = []
    for drawing in page.get_drawings():
        if drawing["type"] != "s":
            continue
        rect = drawing["rect"]
        if rect.height < 0.5 and rect.width > 1:
            segments.append((rect.x0, rect.x1, rect.y0))
    return segments


def is_underlined(char: dict, segments: list[tuple[float, float, float]]) -> bool:
    x0, _, x1, _ = char["bbox"]
    centre = (x0 + x1) / 2
    baseline = char["origin"][1]
    return any(
        sx0 - 0.5 <= centre <= sx1 + 0.5 and baseline - 0.5 <= sy <= baseline + 3.5
        for sx0, sx1, sy in segments
    )


def page_lines(page: fitz.Page) -> list[dict]:
    """Visual lines of a page as lists of styled characters, top to bottom."""
    segments = underline_segments(page)
    raw = []
    for block in page.get_text("rawdict")["blocks"]:
        for line in block.get("lines", []):
            chars = []
            for span in line["spans"]:
                font = span["font"]
                if "Helvetica" in font:  # page numbers
                    continue
                bold = bool(span["flags"] & 16)
                italic = bool(span["flags"] & 2)
                small = span["size"] < SMALL_SIZE
                for char in span["chars"]:
                    underline = char["c"].strip() != "" and is_underlined(char, segments)
                    chars.append((char["c"], (bold, italic, underline, small), span["size"]))
            if not chars:
                continue
            x0, y0, x1, _ = line["bbox"]
            raw.append({"x0": x0, "x1": x1, "y": y0, "chars": chars})

    raw.sort(key=lambda l: (round(l["y"]), l["x0"]))
    merged: list[dict] = []
    for line in raw:
        if merged and abs(merged[-1]["y"] - line["y"]) < 5 and line["x0"] >= merged[-1]["x1"] - 1:
            # Same baseline, separate segment (tab stop / list number): keep a word gap.
            merged[-1]["chars"] += [(" ", merged[-1]["chars"][-1][1], merged[-1]["chars"][-1][2])] + line["chars"]
            merged[-1]["x1"] = line["x1"]
        else:
            merged.append(line)
    for line in merged:
        line["page"] = page.number
        line["size"] = max(c[2] for c in line["chars"])
    return merged


def line_text(line: dict) -> str:
    return "".join(c[0] for c in line["chars"])


def first_style(line: dict) -> Style:
    for char, style, _ in line["chars"]:
        if char.strip():
            return style
    return (False, False, False, False)


def last_style(line: dict) -> Style:
    for char, style, _ in reversed(line["chars"]):
        if char.strip():
            return style
    return (False, False, False, False)


def starts_new_paragraph(prev: dict, line: dict) -> bool:
    centred = line["x0"] > LEFT_MARGIN + 60 and prev["x0"] > LEFT_MARGIN + 60
    if centred and line["page"] == prev["page"] and line["y"] - prev["y"] < 14:
        # A centred heading wrapped over several lines.
        return not line_text(prev).strip()[-1:].isalpha()
    if prev["x1"] < RIGHT_EDGE:
        return True
    if abs(line["x0"] - LEFT_MARGIN) > 4 or abs(prev["x0"] - LEFT_MARGIN) > 4:
        return True
    if line["page"] == prev["page"] and line["y"] - prev["y"] >= PARAGRAPH_GAP:
        return True
    if first_style(line)[0] and not last_style(prev)[0]:
        return True
    return False


def join_lines(lines: list[dict]) -> list[tuple[str, Style]]:
    """Concatenate wrapped lines into one character stream."""
    chars: list[tuple[str, Style]] = []
    for line in lines:
        if chars:
            tail = "".join(c[0] for c in chars[-2:])
            if tail and not tail[-1].isspace() and tail[-1] not in "-—–":
                chars.append((" ", chars[-1][1]))
        chars.extend((c, s) for c, s, _ in line["chars"])
    return chars


def to_runs(chars: list[tuple[str, Style]]) -> list[dict]:
    # Whitespace carries no emphasis of its own: let it inherit from the
    # preceding character so stray styled spaces do not fragment runs.
    normalised: list[tuple[str, Style]] = []
    for char, style in chars:
        if char.isspace():
            if normalised and normalised[-1][0] == " ":
                continue
            normalised.append((" ", normalised[-1][1] if normalised else style))
        else:
            normalised.append((char, style))
    while normalised and normalised[0][0] == " ":
        normalised.pop(0)
    while normalised and normalised[-1][0] == " ":
        normalised.pop()

    runs: list[dict] = []
    current: Style | None = None
    for char, style in normalised:
        if style != current:
            runs.append({"text": "", "_style": style})
            current = style
        runs[-1]["text"] += char

    out = []
    for run in runs:
        bold, italic, underline, small = run.pop("_style")
        if bold:
            run["bold"] = True
        if italic:
            run["italic"] = True
        if underline:
            run["underline"] = True
        if small:
            run["small"] = True
        out.append(run)
    return out


QUESTION = re.compile(r"^(\d+)\.?\s+(?=[A-Z])")


def classify(runs: list[dict], centred: bool) -> dict:
    text = "".join(r["text"] for r in runs)
    all_bold = all(r.get("bold") for r in runs)
    all_italic = all(r.get("italic") for r in runs)
    first = runs[0]
    block: dict = {"type": "paragraph"}

    bold_share = sum(len(r["text"]) for r in runs if r.get("bold")) / max(len(text), 1)
    question = QUESTION.match(text) if first.get("bold") and bold_share > 0.8 else None

    if question:
        block["type"] = "question"
        block["number"] = int(question.group(1))
    elif all_bold and all_italic:
        block["type"] = "label"
    elif all_bold:
        if len(text) <= 80 and (text == text.upper() or text.endswith((":", "?"))):
            block["type"] = "heading"
    elif first.get("bold") and first.get("italic"):
        block["type"] = "scripture"
    elif first.get("bold") and first["text"].strip().startswith("Note"):
        block["type"] = "note"

    if centred:
        block["align"] = "center"
    block["runs"] = runs
    return block


def continues_sentence(prev: dict, block: dict) -> bool:
    """A hard return in the middle of a sentence (a layout artefact in the source)."""
    if prev["type"] != block["type"] and block["type"] != "paragraph":
        return False
    if prev["type"] in ("heading", "question", "label"):
        return False
    if block["runs"][0].get("bold"):
        return False
    prev_text = "".join(r["text"] for r in prev["runs"])
    text = "".join(r["text"] for r in block["runs"])
    return bool(re.search(r"[A-Za-z,]$", prev_text)) and text[:1].islower()


def merge_runs(a: list[dict], b: list[dict]) -> list[dict]:
    a = [dict(r) for r in a]
    b = [dict(r) for r in b]
    a[-1]["text"] += " "
    marks = lambda r: {k: v for k, v in r.items() if k != "text"}
    if marks(a[-1]) == marks(b[0]):
        a[-1]["text"] += b.pop(0)["text"]
    return a + b


def extract(pdf: Path) -> tuple[dict, list[str]]:
    doc = fitz.open(pdf)
    lines: list[dict] = []
    for page in doc:
        lines.extend(page_lines(page))

    title_lines = [l for l in lines if l["size"] >= TITLE_SIZE]
    body_lines = [l for l in lines if l["size"] < TITLE_SIZE and line_text(l).strip()]
    title = " ".join(" ".join(line_text(l).split()) for l in title_lines)

    paragraphs: list[list[dict]] = []
    for line in body_lines:
        if paragraphs and not starts_new_paragraph(paragraphs[-1][-1], line):
            paragraphs[-1].append(line)
        else:
            paragraphs.append([line])

    notes: list[str] = []
    blocks: list[dict] = []
    for para in paragraphs:
        runs = to_runs(join_lines(para))
        if not runs:
            continue
        centred = all(l["x0"] > LEFT_MARGIN + 60 for l in para)
        block = classify(runs, centred)
        if blocks and continues_sentence(blocks[-1], block):
            before = "".join(r["text"] for r in blocks[-1]["runs"])[-40:]
            after = "".join(r["text"] for r in block["runs"])[:40]
            notes.append(f"joined mid-sentence hard return: …{before!r} + {after!r}…")
            blocks[-1]["runs"] = merge_runs(blocks[-1]["runs"], block["runs"])
            continue
        blocks.append(block)

    order, slug = pdf.stem.split("-", 1)
    data = {
        "slug": slug,
        "order": int(order),
        "sourcePdf": pdf.name,
        "sourceTitle": title,
        "pageCount": doc.page_count,
        "blocks": blocks,
    }
    return data, notes


def main() -> int:
    pdfs = sorted(SOURCE_DIR.glob("[0-9][0-9]-*.pdf"))
    if not pdfs:
        print(f"No tract PDFs found in {SOURCE_DIR}", file=sys.stderr)
        return 1
    CONTENT_DIR.mkdir(parents=True, exist_ok=True)
    PDF_DIR.mkdir(parents=True, exist_ok=True)

    for pdf in pdfs:
        data, notes = extract(pdf)
        out = CONTENT_DIR / f"{data['slug']}.json"
        out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        shutil.copyfile(pdf, PDF_DIR / f"{data['slug']}.pdf")
        counts: dict[str, int] = {}
        for block in data["blocks"]:
            counts[block["type"]] = counts.get(block["type"], 0) + 1
        print(f"{pdf.name}: “{data['sourceTitle']}” {counts}")
        for note in notes:
            print(f"    {note}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
