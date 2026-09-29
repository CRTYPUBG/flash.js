# FLASH.js → Wappalyzer Submission Guide

Wappalyzer lists a technology only if it can **reliably fingerprint** it on real
websites. This folder contains everything needed for the submission PR, plus the
code-level guarantee that makes detection possible.

## 1. Fingerprint (already in the library — no fake signals)

Every UMD build (`flash.js`, `dist/flash.js`, `dist/flash.min.js`) exposes,
from a plain `<script>` tag:

```js
window.Flash        // the F function itself
window.F            // alias
Flash.version       // "1.0.1" — semver string (this is what Wappalyzer reads)
```

Verified via `wapp-check.cjs` logic (browser-like `vm` sandbox, no `module`/`define`):

| build              | `typeof Flash` | `Flash.version` | `F === Flash` |
|--------------------|----------------|-----------------|---------------|
| `flash.js`         | function       | "1.0.1"         | true          |
| `dist/flash.js`    | function       | "1.0.1"         | true          |
| `dist/flash.min.js`| function       | "1.0.1"         | true          |

Fixed in 1.0.1: `dist/*` UMD previously exposed a namespace **object**
(`Flash.VERSION`, no `F` global). `src/umd.js` now assigns the `F` function
itself to both globals — identical shape to root `flash.js`.

Second signal — CDN script URL (no code needed, works once sites use it):

```html
<script src="https://unpkg.com/@flash-js/flash.js/dist/flash.min.js"></script>
<!-- or --> https://cdn.jsdelivr.net/npm/@flash-js/flash.js/dist/flash.min.js
```

## 2. Submission entry (`technologies.json` in this folder)

Category **59 = JavaScript libraries**. Detection patterns:

- `js: { "Flash.version": "\\d+\\.\\d+\\.\\d+" }` — reads version from the global
- `script:` — matches unpkg / jsDelivr URLs of the published package

## 3. How to submit (wappalyzer/wappalyzer repo)

1. Fork `github.com/wappalyzer/wappalyzer`, read `CONTRIBUTING.md` (paths below
   can move — verify before opening the PR).
2. Insert the `FLASH.js` object from `technologies.json` into
   `src/technologies/f.json` (keep alphabetical order).
3. Add `FLASH.js.svg` (this folder) to the icons directory
   (`src/drivers/webextension/images/icons/`).
4. Run their validation (`npm test` / schema check per CONTRIBUTING).
5. Open the PR with evidence links:
   - npm: `https://www.npmjs.com/package/@flash-js/flash.js`
   - CDN: `https://unpkg.com/@flash-js/flash.js/dist/flash.min.js`
   - Docs (dogfooding — site itself runs FLASH.js):
     `https://flash.crty-dev.com`
   - Repo: `https://github.com/CRTYPUBG/flash.js`
   - Live detection test: open any page that includes the UMD script with the
     Wappalyzer extension in dev mode → expect `FLASH.js 1.0.1`.

## 4. What NOT to do

- Don't resubmit the same entry unchanged if declined — strengthen real-world
  usage first (docs, examples, playground all run the real build).
- Don't add aggressive fingerprint code (canvas, beacons, extra requests).
  The two passive signals above (`Flash.version` + CDN URL) are sufficient and
  cost zero bytes at runtime.

## 5. Versioning note

`Flash.version` always equals the npm version (`src/core/F.js` + root
`flash.js` are bumped together). New releases are detected automatically —
no Wappalyzer update needed.
