#!/usr/bin/env python3
"""
Verify that content/books/end-times matches its source exactly.

    .venv/bin/python scripts/verify_book.py

Independent of extract_book.py. Three checks:

  1. Order and wording against the PDF — the PDF's own text stream, read
     page by page with only page numbers dropped, must equal the web text
     character for character, in order.
  2. Order and wording against the original Pages document, which stores the
     same text as one continuous flow (no columns, no page breaks).
  3. Pictures — every page of the PDF that carries a picture appears once,
     in page order, in the chapter that contains that page.

Whitespace is ignored. Hyphens are compared by count rather than position:
a word hyphenated across a printed line is closed up on the web, so the web
text must contain exactly as many fewer hyphens as line-end-hyphens.txt
records as closed up.
"""

from __future__ import annotations

import json
import re
import sys
import zipfile
from pathlib import Path

import fitz  # PyMuPDF

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "Doccuments" / "Books"
CONTENT_DIR = ROOT / "content" / "books" / "end-times"


def squash(text: str) -> str:
    return re.sub(r"\s+", "", text)


def without_hyphens(text: str) -> str:
    return text.replace("-", "")


def web_text(manifest: dict) -> tuple[str, list[int]]:
    parts: list[str] = []
    picture_pages: list[int] = []
    for entry in manifest["chapters"]:
        chapter = json.loads((CONTENT_DIR / "chapters" / entry["file"]).read_text(encoding="utf-8"))
        parts += [chapter["label"], *chapter["titleLines"]]
        for block in chapter["blocks"]:
            if block["type"] == "paragraph":
                parts.append("".join(run["text"] for run in block["runs"]))
            elif block["type"] == "callout":
                parts += ["".join(run["text"] for run in paragraph) for paragraph in block["paragraphs"]]
            elif block["type"] == "image":
                picture_pages.append(block["page"])
                if not entry["startPage"] <= block["page"] <= entry["endPage"]:
                    raise SystemExit(f"FAIL picture from p{block['page']} is in the wrong chapter ({entry['title']})")
    return squash("\n".join(parts)), picture_pages


def pdf_text(doc: fitz.Document) -> str:
    pages = []
    for page in doc:
        lines = [line for line in page.get_text().split("\n") if line.strip()]
        if lines and re.fullmatch(r"\d+", lines[-1].strip()):
            lines.pop()  # page number
        pages.append("\n".join(lines))
    return squash("\n".join(pages))


def pages_text(path: Path) -> str:
    """The body text flow of a Pages document."""
    def snappy(data: bytes) -> bytes:
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

    with zipfile.ZipFile(path) as archive:
        raw = archive.read("Index/Document.iwa")
    data = bytearray()
    i = 0
    while i < len(raw):
        length = int.from_bytes(raw[i + 1 : i + 4], "little")
        data += snappy(raw[i + 4 : i + 4 + length])
        i += 4 + length
    start = data.find("Chapter 1\n".encode())
    end = data.find(b"\x00", start)
    text = data[start:end].decode("utf-8", "ignore")
    return squash(text.replace("￼", ""))  # object anchors (rules, pictures)


def first_difference(label: str, source: str, web: str) -> str:
    for i, (a, b) in enumerate(zip(source, web)):
        if a != b:
            return f"{label}: differs at character {i}: source …{source[max(0, i - 50):i + 50]!r}… web …{web[max(0, i - 50):i + 50]!r}…"
    return f"{label}: length differs: source {len(source)} vs web {len(web)}; source tail {source[-60:]!r} web tail {web[-60:]!r}"


def main() -> int:
    manifest = json.loads((CONTENT_DIR / "book.json").read_text(encoding="utf-8"))
    doc = fitz.open(SOURCE_DIR / manifest["sourcePdf"])
    web, picture_pages = web_text(manifest)
    failures = 0

    closed = sum(
        1
        for line in (CONTENT_DIR / "line-end-hyphens.txt").read_text(encoding="utf-8").splitlines()
        if "->" in line and "-" not in line.split("->")[1].split("(")[0]
    )

    pdf = pdf_text(doc)
    if without_hyphens(pdf) != without_hyphens(web):
        print("FAIL", first_difference("PDF", without_hyphens(pdf), without_hyphens(web)))
        failures += 1
    elif pdf.count("-") - web.count("-") != closed:
        print(f"FAIL PDF: hyphen count is off: PDF {pdf.count('-')}, web {web.count('-')}, closed up {closed}")
        failures += 1
    else:
        print(f"ok   PDF: {len(web)} characters match in order ({closed} line-end hyphens closed up, {web.count('-')} kept)")

    pages_source = next(SOURCE_DIR.glob("End Times 103 pages*.pages"), None)
    if pages_source:
        flow = pages_text(pages_source)
        # The Pages flow ends with a stray character after the final sentence.
        flow_cmp, web_cmp = without_hyphens(flow), without_hyphens(web)
        if not flow_cmp.startswith(web_cmp) or len(flow_cmp) - len(web_cmp) > 4:
            print("FAIL", first_difference("Pages document", flow_cmp, web_cmp))
            failures += 1
        else:
            print(f"ok   Pages document: text flow matches in order (trailing {flow_cmp[len(web_cmp):]!r} ignored)")

    expected = [page.number + 1 for page in doc if page.get_images()]
    if picture_pages != expected:
        print(f"FAIL pictures: expected pages {expected}, found {picture_pages}")
        failures += 1
    else:
        print(f"ok   pictures: {len(expected)} picture pages, each in its own chapter and in page order")

    if manifest["pageCount"] != doc.page_count:
        print("FAIL page count")
        failures += 1

    print("\nThe web edition matches the source." if not failures else f"\n{failures} check(s) failed.")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
