# Color Contrast Lab

A buildless, local sRGB contrast workbench for private review. Serve `dist/` with any static HTTP server. No installation, external assets, data requests, telemetry, persistence, or API keys.

## Functionality

- Korean `/`, English `/en/`, Spanish `/es/`, Simplified Chinese `/zh/`, Japanese `/ja/`, and German `/de/`. Every route has a manual language menu. Labels, errors, result states, examples, guidance, limitations, and suggestion controls use complete static locale catalogs.
- Foreground, background, and opaque canvas inputs support `#RGB`, `#RGBA`, `#RRGGBB`, and `#RRGGBBAA`. The canvas must resolve to alpha 1. The color pickers alter RGB while retaining the typed foreground/background alpha.
- Background is composited over the canvas in sRGB, then foreground over that resolved background. Relative luminance uses the WCAG 2.2 transfer-function breakpoint `0.04045` and weights `0.2126`, `0.7152`, `0.0722`.
- Ratio `(Llighter + 0.05)/(Ldarker + 0.05)`. Unrounded values determine the normal/large AA/AAA and non-text numeric results. The ratio display rounds to two decimal places.
- Foreground adjustment suggestions mix the currently composited foreground toward black/white and find a quantized opaque HEX candidate that reaches 3:1, 4.5:1, or 7:1. The background remains fixed. Applying a suggestion replaces foreground alpha; this is disclosed in all locales. No claim of perceptually closest color.
- Live text preview, foreground/background swap, transparent example, CSS variables with original alpha and high-precision composited RGB, copy, and UTF-8 CSS download.

## Verification

Executed 2026-10-26 from this app directory. `node` below denotes the workspace-provided native Node runtime used for execution; installation-specific absolute runtime paths are intentionally omitted from public artifacts.

```powershell
& '../../.tools/rtk/rtk.exe' proxy node generate.mjs
& '../../.tools/rtk/rtk.exe' proxy node tests.mjs
& '../../.tools/rtk/rtk.exe' proxy node --check dist/core.js
& '../../.tools/rtk/rtk.exe' proxy node --check dist/app.js
& '../../.tools/rtk/rtk.exe' proxy node --check dist/locales.js
& '../../.tools/rtk/rtk.exe' proxy node --check generate.mjs
& '../../.tools/rtk/rtk.exe' proxy node --check tests.mjs
```

Actual results: all syntax commands exit 0; **PASS 59 checks**. Independent literal numeric fixtures cover black/white 21:1, identical colors 1:1, primary-color luminance weights, `#777777`/white 4.478089453577214, `#767676`/white 4.542224959605253, half-alpha 8-bit composition, a transfer-function-boundary input, threshold decisions before rounding, valid suggestions, invalid input, and six route/catalog completeness.

Browser interaction, clipboard permissions, 360px visual rendering, and hosting have not been verified by this agent. The owner performs supported-browser review and private publication. Automated checks do not establish full WCAG conformance.

## Scope and standards

Only solid sRGB pairs are evaluated. Gradients, images, color-vision simulation, font legibility, focus/hover states, neighboring colors, exceptions, and complete-page accessibility are outside scope. The non-text row reports only whether the numeric 3:1 threshold is reached. Large-text guidance is regular 24 CSS px or bold 18.67 CSS px; no automatic font qualification is claimed. Values and preview remain editable after validation errors.

Primary standards checked 2026-10-26:

- [WCAG 2.2 relative luminance](https://www.w3.org/TR/WCAG22/#dfn-relative-luminance)
- [WCAG 2.2 contrast ratio](https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio)
- [SC 1.4.3 Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [SC 1.4.6 Contrast (Enhanced)](https://www.w3.org/TR/WCAG22/#contrast-enhanced)
- [SC 1.4.11 Non-text Contrast](https://www.w3.org/TR/WCAG22/#non-text-contrast)
- [CSS Color 4 simple alpha compositing](https://www.w3.org/TR/css-color-4/#simple-alpha)

Original code, layout, examples and explanatory wording. No third-party assets or prose copied. `generate.mjs` regenerates the six HTML shells; deployment needs no build.

## Public GitHub Pages release

Launch: https://nanalab.kr/contrast-lab/

Korean is at the root. English, Spanish, Chinese, Japanese and German use `/en/`, `/es/`, `/zh/`, `/ja/`, `/de/`.
GitHub Pages serves `main` → `/docs` using the branch build. No project CNAME is used.

Build: `node scripts/build-public.mjs`. The `dist/` snapshot and its original generators/tests are preserved as the application source. The public build adds metadata, six-locale sitemaps, original JPEG cards, More Apps styling and the existing NaNa publisher integrations. It does not upload selected user files.

Publisher integrations: AdSense, Google Tag Manager, Google Analytics and Cloudflare Web Analytics, with the same publisher settings as the NaNa Lab homepage. These scripts can make network requests independently of local file processing.

Original JPEG cards are rendered from original text and geometry using an installed system font; no font files are redistributed. Existing source references and third-party notices remain applicable.
