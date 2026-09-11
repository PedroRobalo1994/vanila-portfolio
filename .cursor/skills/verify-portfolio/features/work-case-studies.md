# Work & case studies

Work lists case study cards and experiments. Opening a card reaches a Case Study page with a clear title.

## Sub-features

- `work-index` opens Work from Primary nav and shows case study cards.
- `work-open-case` opens a known card (`data-test="work-card-cuf-prepara"`) into its Case Study.
- `work-experiments` (optional follow-up) shows `data-test="experiment-highlighted"` on the index.

## How to get to it (user POV)

- Choose **Work** in Primary nav, or the Landing Page CTA `data-test="cta-work"`.
- Choose a case study card (e.g. CUF Prepara).

## Driving it with Playwright (`drive.mjs`)

Preconditions:

- Launch + Doctor green.
- English locale.

- **Open Work.** From `/portfolio/`, click Primary **Work**. URL `/portfolio/work/`; `work-card-cuf-prepara` visible.
- **Open case study.** Click a link inside `work-card-cuf-prepara`. URL includes `/portfolio/work/cuf-prepara/`; `h1` visible.
- **Proof.** `node .cursor/skills/verify-portfolio/scripts/drive.mjs work-case-studies` → `evidence/work-case-studies/01-work-index.png` and `02-case-study.png`.

## Gotchas

- Card `data-test` uses `project.key` (e.g. `cuf-prepara`, `dose-segura`) — stable across EN/PT routes.
- Portuguese Work lives at `/portfolio/pt/trabalho/`; case study slugs may differ (e.g. `sistema-qualidade-portfolio`).
