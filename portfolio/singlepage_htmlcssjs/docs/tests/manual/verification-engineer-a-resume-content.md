# Verification Engineer A — Resume / Content Alignment

| Field | Value |
| --- | --- |
| **Date** | 2026-08-10 (UTC evening / local 2026-08-11 ~00:00) |
| **Engineer** | Verification Engineer A (content / resume alignment) |
| **Live URL** | http://127.0.0.1:4173 |
| **Main repo path** | `/mnt/d/workspaces/experiments/cursor_exp/cursor_experiments/portfolio/singlepage_htmlcssjs` |
| **Method** | Playwright Chromium (`playwright` Node API), headless exploratory script |
| **Sources of truth** | `docs/resumes/venkataratnam_bhumireddy_cv260612.pdf`, `js/content.js`, `requirements.md`, `README.md` |
| **Screenshots** | `docs/tests/manual/screenshots-a/` |
| **Raw JSON** | `docs/tests/manual/verification-engineer-a-resume-content.json` |
| **Helper script** | `docs/tests/manual/verify-a-resume-content.mjs` |

## Environment

- OS: Linux (WSL2)
- Node: v24.19.0
- `@playwright/test` / `playwright` from project `node_modules`
- Static server already listening on `:4173` (`serve`)
- Chromium host libs: system missing `libnspr4` / `libasound`; launched successfully with `LD_LIBRARY_PATH` pointing at user-extracted `.deb` libs under `/tmp/pw-libs/extr/usr/lib/x86_64-linux-gnu` (no sudo `playwright install-deps`)

## Method notes

1. Navigated to `http://127.0.0.1:4173` with `Cache-Control: no-cache` request headers.
2. Unregistered service worker(s) and deleted Cache Storage keys, then hard-reloaded with a cache-busting query (`?v=` / `?nocache=`).
3. Captured hero + section screenshots.
4. Asserted visible text / DOM / network responses against the checklist below.
5. Cross-checked rendered live DOM against `js/content.js` and requirements brand/demo decisions (1C / 2A).

## Service worker / cache

| Observation | Detail |
| --- | --- |
| SW registered on first load | Yes — `http://127.0.0.1:4173/sw.js` |
| `CACHE_NAME` (from `sw.js` + runtime) | `vrb-portfolio-v3` |
| Stale “Software engineer” shell after hard reload? | **No** — not observed |
| After unregister + cache clear + reload | Content matched Analog IC brand |

**Note:** A PWA cache-first SW can serve an older shell if a previous version was cached. This run cleared `vrb-portfolio-v3` before final assertions. If a human tester still sees “Software engineer”, unregister the SW and hard-reload (or bump `CACHE_NAME`).

## Checklist

| ID | Check | Result | Evidence |
| --- | --- | --- | --- |
| A1 | H1 name = Venkata Ratnam Bhumireddy | **PASS** | `#hero-name` / `h1`: “Venkata Ratnam Bhumireddy”. Screenshot: `screenshots-a/hero-viewport.png` |
| A2 | Title/job = Staff Analog IC Design Engineer (not generic Software engineer) | **PASS** | `#home .hero-title[data-profile-title]`: “Staff Analog IC Design Engineer”. Document title: “Venkata Ratnam Bhumireddy — Staff Analog IC Design Engineer”. No “Software engineer” body copy. |
| A3 | About mentions Vishay / mixed-signal | **PASS** | About: “Staff Analog IC Design Engineer at Vishay Siliconix in Cork…”; pitch/about use “mixed-signal”. `screenshots-a/about-section.png` |
| A4 | Education: DA-IICT/VLSI, GVP, SVU | **PASS** | “Dhirubhai Ambani Institute of ICT (DA-IICT)… Masters Degree, VLSI”; “GVP PG College…”; “Sri Venkateswara University…”. `screenshots-a/education-section.png` |
| A5 | Experience: Vishay, MCCI, GateLength, NXP (+ Analog Semiconductors) | **PASS** | All present in `#experience` timeline (roles + companies). `screenshots-a/experience-section.png` |
| A6 | Portfolio demo badge + Senior ML / Agentic (not CV employment) | **PASS** | Badge `span.experience-badge`: “Portfolio demo”; role “Senior ML Engineer — Agentic AI Systems”; company “Independent portfolio demonstration (not CV employment)”. `screenshots-a/experience-demo.png` |
| A7 | Projects: 16 GHz / 0.6 ps, PMIC ~90%, real GitHub repos | **PASS** | Portfolio shows “16 GHz”, “0.6 ps rms”, “~90%”, “100 MHz PMIC…”. Links: `https://github.com/microsoft/autogen`, `https://github.com/crewAIInc/crewAI`. `screenshots-a/portfolio-section.png` |
| A8 | Resume PDF link works (`./assets/resume.pdf`) | **PASS** | Anchor `href="./assets/resume.pdf"`; HTTP GET → **200**, `Content-Type: application/pdf` |
| A9a | Contact email correct | **PASS** | Visible + `mailto:venkata.ratnam.in17@gmail.com` |
| A9b | LinkedIn present | **PASS** | `https://www.linkedin.com/in/venkata-ratnam-bhumireddy` |
| A9c | No phone on page | **PASS** | No `tel:` links; contact section shows email + LinkedIn/GitHub only. (Initial naive digit regex false-positived on year ranges like 2006/2015 — adjudicated PASS after stricter review.) |
| A10 | Sections: Home, About, Education, Experience, Portfolio, Resume, Contact, FAQ | **PASS** | Nav links for all eight; DOM ids `#home` … `#faq` each count=1 |
| A11 | FAQ clarifies demo vs employment | **PASS** | Expanded FAQ answer: “No. It is labeled Portfolio demo — independent exploration… My CV employment history is analog / mixed-signal IC design.” `screenshots-a/faq-expanded.png` |
| A12 | Requirements brand (1C) + demo (2A) reflected live | **PASS** | Matches `requirements.md` / README: primary Staff Analog IC; Experience demo labeled, not CV employment |

### Automated script score (pre-adjudication)

From `verify-a-resume-content.mjs` JSON: **40 PASS / 2 FAIL** on fine-grained sub-checks.

| Script FAIL | Adjudication |
| --- | --- |
| A2b — selector used first of `#home, .hero, header, main` and captured header/nav text only | **False FAIL** — `#home` alone contains “Staff Analog IC Design Engineer” (confirmed in follow-up Playwright evaluate + hero screenshot) |
| A9c — phone regex matched education year fragments | **False FAIL** — no phone / `tel:` on page |

**Adjudicated checklist: 14/14 PASS (0 content defects).**

## Defects

None for resume/content alignment against the stated expectations.

Minor non-blocking observations (not fails for this brief):

1. Experience demo period renders as “Portfolio demo” twice next to the badge (“Portfolio demo Portfolio demo”) because `period` and `label` are both “Portfolio demo” in `js/content.js`.
2. GitHub project links are public **placeholders** (AutoGen / CrewAI), consistent with README — not personal employment repos.
3. Canonical / sitemap still use `https://example.com` (out of scope for resume alignment).

## Does the website match the updated resume and requirements?

**Yes.** The live site at `http://127.0.0.1:4173` reflects the resume-driven **Staff Analog IC Design Engineer** brand, Vishay/MCCI/GateLength/NXP (+ related) experience, DA-IICT / GVP / SVU education, IC project metrics, correct contact email and LinkedIn with **no phone**, and a clearly labeled **Portfolio demo** Senior ML / Agentic AI Experience entry with FAQ clarification that it is not CV employment — aligned with `requirements.md` decisions 1C and 2A and `js/content.js`.

## Verdict

**PASS** — content / resume alignment verified on the live server after SW unregister + cache clear. No stale Software-engineer shell observed with `CACHE_NAME=vrb-portfolio-v3`.

## Artifact paths

- Report: `docs/tests/manual/verification-engineer-a-resume-content.md`
- JSON: `docs/tests/manual/verification-engineer-a-resume-content.json`
- Screenshots directory: `docs/tests/manual/screenshots-a/`
  - `hero-viewport.png`, `hero-home-section.png`, `full-page.png`
  - `about-section.png`, `education-section.png`, `experience-section.png`, `experience-demo.png`
  - `portfolio-section.png`, `resume-section.png`, `contact-section.png`, `faq-section.png`, `faq-expanded.png`
