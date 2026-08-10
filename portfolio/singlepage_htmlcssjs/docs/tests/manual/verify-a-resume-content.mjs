/**
 * Manual exploratory verification (Verification Engineer A).
 * Playwright Chromium against live http://127.0.0.1:4173
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAIN = path.resolve(__dirname, '../../..');
const SCREEN_DIR = path.join(__dirname, 'screenshots-a');
const BASE = 'http://127.0.0.1:4173';

fs.mkdirSync(SCREEN_DIR, { recursive: true });

const checks = [];
function check(id, description, pass, evidence = '') {
  checks.push({ id, description, pass: !!pass, evidence: String(evidence).slice(0, 500) });
  console.log(`${pass ? 'PASS' : 'FAIL'} [${id}] ${description}`);
  if (evidence) console.log(`       evidence: ${String(evidence).slice(0, 200)}`);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  ignoreHTTPSErrors: true,
});
// Disable HTTP cache where possible
await context.route('**/*', async (route) => {
  const headers = {
    ...route.request().headers(),
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  };
  await route.continue({ headers });
});

const page = await context.newPage();
const consoleMsgs = [];
page.on('console', (msg) => consoleMsgs.push(`${msg.type()}: ${msg.text()}`));

await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });

// Unregister service workers + clear caches to avoid stale shell
const swInfo = await page.evaluate(async () => {
  const regs = (await navigator.serviceWorker?.getRegistrations?.()) || [];
  const urls = regs.map((r) => r.active?.scriptURL || r.installing?.scriptURL || 'unknown');
  for (const r of regs) await r.unregister();
  let cacheNames = [];
  if (typeof caches !== 'undefined') {
    cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((n) => caches.delete(n)));
  }
  return { swCount: regs.length, swUrls: urls, cacheNames };
});

// Hard reload after SW unregister
await page.goto(`${BASE}/?v=${Date.now()}`, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(500);

const bodyText = await page.locator('body').innerText();
const html = await page.content();

// Hero screenshot
const heroPath = path.join(SCREEN_DIR, 'hero-viewport.png');
await page.screenshot({ path: heroPath, fullPage: false });
const fullPath = path.join(SCREEN_DIR, 'full-page.png');
await page.screenshot({ path: fullPath, fullPage: true });

// Sections about / experience / portfolio / contact screenshots
for (const [sel, name] of [
  ['#about', 'about'],
  ['#education', 'education'],
  ['#experience', 'experience'],
  ['#portfolio', 'portfolio'],
  ['#resume', 'resume'],
  ['#contact', 'contact'],
  ['#faq', 'faq'],
]) {
  const loc = page.locator(sel);
  if (await loc.count()) {
    await loc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({
      path: path.join(SCREEN_DIR, `${name}-section.png`),
      fullPage: false,
    });
  }
}

// --- Assertions ---
const h1 = await page.locator('h1').first().innerText().catch(() => '');
check('A1', 'H1 name is Venkata Ratnam Bhumireddy', /Venkata Ratnam Bhumireddy/i.test(h1), h1);

const titleCandidates = [
  await page.locator('[data-profile-title], .hero__title, .profile-title, h1 + p, .hero p').first().innerText().catch(() => ''),
  bodyText.match(/Staff Analog IC Design Engineer/i)?.[0] || '',
];
const hasAnalogTitle = /Staff Analog IC Design Engineer/i.test(bodyText);
const hasSoftwarePlaceholder = /\bSoftware [Ee]ngineer\b/.test(bodyText) && !/ML Engineer/.test(bodyText);
check(
  'A2',
  'Primary title/job is Analog IC (Staff Analog IC Design Engineer), not generic Software engineer',
  hasAnalogTitle && !/Software engineer/i.test(await page.locator('h1').evaluate((el) => el.parentElement?.innerText || '').catch(() => '')),
  `hasAnalogTitle=${hasAnalogTitle}; hero vicinity: ${titleCandidates.join(' | ').slice(0, 200)}`,
);

// Stronger check: hero region should contain Analog title
const heroText = await page.locator('#home, .hero, header, main').first().innerText().catch(() => bodyText.slice(0, 800));
check(
  'A2b',
  'Hero/home region includes Staff Analog IC Design Engineer',
  /Staff Analog IC Design Engineer/i.test(heroText),
  heroText.slice(0, 300),
);
check(
  'A2c',
  'No stale "Software engineer" placeholder as primary brand in visible body',
  !/^Software engineer$/im.test(bodyText) && !/Software Engineer —|Software engineer at/i.test(bodyText),
  bodyText.includes('Software') ? `Software mentions: ${[...bodyText.matchAll(/[^\n]*Software[^\n]*/gi)].map((m) => m[0]).join(' || ')}` : 'no Software mentions',
);

check(
  'A3',
  'About mentions Vishay / mixed-signal',
  /Vishay/i.test(bodyText) && /mixed-signal/i.test(bodyText),
  (bodyText.match(/[^\n]*Vishay[^\n]*/i)?.[0] || '') + ' | ' + (bodyText.match(/[^\n]*mixed-signal[^\n]*/i)?.[0] || ''),
);

check(
  'A4a',
  'Education includes DA-IICT / VLSI',
  /DA-IICT/i.test(bodyText) && /VLSI/i.test(bodyText),
  bodyText.match(/[^\n]*DA-IICT[^\n]*/i)?.[0],
);
check('A4b', 'Education includes GVP', /GVP/i.test(bodyText), bodyText.match(/[^\n]*GVP[^\n]*/i)?.[0]);
check(
  'A4c',
  'Education includes SVU / Sri Venkateswara',
  /Sri Venkateswara|SVU/i.test(bodyText),
  bodyText.match(/[^\n]*(Sri Venkateswara|SVU)[^\n]*/i)?.[0],
);

const employers = ['Vishay', 'MCCI', 'GateLength', 'NXP'];
for (const e of employers) {
  check(`A5-${e}`, `Experience mentions ${e}`, new RegExp(e, 'i').test(bodyText), bodyText.match(new RegExp(`[^\n]*${e}[^\n]*`, 'i'))?.[0]);
}

check(
  'A6a',
  'Portfolio demo badge/label present',
  /Portfolio demo/i.test(bodyText),
  bodyText.match(/[^\n]*Portfolio demo[^\n]*/gi)?.slice(0, 3).join(' || '),
);
check(
  'A6b',
  'Senior ML Engineer / Agentic AI demo text present',
  /Senior ML Engineer/i.test(bodyText) && /Agentic AI/i.test(bodyText),
  bodyText.match(/[^\n]*Senior ML Engineer[^\n]*/i)?.[0],
);
check(
  'A6c',
  'Demo marked as not CV employment',
  /not CV employment|not.*employment/i.test(bodyText),
  bodyText.match(/[^\n]*not CV employment[^\n]*/i)?.[0] ||
    bodyText.match(/[^\n]*Is the Senior ML[^\n]*/i)?.[0],
);

check(
  'A7a',
  'Projects show 16 GHz / 0.6 ps metrics',
  /16 GHz/i.test(bodyText) && /0\.6 ps/i.test(bodyText),
  `${bodyText.match(/[^\n]*16 GHz[^\n]*/i)?.[0]} | ${bodyText.match(/[^\n]*0\.6 ps[^\n]*/i)?.[0]}`,
);
check(
  'A7b',
  'Projects show PMIC ~90% efficiency',
  /PMIC/i.test(bodyText) && /90\s*%|~90%/i.test(bodyText),
  bodyText.match(/[^\n]*90%[^\n]*/i)?.[0] || bodyText.match(/[^\n]*PMIC[^\n]*/i)?.[0],
);

const githubLinks = await page.locator('a[href*="github.com"]').evaluateAll((as) =>
  [...new Set(as.map((a) => a.href))],
);
check(
  'A7c',
  'GitHub links to real repos present (autogen / crewAI)',
  githubLinks.some((u) => /github\.com\/microsoft\/autogen/i.test(u)) &&
    githubLinks.some((u) => /github\.com\/crewAIInc\/crewAI/i.test(u)),
  githubLinks.join(', '),
);

const resumeHref = await page.locator('a[href*="resume.pdf"]').first().getAttribute('href').catch(() => null);
check(
  'A8a',
  'Resume PDF link points to ./assets/resume.pdf',
  resumeHref === './assets/resume.pdf' || resumeHref === 'assets/resume.pdf' || /assets\/resume\.pdf$/.test(resumeHref || ''),
  resumeHref,
);

const resumeResp = await page.request.get(new URL(resumeHref || './assets/resume.pdf', BASE).href);
check(
  'A8b',
  'Resume PDF URL returns HTTP 200 with PDF content-type or bytes',
  resumeResp.ok() &&
    ((resumeResp.headers()['content-type'] || '').includes('pdf') ||
      (await resumeResp.body()).subarray(0, 4).toString() === '%PDF'),
  `status=${resumeResp.status()} content-type=${resumeResp.headers()['content-type']}`,
);

check(
  'A9a',
  'Contact email is venkata.ratnam.in17@gmail.com',
  /venkata\.ratnam\.in17@gmail\.com/i.test(bodyText) ||
    (await page.locator('a[href^="mailto:"]').evaluateAll((as) => as.map((a) => a.href))).some((h) =>
      /venkata\.ratnam\.in17@gmail\.com/i.test(h),
    ),
  bodyText.match(/venkata\.ratnam\.in17@gmail\.com/i)?.[0] ||
    (await page.locator('a[href^="mailto:"]').evaluateAll((as) => as.map((a) => a.href))).join(', '),
);

const linkedIn = await page.locator('a[href*="linkedin.com"]').evaluateAll((as) => as.map((a) => a.href));
check(
  'A9b',
  'LinkedIn link present',
  linkedIn.some((u) => /linkedin\.com\/in\/venkata-ratnam-bhumireddy/i.test(u)),
  linkedIn.join(', '),
);

const phoneLike = bodyText.match(/(?:\+?\d[\d\s().-]{7,}\d)|(?:tel:)/gi) || [];
const telLinks = await page.locator('a[href^="tel:"]').count();
check(
  'A9c',
  'No phone number on page',
  phoneLike.length === 0 && telLinks === 0,
  `phoneLike=${JSON.stringify(phoneLike)} telLinks=${telLinks}`,
);

const navLabels = ['Home', 'About', 'Education', 'Experience', 'Portfolio', 'Resume', 'Contact', 'FAQ'];
const missingNav = [];
for (const label of navLabels) {
  const inNav = await page.locator(`nav a, .nav a, header a`).filter({ hasText: new RegExp(`^${label}$`, 'i') }).count();
  const sectionId = `#${label.toLowerCase()}`;
  const hasSection = (await page.locator(sectionId).count()) > 0 || new RegExp(label, 'i').test(bodyText);
  if (inNav === 0 && !hasSection) missingNav.push(label);
  check(`A10-${label}`, `Section/nav present: ${label}`, inNav > 0 || hasSection, `navMatches=${inNav} section=${hasSection}`);
}

check(
  'A11',
  'FAQ clarifies demo vs employment',
  /Portfolio demo/i.test(bodyText) &&
    (/Is the Senior ML/i.test(bodyText) || /not CV employment/i.test(bodyText)) &&
    /analog|mixed-signal/i.test(bodyText),
  bodyText.match(/Is the Senior ML[\s\S]{0,200}/i)?.[0]?.replace(/\s+/g, ' '),
);

// Section id existence
for (const id of ['home', 'about', 'education', 'experience', 'portfolio', 'resume', 'contact', 'faq']) {
  const count = await page.locator(`#${id}`).count();
  check(`A12-${id}`, `DOM section #${id} exists`, count > 0, `count=${count}`);
}

// SW / cache notes
check(
  'A13',
  'Document SW/cache state after hard-reload strategy',
  true,
  JSON.stringify(swInfo),
);

// Stale content probe
check(
  'A14',
  'Page does not show only outdated Software-engineer shell as H1/title',
  !/^Software engineer$/i.test(h1.trim()) && hasAnalogTitle,
  `h1="${h1}"`,
);

const passCount = checks.filter((c) => c.pass).length;
const failCount = checks.filter((c) => !c.pass).length;

const result = {
  date: new Date().toISOString(),
  baseUrl: BASE,
  swInfo,
  screenshots: {
    hero: heroPath,
    full: fullPath,
  },
  githubLinks,
  resumeHref,
  passCount,
  failCount,
  checks,
  consoleSample: consoleMsgs.slice(0, 30),
};

const outJson = path.join(__dirname, 'verification-engineer-a-resume-content.json');
fs.writeFileSync(outJson, JSON.stringify(result, null, 2));
console.log(`\nSUMMARY pass=${passCount} fail=${failCount}`);
console.log(`JSON: ${outJson}`);
console.log(`Hero screenshot: ${heroPath}`);

await browser.close();
process.exit(failCount > 0 ? 1 : 0);
