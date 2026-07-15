# Michael's 3D Table Tennis → playmini secret place

**Date:** 2026-07-15
**Scope:** Integrate the standalone `../table-tennis` game into the password-gated
`app/michael/` section of playmini, as a third game alongside Stick Wars and
Army vs Army.

## Context

- `app/michael/` is a password-gated (`mike`), `noindex` sketchbook-themed area
  (Caveat font, notebook-paper background). Games are cards in a hardcoded array
  in `app/michael/page.tsx`, each with its own route.
- The two existing Michael games are React components. Table tennis is a
  different animal: a vanilla-JS + three.js **static site** (no build step, ES
  module `importmap`, ~18 interdependent modules). Its own `CLAUDE.md` warns the
  input/physics/hit code is "load-bearing and ad-hoc."
- `/pong` and the `/table-tennis → /pong` redirect in `next.config.ts` are an
  unrelated **public** 2D pong game. No collision — Michael's game lives at
  `/michael/table-tennis`.

## Decision

**Embed the static game verbatim; do NOT port to React.** Porting fragile
physics/input code buys nothing and risks breaking a tested game. playmini
already serves per-game assets from `public/michael/`, so a static embed is the
natural fit.

## Design

1. **Copy the game** — `index.html`, `js/`, `css/` from `../table-tennis` →
   `public/michael/table-tennis/`. Do NOT copy `tools/`, `auto_test.py`, `*.md`,
   `test_input.html`, `.venv`, `.vercel`, `.git`. Asset refs are relative, so
   they resolve under the new base with no edits.

2. **Vendor three.js** — download `three@0.160.0/build/three.module.js` →
   `public/michael/table-tennis/vendor/three.module.js`. In the copied
   `index.html`, rewrite the importmap `"three"` entry to
   `"./vendor/three.module.js"` and drop the unused `three/addons/` line (the
   game code never imports from addons; only throwaway `tools/` files did). Add
   `<meta name="robots" content="noindex">` to the copied `index.html` (React
   `noindex` doesn't cover a raw static file).

3. **New route** `app/michael/table-tennis/page.tsx` — full-bleed client
   component rendering a full-viewport `<iframe src="/michael/table-tennis/index.html">`
   (100vw × 100dvh, no border). Floating sketchbook-style "← back to Michael's
   Games" button top-left. The 🔒 lock button from `MichaelGate` stays. Route is
   under `app/michael/`, inheriting the password gate + `noindex`.

4. **Add the card** to the `games` array in `app/michael/page.tsx`: third entry,
   `href: "/michael/table-tennis"`, title "Table Tennis", 🏓 emoji tile in the
   existing placeholder-tile style, its own slight rotation.

## Verification

Playtest in Chrome: game loads, three.js resolves from the vendored file (zero
console errors, no unpkg requests), a rally is playable, back button returns to
the list, the password gate still works, sane on a narrow/mobile viewport.

## Out of scope

The standalone `../table-tennis` repo and its own Vercel deploy (left as-is),
any gameplay/physics changes, indexing/SEO for the game.
