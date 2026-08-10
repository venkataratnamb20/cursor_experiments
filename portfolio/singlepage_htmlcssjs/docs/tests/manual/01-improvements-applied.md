# Follow-up improvements from manual verification

Date: 2026-08-10

Applied against defects in:

- [verification-engineer-a-resume-content.md](./verification-engineer-a-resume-content.md) (A-2, A-3)
- [verification-engineer-b-ux-requirements.md](./verification-engineer-b-ux-requirements.md) (B-1 docs, B-2, B-3, B-4)

| ID | Change |
| --- | --- |
| A-2 / B-4 | Confirmed `sw.js` `vrb-portfolio-v3` network-first for HTML/JS; README cache-clear steps |
| A-3 / B-2 | Replaced MDN flower hero with Pexels motherboard tech loop; updated ATTRIBUTION + content copy |
| B-3 | Added `site.origin` in `js/content.js` + `js/seo.js` hydrate for canonical/OG/JSON-LD; robots/sitemap comments |
| B-1 | Documented `npx playwright install-deps chromium` for `libnspr4.so` |
| Extra | Project image `alt` text uses project title; SW precache includes `seo.js` |

**Still required before public launch:** replace `https://example.com` in `site.origin`, `robots.txt`, and `sitemap.xml` with the real HTTPS origin.
