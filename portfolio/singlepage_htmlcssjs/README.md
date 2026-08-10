# singlepage_htmlcssjs

Minimal single-page portfolio for **Venkata Ratnam Bhumireddy**, built with HTML, CSS, and vanilla JavaScript.

This experiment adapts the approved UI/UX tokens and principles from [`docs/design/portfolio_ui_ux_decisions_final.md`](docs/design/portfolio_ui_ux_decisions_final.md). The Next.js production architecture in [`docs/design/portfolio_architecture_decisions_final.md`](docs/design/portfolio_architecture_decisions_final.md) is intentionally out of scope here (no backend, AI assistant, or MDX).

## Features

- Sections: Home, About, Education, Portfolio, Resume, Contact, FAQ
- Dark technical minimal design (CSS design tokens)
- Responsive layout + sticky / mobile navigation
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

Update copy, projects, education, FAQ, and contact details in [`js/content.js`](js/content.js). Sections re-render from that single content source on load.

Replace `https://example.com` in `index.html`, `robots.txt`, and `sitemap.xml` with your real domain before publishing. Update the contact email in `js/content.js`.

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
├── assets/              # icons / OG artwork
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
