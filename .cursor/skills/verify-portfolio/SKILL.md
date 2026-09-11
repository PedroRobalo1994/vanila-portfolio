---
name: verify-portfolio
description: "Drive Pedro Robalo's Eleventy Portfolio the way a visitor would — Landing Page, Work, Writing, About, EN/PT locale switch, mobile nav. Use when proving UI behavior after content or template changes, or before trusting a Pages deploy."
---

# Verify Portfolio (Eleventy web)

Primary surface: **web** — the Eleventy redesign under `src/` (Landing Page, Work/case studies, Writing, About), bilingual EN/PT, served with `pathPrefix` `/portfolio/`.

Legacy root `index.html` + `bun run serve` (port 8080) still powers `tests/e2e/`. This skill targets the **redesign** path used by `tests/redesign/` and `bun run dev` / `bun run build`. Do not drive the live Pages URL for proofs unless a feature file says so.

Harness: **Playwright** (`@playwright/test` already in the repo) plus helpers under `.cursor/skills/verify-portfolio/scripts/`. `drive.mjs` sets `selectors.setTestIdAttribute('data-test')` so `getByTestId` matches the templates. Prefer `data-test` attributes, `getByRole('navigation', { name: 'Primary' })`, and locale link `data-test="lang-switch"` — redesign specs already encode them.

**Isolation:** default verification port is `4177` so it does not collide with redesign Playwright (`4173`) or legacy `serve` (`8080`). Never attach to an instance you did not start with Launch. Never kill by process name.

## Launch

From the repo root:

```bash
.cursor/skills/verify-portfolio/scripts/launch.sh
```

- Starts `bun run dev -- --port 4177` (override with `VERIFY_PORT`).
- Writes `.cursor/skills/verify-portfolio/.run/state.env` (`PID`, `PORT`, `HOST`, `BASE_PATH`, `LOG_FILE`).
- Ready when `http://127.0.0.1:4177/portfolio/` returns HTTP 200 (timeout 120s).
- Refuses a second launch while that PID is alive.

Teardown is Cleanup (below), not Ctrl-C by guesswork.

Optional: redesign suite independently via `bun run test:redesign` (its config defaults to port `4173` and may reuse an existing server when not in CI).

## Doctor

```bash
.cursor/skills/verify-portfolio/scripts/doctor.sh
```

Read-only. Passes only if:

1. `state.env` exists and `PID` is alive.
2. `http://$HOST:$PORT/portfolio/` returns 200 and the body looks like this Portfolio (wordmark / Pedro).
3. `package.json` `"name"` is `portfolio`.

Run Doctor before the first Drive, after any failed Drive, and whenever the UI looks wedged. A Doctor failure caused by a dead Launch → Cleanup, then Launch again.

## Drive

Map recipes live in `features/`. Prefer the skill helper (connects to the Launch instance, writes evidence):

```bash
node .cursor/skills/verify-portfolio/scripts/drive.mjs locale-switch
# also: primary-navigation | mobile-navigation | work-case-studies | writing
```

Stable handles (from redesign templates / e2e):

| Surface | Handle |
| ------- | ------ |
| Header / wordmark | `getByTestId('site-header')`, `getByTestId('wordmark')` |
| Desktop nav | `getByRole('navigation', { name: 'Primary' })` or `getByTestId('desktop-navigation')` |
| Nav links (EN) | `Work`, `Writing`, `About` (exact); Home via wordmark / Home link |
| Nav links (PT) | `Trabalho`, `Escrita`, `Sobre` |
| Locale switch | `getByTestId('lang-switch')` (desktop); also `.nav--desktop .locale-option[hreflang]` |
| Mobile toggle | `getByTestId('nav-toggle')` (`Open menu` / `Close menu`) |
| Mobile nav | `getByTestId('mobile-navigation')` |
| Hero / CTAs | `getByTestId('hero')`, `getByTestId('cta-work')`, `getByTestId('cta-writing')` |
| Work cards | `getByTestId('work-card-<project.key>')` e.g. `work-card-cuf-prepara` |
| Footer | `getByTestId('site-footer')`, `footer-email`, `footer-github`, `footer-linkedin`, `footer-resume` |

Base path for every goto: **`/portfolio/`** (Eleventy `pathPrefix`). English home can redirect to `/portfolio/pt/` when the browser locale starts with `pt` and `localStorage['portfolio:locale']` is unset — Drive helpers use `locale: 'en-US'` unless the recipe needs PT detection.

Alternative: reuse redesign Playwright specs against the Launch port:

```bash
# Point a one-off config or temporarily set the redesign webServer to reuse 4177.
bunx playwright test --config=playwright.redesign.config.js \
  tests/redesign/localization.spec.js --project=chromium
```

(`reuseExistingServer` is true locally; if something else owns 4173 the suite may attach there instead — prefer `drive.mjs` against Launch.)

Drive the **user path** (nav links, locale switcher, mobile menu). Do not rewrite `_site` or poke Eleventy internals to fake success.

## Evidence

Directory (survives Cleanup):

```text
.cursor/skills/verify-portfolio/evidence/<feature-id>/
```

`drive.mjs` writes for each step: `NN-label.png`, `NN-label.aria.txt`, `NN-label.meta.json`, plus `PASS.json` on success.

Proof standards:

- Exercise the real visitor path (click Primary nav, locale switcher, mobile toggle), not only `page.goto` to the destination.
- Capture **action and resulting state** (URL + heading / `html[lang]`), not only the final screen.
- Locale preference side effect: after switching, `localStorage.getItem('portfolio:locale')` should match; prove with a reload or reciprocal switch when the recipe says so.
- Runtime `pageerror` / console errors during Drive fail the proof.
- `.run/` is scratch; **never** store proofs only there.

After Cleanup, confirm `evidence/<feature>/` still exists and still contains the PNGs / `PASS.json`.

## Cleanup

```bash
.cursor/skills/verify-portfolio/scripts/cleanup.sh
```

- Kills **only** the PID recorded in `state.env` (then SIGKILL that same PID if needed).
- Deletes `.run/` scratch (`state.env`, logs).
- **Does not** delete `evidence/`.

Run Cleanup after every verification session and after failed Launch/Drive iterations so ports are not stranded.

## Helpers

All under `.cursor/skills/verify-portfolio/scripts/` (executable):

| Script | Role |
| ------ | ---- |
| `launch.sh` | Start Eleventy `--serve`; write `.run/state.env`; wait until `/portfolio/` ready |
| `doctor.sh` | Read-only health of that instance |
| `drive.mjs` | Drive one mapped feature; write `evidence/<feature>/` |
| `cleanup.sh` | Stop Launch PID; keep evidence |

Env knobs: `VERIFY_PORT` (default `4177`), `VERIFY_HOST` (default `127.0.0.1`), `VERIFY_RUN_DIR`, `VERIFY_READY_TIMEOUT_SEC` (default `120`).

## Feature map

See [`features/README.md`](features/README.md). Start with one feature per run unless maintaining the whole map via `/maintain-verification-skill`.
