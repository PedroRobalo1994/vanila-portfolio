# Locale switch

The language control lets a visitor move between English and Portuguese counterparts of the same page, update `html[lang]`, and persist the preference in `localStorage`.

## Sub-features

- `locale-to-pt` switches EN → PT from the desktop control.
- `locale-to-en` switches PT → EN.
- `locale-persist` writes `portfolio:locale` (`en` or `pt`) on click.
- `locale-nav-labels` shows localized Primary labels after the switch (e.g. **Trabalho**).

## How to get to it (user POV)

- Choose **PT** or **EN** in the desktop locale switcher (`data-test="lang-switch"` on the non-current option).
- Mobile menu also exposes a locale switcher (prove separately if needed).

## Driving it with Playwright (`drive.mjs`)

Preconditions:

- Launch + Doctor green.
- Start on English `/portfolio/` with `locale: 'en-US'`.
- Desktop viewport so `[data-test="desktop-navigation"] [data-test="lang-switch"]` is usable.

- **EN home.** Goto `/portfolio/`. Hero visible; `html[lang=en]`.
- **Switch to PT.** Click desktop `data-test="lang-switch"`. URL `/portfolio/pt/`; `html[lang=pt]`; `localStorage['portfolio:locale'] === 'pt'`; Primary shows **Trabalho**.
- **Switch back to EN.** Click desktop `data-test="lang-switch"` again. URL `/portfolio/`; `html[lang=en]`; storage `en`.
- **Proof.** `node .cursor/skills/verify-portfolio/scripts/drive.mjs locale-switch` → `evidence/locale-switch/02-pt-home.png` and `03-en-again.png`.
- **Suite mirror:** `tests/redesign/localization.spec.js`.

## Gotchas

- Only the **non-current** locale is a link with `data-test="lang-switch"`; the current one is a `<span class="locale-option is-current">`.
- English home may auto-redirect to `/pt/` for `pt*` browser locales when storage is empty — keep Drive locale `en-US` unless testing detection (`tests/redesign/browser-locale.spec.js`).
- Reciprocal `hreflang` alternates exist per page; asserting storage + URL is enough for this feature.
