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
- PWA: web manifest + cache-first service worker for the static shell
- TDD: Vitest unit tests + Playwright e2e smoke tests

## Quick start

```bash
# optional: install test tooling
npm install

# serve the site (static)
npm run serve
# open http://127.0.0.1:4173
```

You can also open `index.html` directly in a browser. ES modules and the service worker work best over `http://` (use `npm run serve`).

## Edit content

Update copy, projects, education, experience, FAQ, and contact details in [`js/content.js`](js/content.js). Sections re-render from that single content source on load.

Replace `https://example.com` in `index.html`, `robots.txt`, and `sitemap.xml` with your real domain before publishing.

## Tests

```bash
npm test                 # Vitest unit + DOM integration (jsdom)
npm run test:e2e         # DOM integration suite (no browser binaries required)
npm run test:e2e:playwright  # Playwright smoke (needs Chromium + host libs)
```

Playwright requires browser system libraries (`npx playwright install chromium` and, on Linux, `npx playwright install-deps chromium`). Use the Vitest DOM suite when those cannot be installed.

## Project layout

```text
.
├── index.html
├── css/                 # tokens, base, layout, components
├── js/                  # content, render, nav, faq, contact, reveal, main
├── assets/              # icons, hero/project media, resume.pdf, ATTRIBUTION.md
├── docs/resumes/        # source CV PDF
├── manifest.webmanifest
├── sw.js
├── robots.txt
├── sitemap.xml
└── tests/               # unit + e2e
```

## Skills used

Installed under `.agents/skills/`: `frontend-design`, `ui-ux-pro-max`, `copywriting`, `seo`, `tdd`, `test-driven-development`, `webapp-testing`, `web-design-guidelines`.

## Deploy notes

Any static host works (GitHub Pages, Cloudflare Pages, Netlify, etc.). Point the host at this folder root. After deploy, verify the service worker registers over HTTPS and update canonical / sitemap URLs.

## Assets

1. **Images:** Unsplash stills stored under `assets/` (Unsplash License). See [`assets/ATTRIBUTION.md`](assets/ATTRIBUTION.md).
2. **Video:** `assets/hero-loop.mp4` is currently an MDN CC0 sample. Prefer replacing with a Pixabay tech/circuit loop (Pixabay Content License) using the same path.
3. **Projects:** Public GitHub repos used as placeholders (`microsoft/autogen`, `crewAIInc/crewAI`).

## Development guidelines

1. Git branching: `feature/*`, `fix/*`, `release/*` from `dev`; merge back to `dev` after tests pass. Do not push without explicit request.
