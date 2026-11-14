# Bible History Library

A public digital library of Christian books: browse, read online chapter by
chapter, search, share, print a chapter, and download the original PDF.

Next.js (App Router) · TypeScript strict · Tailwind CSS v4 · Motion · deployed on Vercel.

## Run it

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build (every page is static)
pnpm lint && pnpm typecheck
```

## Before launch

Set these (see `.env.example`) in Vercel → Project → Environment Variables:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public origin, used for canonical URLs, share links, sitemap and Open Graph. |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Address shown on **Order copies**, the footer and the Books page. |

Until they are set, the site falls back to `contact@example.com` and the Vercel
production URL. Both fallbacks live in `src/config/site.ts`.

## Content model

Two layers, kept apart on purpose, with one file per chapter so no page ships
the whole book:

| Layer | Where | Edited by |
| --- | --- | --- |
| **Canonical book text** | `content/books/<slug>/book.json` (chapters, cover text) and `content/books/<slug>/chapters/NN-slug.json` | Generated from the PDF. Never by hand. |
| **Pictures, cover, PDF** | `public/book-assets/<slug>/` | Generated from the PDFs. |
| **Presentation metadata** | `src/content/books.ts` | You: title, description, colours, picture alt text, artwork, search suggestions, home-page quotation. |

`src/lib/books.ts` is the only module that knows the content is file-based.
Moving to a CMS such as Sanity means re-implementing those functions; no
component changes.

Routes: `/` (spotlight + shelf) → `/books` (every book) → `/books/<slug>`
(about the book) → `/books/<slug>/read` (contents) →
`/books/<slug>/read/<chapter>`. `/search` searches every chapter of every book.

## Adding a book

1. Put the book PDF and its cover PDF in `Doccuments/Books/` (and the Pages
   document if there is one: it settles line-end hyphens).
2. Extract and verify:

   ```bash
   python3 -m venv .venv && .venv/bin/pip install pymupdf pillow
   .venv/bin/python scripts/extract_book.py
   .venv/bin/python scripts/verify_book.py
   ```

   Both scripts are currently set up for **The End Times** (see `BOOK` at the
   top of `extract_book.py` and `CONTENT_DIR` in `verify_book.py`). A new book
   needs its own entry, and its page layout checked against the extractor's
   assumptions (two columns, title and call-out sizes) before the output is
   trusted.

3. Add an entry to `bookMeta` in `src/content/books.ts`:
   - `title`, `description`, `addedAt`, and a `theme` (accent + stage colours).
   - `imageAlt`: a description of every picture, keyed by printed page.
   - `artwork`: the pages whose pictures may also appear on chapter cards.
     **Leave out any picture showing a cross or other religious symbol.**
   - `searchSuggestions`: words or references that actually occur in the text.
   - Optional `highlight`: one of the book's boxed quotations (chapter slug +
     block anchor) to show on the home page. Set `featured: true` to put the
     book in the home spotlight.

Everything else — shelf, chapter cards, search index, sitemap, share images,
footer — picks the new book up automatically.

`extract_book.py` reads the two-column pages in order, keeps the boxed
quotations and full-page pictures where they fall, and takes the front cover
from the printed cover spread. `verify_book.py` checks every character, in
order, against both the PDF and the original Pages document.

**Line-end hyphens.** A printed line that ends in a hyphen may be a real
compound ("ninety-five") or a word split by the layout ("punish-ment"). Each
decision is listed in `content/books/<slug>/line-end-hyphens.txt`; entries
marked `REVIEW` had no other instance in the book to confirm them. Change a
decision in `KEEP_HYPHEN` at the top of `extract_book.py`.

The reader remembers a visitor's place and preferred text size in
`localStorage` only.

## Where things live

```
content/books/           canonical book text, one file per chapter (generated)
public/book-assets/      covers, pictures and PDFs (generated)
scripts/                 PDF extraction + verification
src/app/                 routes, metadata, sitemap, robots, share images
src/config/site.ts       site name, URL, contact email, navigation
src/content/books.ts     per-book presentation metadata
src/lib/                 data access, search, SEO helpers, types
src/components/
  book/                  cover, stage, shelf, chapter cards, reader body,
                         contents, progress, resume, text size, quotation
  layout/                header, footer, navigation, theme
  reader/                share / print / PDF actions
  search/                full-text search
  motion/                entrance and reveal primitives
  ui/                    buttons, rail, copy button
src/app/globals.css      design tokens, reading typography, print styles
```

## Design notes

- **Type:** Fraunces (display), Newsreader (reading), Hanken Grotesk (interface).
- **Colour:** navy, cream, burgundy and gold tokens for light and dark, defined
  at the top of `globals.css`. Each book adds its own accent and stage colours
  in `src/content/books.ts`; its stage is lit by a softened copy of its cover.
- **Home:** the featured book on a lit stage (on phones the cover sits beside
  the title so **Read Book** is visible without scrolling), its chapters as a
  row of cards, one of its quotations, and the shelf.
- **Motion** uses transforms and opacity only. Reading-page effects are
  scroll-driven CSS behind `@supports` and `prefers-reduced-motion`, so text is
  never hidden or delayed.
- **Print** styles strip the interface and set a chapter in plain black type,
  with a note pointing to the PDF for an exact copy.
