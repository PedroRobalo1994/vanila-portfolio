# Portfolio verification map

Maintained recipes for proving user-facing Eleventy Portfolio behavior. Read this index, Launch + Doctor the app, then follow one feature file.

## Baseline preconditions

- Launch via `.cursor/skills/verify-portfolio/scripts/launch.sh` (Eleventy at `http://127.0.0.1:4177/portfolio/` by default).
- Doctor must pass before Drive.
- Base path is always `/portfolio/` (Eleventy `pathPrefix`). Production Pages uses the same prefix.
- Prefer `data-test` handles and `getByRole('navigation', { name: 'Primary' })` over CSS position.
- Never drive an instance you did not start with Launch.
- English home redirects to `/portfolio/pt/` when the browser locale starts with `pt` and `localStorage['portfolio:locale']` is unset. Default Drive context uses `locale: 'en-US'`.

## Driving conventions

- Start each recipe from the English Landing Page (`/portfolio/`) unless the feature says otherwise.
- Capture action + resulting state under `evidence/<feature-id>/`.
- Report unreachable paths with the attempted command and unmet precondition — do not claim a different entry point as the same proof.
- Locale mutations write `localStorage['portfolio:locale']`; prove with the reciprocal switch or a reload when the recipe requires it.

## Features

- [Primary navigation](./primary-navigation.md) — desktop Primary nav to Work, Writing, About.
- [Locale switch](./locale-switch.md) — EN ↔ PT via the desktop language control, including storage.
- [Mobile navigation](./mobile-navigation.md) — hamburger open, Escape close.
- [Work & case studies](./work-case-studies.md) — Work index and open a case study card.
- [Writing](./writing.md) — Writing index and open an article.
