# Primary navigation

Desktop Primary navigation lets a visitor reach Work, Writing, and About from the Landing Page and confirm each section by URL and page heading.

## Sub-features

- `nav-work` opens the Work index from Primary nav.
- `nav-writing` opens the Writing index from Primary nav.
- `nav-about` opens About from Primary nav.
- `nav-labeled` exposes the landmark `navigation` named `Primary` (desktop `data-test="desktop-navigation"`).

## How to get to it (user POV)

- On a desktop-width viewport, use the Primary nav links **Work**, **Writing**, or **About**.
- Start from the English Landing Page at `/portfolio/`.

## Driving it with Playwright (`drive.mjs`)

Preconditions:

- Launch + Doctor green.
- Viewport wide enough for desktop nav (Drive default 1280×800).
- Browser locale `en-US` so home stays English.

- **Open home.** `page.goto('/portfolio/')`. `data-test="desktop-navigation"` visible; `html[lang=en]`.
- **Work.** Click Primary link `Work` (exact). URL ends with `/portfolio/work/`; an `h1` is visible.
- **Writing.** Return home, click `Writing`. URL `/portfolio/writing/`; `h1` visible.
- **About.** Return home, click `About`. URL `/portfolio/about/`; `h1` visible.
- **Proof.** `node .cursor/skills/verify-portfolio/scripts/drive.mjs primary-navigation` → `evidence/primary-navigation/02-work.png` … `04-about.png`.
- **Suite mirror:** `tests/redesign/navigation.spec.js` (English primary navigation).

## Gotchas

- Portuguese labels are **Trabalho** / **Escrita** / **Sobre** — do not assert English names on `/pt/` pages.
- Prefer `exact: true` on link names so **Work** does not match other copy.
- Always go back to `/portfolio/` between destinations when proving each entry from home, matching the redesign e2e pattern.
