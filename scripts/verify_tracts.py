#!/usr/bin/env python3
"""
Verify that content/tracts/*.json matches the source PDFs exactly.

    .venv/bin/python scripts/verify_tracts.py

Deliberately independent of extract_tracts.py: it reads each PDF as plain
text, drops only the page-number lines, and compares against the JSON.

  1. Character check — every non-whitespace character, in order.
  2. Word check      — every word boundary, in order (catches fused or
                       split words that the character check cannot see).

Exits non-zero on the first tract that differs.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import fitz  # PyMuPDF

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "Doccuments" / "Tracts"
CONTENT_DIR = ROOT / "content" / "tracts"


def pdf_text(pdf: Path) -> str:
    doc = fitz.open(pdf)
    pages = []
    for page in doc:
        lines = page.get_text().split("\n")
        while lines and not lines[-1].strip():
            lines.pop()
        if lines and re.fullmatch(r"\d+", lines[-1].strip()):
            lines.pop()  # page number
        pages.append("\n".join(lines))
    return "\n".join(pages)


def json_text(data: dict) -> str:
    parts = [data["sourceTitle"]]
    parts += ["".join(run["text"] for run in block["runs"]) for block in data["blocks"]]
    return "\n\n".join(parts)


def squash(text: str) -> str:
    return re.sub(r"\s+", "", text)


def words(text: str) -> list[str]:
    # A line that ends in a hyphen or dash continues straight into the next line.
    text = re.sub(r"([-–—])\n(?=\S)", r"\1", text)
    return text.split()


def first_difference(a: str, b: str) -> str:
    for i, (x, y) in enumerate(zip(a, b)):
        if x != y:
            return f"at char {i}: PDF …{a[max(0, i - 40):i + 40]!r}… vs JSON …{b[max(0, i - 40):i + 40]!r}…"
    return f"length differs: PDF {len(a)} vs JSON {len(b)}"


def main() -> int:
    failures = 0
    pdfs = sorted(SOURCE_DIR.glob("[0-9][0-9]-*.pdf"))
    for pdf in pdfs:
        slug = pdf.stem.split("-", 1)[1]
        path = CONTENT_DIR / f"{slug}.json"
        if not path.exists():
            print(f"FAIL {pdf.name}: missing {path.relative_to(ROOT)}")
            failures += 1
            continue
        data = json.loads(path.read_text(encoding="utf-8"))
        source, extracted = pdf_text(pdf), json_text(data)

        if squash(source) != squash(extracted):
            print(f"FAIL {pdf.name}: characters differ {first_difference(squash(source), squash(extracted))}")
            failures += 1
            continue

        source_words, extracted_words = words(source), words(extracted)
        if source_words != extracted_words:
            for i, (x, y) in enumerate(zip(source_words, extracted_words)):
                if x != y:
                    print(f"FAIL {pdf.name}: word {i} differs: PDF {source_words[i - 3:i + 3]} vs JSON {extracted_words[i - 3:i + 3]}")
                    break
            else:
                print(f"FAIL {pdf.name}: word count differs: {len(source_words)} vs {len(extracted_words)}")
            failures += 1
            continue

        print(f"ok   {pdf.name}: {len(source_words)} words, {len(squash(source))} characters match")

    if failures:
        print(f"\n{failures} tract(s) do not match their source PDF.")
        return 1
    print(f"\nAll {len(pdfs)} tracts match their source PDFs.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
