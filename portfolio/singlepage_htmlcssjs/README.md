# singlepage_htmlcssjs

Minimal single-page portfolio for **Venkata Ratnam Bhumireddy**, built with HTML, CSS, and vanilla JavaScript.

This experiment adapts the approved UI/UX tokens and principles from [`docs/design/portfolio_ui_ux_decisions_final.md`](docs/design/portfolio_ui_ux_decisions_final.md). The Next.js production architecture in [`docs/design/portfolio_architecture_decisions_final.md`](docs/design/portfolio_architecture_decisions_final.md) is intentionally out of scope here (no backend, AI assistant, or MDX).

Primary brand: **Staff Analog IC Design Engineer** (content from [`docs/resumes/`](docs/resumes/)). A **Portfolio demo** Experience entry covers Senior ML / agentic AI systems and is labeled so it is not mistaken for CV employment.

## Features

- Sections: Home, About, Education, Experience, Portfolio, Resume, Contact, FAQ
- Dark technical minimal design (CSS design tokens)
- Responsive layout + sticky / mobile navigation
- Hero media (poster + muted video; reduced-motion uses poster only)
- FAQ accordion and client-side contact validation (`mailto:`)
- SEO: meta tags, Open Graph, JSON-LD `Person`, `robots.txt`, `sitemap.xml`
- PWA: web manifest + service worker (**network-first** for HTML/JS so content updates are not stuck)
- TDD: Vitest unit tests + Playwright e2e smoke tests

## Quick start

```bash
# optional: install test tooling
npm install

# serve the site (static)
npm run serve
# open http://127.0.0.1:4173
```

Use `http://` (not `file://`) so ES modules and the service worker behave correctly.

### Seeing an old version of the site?

1. Confirm `npm run serve` is running.
2. DevTools → Application → Service Workers → **Unregister**.
3. Delete old Cache Storage entries (`vrb-portfolio-v1` / `v2` if present).
4. Hard refresh (Ctrl+Shift+R).

See [`docs/tests/manual/00-stale-ui-and-tooling-notes.md`](docs/tests/manual/00-stale-ui-and-tooling-notes.md).

## Edit content

Update copy, projects, education, experience, FAQ, and contact in [`js/content.js`](js/content.js).

**Before publishing**, set `site.origin` in `js/content.js` (no trailing slash). Runtime SEO (`js/seo.js`) updates canonical, `og:url`, `og:image`, and JSON-LD `url`. Also mirror the same origin into [`robots.txt`](robots.txt) and [`sitemap.xml`](sitemap.xml).

## Tests

```bash
npm test                 # Vitest unit + DOM integration (jsdom)
npm run test:e2e         # DOM integration suite (no browser binaries required)
npm run test:e2e:playwright  # Playwright smoke (needs Chromium + host libs)
```

Playwright on Linux needs Chromium **and** system libraries:

```bash
npx playwright install chromium
npx playwright install-deps chromium   # fixes missing libs e.g. libnspr4.so
```

If deps cannot be installed, use the Vitest DOM suite. Manual verification notes live under [`docs/tests/manual/`](docs/tests/manual/).

## Project layout

```text
.
├── index.html
├── css/                 # tokens, base, layout, components
├── js/                  # content, render, seo, nav, faq, contact, reveal, main
├── assets/              # icons, hero/project media, resume.pdf, ATTRIBUTION.md
├── docs/resumes/        # source CV PDF
├── docs/tests/manual/   # manual verification feedback
├── manifest.webmanifest
├── sw.js
├── robots.txt
├── sitemap.xml
└── tests/               # unit + e2e
```

## Skills used

Installed under `.agents/skills/`: `frontend-design`, `ui-ux-pro-max`, `copywriting`, `seo`, `tdd`, `test-driven-development`, `webapp-testing`, `web-design-guidelines`.

## Deploy notes

Production URL (GitHub Pages project site):
**https://venkataratnamb20.github.io/cursor_experiments/**

CI/CD: [`.github/workflows/deploy-portfolio-pages.yml`](../../.github/workflows/deploy-portfolio-pages.yml) runs tests on PRs/pushes touching this folder, then deploys the static site to GitHub Pages from `dev` or `main`.

After the first successful deploy, set the repository **Settings → Pages → Source** to **GitHub Actions** (if not already).

`site.origin`, `robots.txt`, `sitemap.xml`, and `index.html` meta tags are set to the Pages URL above.

## Assets

1. **Images:** Unsplash stills under `assets/` (Unsplash License). See [`assets/ATTRIBUTION.md`](assets/ATTRIBUTION.md).
2. **Video:** `assets/hero-loop.mp4` — Pexels motherboard close-up (tech subject). Pixabay loops may replace the same path.
3. **Projects:** Public GitHub repos as placeholders (`microsoft/autogen`, `crewAIInc/crewAI`).

## Development guidelines

1. Git branching: `feature/*`, `fix/*`, `release/*` from `dev`; merge back to `dev` after tests pass. Do not push without explicit request.
