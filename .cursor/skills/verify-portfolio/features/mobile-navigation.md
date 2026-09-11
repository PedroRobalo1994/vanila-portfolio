# Mobile navigation

On narrow viewports the hamburger control opens and closes the mobile Primary menu, including Escape to dismiss.

## Sub-features

- `mobile-open` opens the menu via `data-test="nav-toggle"`.
- `mobile-close-escape` closes with Escape and restores `aria-expanded="false"`.
- `mobile-labels` uses accessible names **Open menu** / **Close menu**.

## How to get to it (user POV)

- Resize below the desktop breakpoint (~720px) or use a phone viewport.
- Tap the hamburger, then dismiss with Escape, backdrop, or a nav link.

## Driving it with Playwright (`drive.mjs`)

Preconditions:

- Launch + Doctor green.
- Viewport `390×844` (Drive sets this for this feature).

- **Closed.** Goto `/portfolio/`. Toggle accessible name **Open menu**; `data-test="mobile-navigation"` hidden.
- **Open.** Click toggle. `aria-expanded="true"`; name **Close menu**; mobile nav visible.
- **Escape.** Press Escape. `aria-expanded="false"`; mobile nav hidden.
- **Proof.** `node .cursor/skills/verify-portfolio/scripts/drive.mjs mobile-navigation` → `evidence/mobile-navigation/02-open.png`.
- **Suite mirror:** `tests/redesign/navigation.spec.js` (`mobile navigation`).

## Gotchas

- Desktop viewport hides the useful mobile path — always set a narrow viewport first.
- Do not kill by guessing process names if a stuck menu leaves the page odd; Cleanup + relaunch.
