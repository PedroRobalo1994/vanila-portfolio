# Writing

Writing lists Articles and Notes. Opening an entry shows the full piece with a matching `h1`.

## Sub-features

- `writing-index` opens Writing from Primary nav.
- `writing-open` opens the first listed article/note and matches its title heading.
- `writing-rss` (optional) exposes the feed link on the index (`/portfolio/feed.xml`).

## How to get to it (user POV)

- Choose **Writing** in Primary nav, or Landing CTA `data-test="cta-writing"`.
- Choose an entry title in the writing list.

## Driving it with Playwright (`drive.mjs`)

Preconditions:

- Launch + Doctor green.
- At least one non-draft Writing entry in the EN collection (repo ships articles).

- **Open index.** From `/portfolio/`, click Primary **Writing**. URL `/portfolio/writing/`; `h1` visible.
- **Open entry.** Click the first `.writing-card__title a`. URL stays under `/portfolio/writing/…`; `h1` matches the card title.
- **Proof.** `node .cursor/skills/verify-portfolio/scripts/drive.mjs writing` → `evidence/writing/01-writing-index.png` and `02-article.png`.

## Gotchas

- Empty Writing would show the empty-state copy — treat as a content failure, not a harness failure.
- Portuguese Writing is `/portfolio/pt/escrita/`; translation keys may fall back to the index when a counterpart is missing.
