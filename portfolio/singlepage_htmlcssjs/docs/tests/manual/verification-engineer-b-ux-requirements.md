# Verification Engineer B — UX / Requirements / Media

**Date:** 2026-08-10 (UTC+1)  
**Engineer:** Verification Engineer B (independent of Engineer A)  
**Live URL under test:** http://127.0.0.1:4173  
**Main repo path:** `/mnt/d/workspaces/experiments/cursor_exp/cursor_experiments/portfolio/singlepage_htmlcssjs`  
**Sources of truth:** `requirements.md`, `README.md`, design tokens in `css/tokens.css`, content in `js/content.js` / `index.html`

## Overall verdict

**PASS** against requirements.md + README feature set for UX, sections, responsive behavior, SEO/PWA, media, motion, contact, FAQ, and Analog IC brand copy.

Automated atomic probes initially reported **52 PASS / 5 FAIL**; after screenshot review and HTTP/lazy-load cross-checks, the **5 automated FAILs are false positives** (H1 = name by design; project `img.naturalWidth === 0` before lazy decode). Requirements checklist below is **10/10 PASS**.

Minor non-blocking notes: service-worker cache history can still confuse returning browsers; hero video is stock (Pexels motherboard loop per `ATTRIBUTION.md`); GitHub project links are intentional placeholders.

---

## Method

1. Cleared cookies/storage and unregistered service workers via Chrome DevTools Protocol (CDP), then hard-reloaded http://127.0.0.1:4173.
2. Exercised desktop (1280×800) and mobile (375×812): sections, nav → `#experience`, FAQ accordion, empty contact submit, reduced-motion media.
3. Network-checked hero poster/video, project JPEGs, resume PDF, manifest, SW, `ATTRIBUTION.md` (all HTTP 200).
4. Compared visible hero brand/title to Analog IC requirements (not software-engineer placeholders).

**Tooling note:** Project Playwright Chromium (`chrome-headless-shell`) could not launch in this WSL environment (`libnspr4.so` missing; `playwright install-deps` needs sudo). Verification used **Windows Headless Chrome 151 + CDP** driven from PowerShell (`docs/tests/manual/_verify-b-cdp.ps1`), which is equivalent browser automation against the same live URL. Raw machine JSON: `docs/tests/manual/_verify-b-results.json`.

---

## Screenshots

Directory: `docs/tests/manual/screenshots-b/`

| File | What it shows |
| --- | --- |
| `desktop-1280-hero.png` | Hero: name + **Staff Analog IC Design Engineer**, circuit media, CTAs |
| `desktop-1280-full.png` | Full-page desktop capture |
| `desktop-1280-experience.png` | Nav to Experience; Analog IC timeline + portfolio-demo labeling copy |
| `desktop-1280-faq.png` / contact capture | FAQ accordion UI; contact validation messaging |
| `desktop-1280-contact-validation.png` | Empty submit → “Please fix the errors above.” |
| `desktop-1280-reduced-motion.png` | Prefers-reduced-motion path (video hidden; poster path) |
| `mobile-375-hero.png` | 375px hero readable, no obvious overflow |
| `mobile-375-full.png` | Full-page mobile |
| `mobile-375-nav-open.png` | Menu open with all 8 section links |

---

## PASS/FAIL checklist (requirements)

| # | Requirement | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Sections: Home, About, Education, Experience, Portfolio, Resume, Contact, FAQ (nav + landmarks) | **PASS** | All `#id` sections present; nav links for each; `<header>` + `<main>` landmarks; sticky nav visible in screenshots |
| 2 | Responsive 375px & 1280px — nav usable, hero readable, no obvious overflow | **PASS** | No horizontal overflow at either viewport; mobile Menu exposes all links; hero name/title/CTAs readable |
| 3 | PWA: manifest linked; SW registers | **PASS** | `<link rel="manifest">` → `/manifest.webmanifest` (200); SW registered at scope `/` (`vrb-portfolio-v3` in `sw.js`) |
| 4 | SEO: title/description/canonical/JSON-LD Person with Analog IC `jobTitle` + email | **PASS** | Title/description include Staff Analog IC; canonical present; Person `jobTitle`: `Staff Analog IC Design Engineer`; `email`: `mailto:venkata.ratnam.in17@gmail.com` |
| 5 | Media: hero poster + video (or poster-only under reduced motion); project images HTTP 200; `ATTRIBUTION.md` | **PASS** | Poster + `hero-loop.mp4` present (200); project JPEGs 200; `assets/ATTRIBUTION.md` exists (Unsplash + Pexels credits) |
| 6 | `prefers-reduced-motion` hides/disables video | **PASS** | Under reduced motion: `display:none`, `opacity:0`, `hidden` attr, `paused:true` on `.hero-video` |
| 7 | Contact: empty submit shows validation; email mailto target | **PASS** | Errors for name/email/message + summary “Please fix the errors above.”; `mailto:venkata.ratnam.in17@gmail.com` |
| 8 | FAQ accordion open/close | **PASS** | Button accordion: `aria-expanded` false → true → false (4 items) |
| 9 | Design tokens dark technical (~`#090d16`); not placeholder “Software engineer building reliable systems” | **PASS** | `body` background `rgb(9, 13, 22)` = `#090d16` (`--bg-primary`); no placeholder software-engineer string in DOM/HTML |
| 10 | Assets guideline: Unsplash local; video present; GitHub placeholders real | **PASS** | Local Unsplash stills; video present (Pexels motherboard loop per ATTRIBUTION); links to `microsoft/autogen` and `crewAIInc/crewAI` |

---

## Detailed findings

### 1. Sections, nav, landmarks

- Section IDs verified: `home`, `about`, `education`, `experience`, `portfolio`, `resume`, `contact`, `faq`.
- Desktop nav lists all eight destinations; mobile Menu expands the same set.
- Clicking Experience scrolls to `#experience` and highlights the nav item (screenshot).
- Experience intro correctly distinguishes resume Analog IC roles from a labeled portfolio-demo Senior ML / agentic AI entry.

### 2. Responsive

- **1280px:** Sticky top nav usable; hero composition reads as one brand-led viewport (name, title, pitch, two CTAs, full-bleed media). No horizontal overflow (`scrollWidth == clientWidth`).
- **375px:** Menu control present; opened menu shows all section links; hero text wraps cleanly; no obvious overflow.

### 3. PWA / cache & why a user may still see an old site

- Manifest linked and fetchable.
- Service worker **registers** after load (`registered: true`, `active: true`). On first CDP visit after unregister, `controller` was still `false` until a subsequent navigation — normal SW lifecycle.
- `sw.js` currently uses **`CACHE_NAME = 'vrb-portfolio-v3'`** with **network-first for HTML/JS** (comment: avoid stuck content), cache-first for other shell assets. This is safer than a pure cache-first HTML shell, but:
  - Returning browsers may still hold **older cache names** (`v1`/`v2`) until the new SW activates and deletes them.
  - Offline fallback can still serve a previously cached `index.html`.
  - If a user previously visited a placeholder “software engineer” build on the same origin (`127.0.0.1:4173`), they can see stale UI until SW update + cache purge.

**Recommendation if UI looks stale:** DevTools → Application → Service Workers → **Unregister**, clear site data / Cache Storage, then hard refresh (Ctrl+Shift+R). Or `navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()))` then reload.

### 4. SEO

| Field | Observed |
| --- | --- |
| `<title>` | `Venkata Ratnam Bhumireddy — Staff Analog IC Design Engineer` |
| meta description | Analog IC / mixed-signal ASIC focused (no software-engineer placeholder) |
| canonical | `https://venkataratnamb20.github.io/cursor_experiments/` |
| JSON-LD `@type` | `Person` |
| `jobTitle` | `Staff Analog IC Design Engineer` |
| `email` | `mailto:venkata.ratnam.in17@gmail.com` |

### 5. Media & attribution

| Asset | HTTP | Notes |
| --- | --- | --- |
| `/assets/hero-poster.jpg` | 200 | Loads in hero (`naturalWidth` > 0) |
| `/assets/hero-loop.mp4` | 200 | Present; muted loop source |
| `/assets/project-silicon.jpg` | 200 | `loading="lazy"` — decode after scroll |
| `/assets/project-lab.jpg` | 200 | same |
| `/assets/project-agents.jpg` | 200 | reused for two agentic demo cards |
| `/assets/resume.pdf` | 200 | Resume download |
| `/assets/ATTRIBUTION.md` | 200 | Unsplash images; Pexels video credit |

Automated `naturalWidth === 0` on project images at initial probe is **not** a broken-asset defect; images use `loading="lazy"` in `js/render.js` and were above-the-fold deferred until portfolio scroll.

### 6. Motion

With `prefers-reduced-motion: reduce` emulated, hero `<video class="hero-video">` is hidden/disabled (`display: none`, `hidden`, paused). Poster remains the visual plane — matches README behavior.

### 7. Contact

Empty submit surfaces field errors:

- “Name is required (at least 2 characters).”
- “Email is required.”
- “Message must be at least 10 characters.”
- Summary: “Please fix the errors above.”

Mailto target: `mailto:venkata.ratnam.in17@gmail.com` (also in JSON-LD).

### 8. FAQ

Four questions; accordion toggles `aria-expanded` open/close. Includes recruiter/role questions and clarification that Senior ML / agentic AI is not CV employment — consistent with requirements content note.

### 9. Design tokens & copy

- CSS: `--bg-primary: #090d16` → computed body background `rgb(9, 13, 22)`.
- Dark technical UI with cyan accents; not a purple-on-white or cream/serif placeholder aesthetic.
- **No** “Software engineer building reliable systems” copy in served HTML or rendered body text.
- Visible hero hierarchy (screenshot): brand name as `h1`, job title line **Staff Analog IC Design Engineer**, availability chip for analog / mixed-signal IC roles.

### 10. Assets guideline

- Unsplash stills stored locally under `assets/` with ATTRIBUTION table.
- Video present at `assets/hero-loop.mp4` (Pexels motherboard loop — README also allows Pixabay replacement on same path).
- Portfolio GitHub placeholders resolve to real public repos: `microsoft/autogen`, `crewAIInc/crewAI`.

---

## Defects

| ID | Severity | Status | Description |
| --- | --- | --- | --- |
| — | — | **None blocking** | No requirements-blocking UX/media/SEO defects found on the live build. |
| B-NOTE-1 | Low / informational | Open | Returning clients with old SW caches may briefly see stale shells; mitigate with unregister / hard refresh (see PWA section). |
| B-NOTE-2 | Low / informational | Open | Hero video is stock Pexels (credited), not a custom Analog IC shoot; acceptable per README asset notes. |
| B-FP-1 | n/a | False positive | Automated “hero-title-analog FAIL” because probe used `h1` only; job title correctly lives in `.hero-title` / pitch (brand-first pattern). |
| B-FP-2 | n/a | False positive | Automated project image decode FAILs before lazy load; HTTP 200 confirms assets. |

---

## Automated probe summary (raw)

From `_verify-b-results.json` (pre-adjudication):

- **PASS:** 52  
- **FAIL:** 5 (adjudicated as false positives — see above)  
- **Requirements checklist:** **10 PASS / 0 FAIL**

---

## Paths written

| Artifact | Path |
| --- | --- |
| This report | `docs/tests/manual/verification-engineer-b-ux-requirements.md` |
| Screenshots | `docs/tests/manual/screenshots-b/` |
| Raw JSON | `docs/tests/manual/_verify-b-results.json` |
| CDP driver used | `docs/tests/manual/_verify-b-cdp.ps1` |
