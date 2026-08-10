import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { portfolioContent } from '../../js/content.js';
import {
  renderEducation,
  renderExperience,
  renderFaq,
  renderProjects,
  renderResumeHighlights,
} from '../../js/render.js';
import { initFaq } from '../../js/faq.js';
import { initNav } from '../../js/nav.js';
import { initContactForm } from '../../js/contact.js';
import { initReveal } from '../../js/reveal.js';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const html = readFileSync(resolve(rootDir, 'index.html'), 'utf8');

function mountPage() {
  document.documentElement.innerHTML = html.replace(/^[\s\S]*<html[^>]*>/i, '').replace(/<\/html>\s*$/i, '');
  // jsdom may not parse full document; set body from extracted main content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  document.body.innerHTML = bodyMatch ? bodyMatch[1] : '';

  // Strip live module scripts; we boot manually with imports under test.
  document.body.querySelectorAll('script').forEach((el) => el.remove());
}

function boot() {
  const { profile, about, resume, contact } = portfolioContent;

  document.querySelector('[data-profile-name]').textContent = profile.name;
  document.querySelector('[data-profile-title]').textContent = profile.title;
  document.querySelector('[data-profile-availability]').textContent =
    profile.availability;
  document.querySelector('[data-profile-pitch]').textContent = profile.pitch;
  document.querySelector('[data-about-body]').innerHTML = about.body
    .map((p) => `<p>${p}</p>`)
    .join('');
  document.querySelector('[data-education-list]').innerHTML = renderEducation(
    portfolioContent.education,
  );
  const experienceRoot = document.querySelector('[data-experience-list]');
  if (experienceRoot) {
    experienceRoot.innerHTML = renderExperience(portfolioContent.experience);
  }
  document.querySelector('[data-projects-list]').innerHTML = renderProjects(
    portfolioContent.projects,
  );
  document.querySelector('[data-faq]').innerHTML = renderFaq(portfolioContent.faq);
  document.querySelector('[data-resume-highlights]').innerHTML =
    renderResumeHighlights(resume.highlights);
  document.querySelector('[data-contact-email]').textContent = contact.email;

  initNav(document);
  initFaq(document.querySelector('[data-faq]'));
  initContactForm(
    document.querySelector('[data-contact-form]'),
    contact.email,
  );
  initReveal(document);
}

describe('portfolio SPA DOM integration', () => {
  beforeEach(() => {
    mountPage();
    boot();
  });

  it('exposes all required section landmarks', () => {
    for (const id of [
      'home',
      'about',
      'education',
      'experience',
      'portfolio',
      'resume',
      'contact',
      'faq',
    ]) {
      expect(document.getElementById(id)).toBeTruthy();
    }
    expect(document.querySelector('h1')?.textContent).toContain(
      'Venkata Ratnam Bhumireddy',
    );
  });

  it('renders IC experience and agentic portfolio demo', () => {
    const items = document.querySelectorAll(
      '[data-experience-list] .timeline-item',
    );
    expect(items.length).toBe(portfolioContent.experience.length);
    const text = document.querySelector('[data-experience-list]')?.textContent;
    expect(text).toMatch(/Vishay/i);
    expect(text).toContain('Portfolio demo');
    expect(text).toMatch(/Senior ML Engineer/i);
  });

  it('uses resume contact email', () => {
    expect(document.querySelector('[data-contact-email]')?.textContent).toBe(
      'venkata.ratnam.in17@gmail.com',
    );
  });

  it('renders projects from content into the portfolio section', () => {
    const rows = document.querySelectorAll('[data-projects-list] .project-row');
    expect(rows.length).toBe(portfolioContent.projects.length);
    expect(rows[0].textContent).toContain(portfolioContent.projects[0].title);
  });

  it('toggles FAQ panels with aria state', () => {
    const trigger = document.getElementById('faq-trigger-0');
    const panel = document.getElementById('faq-panel-0');
    expect(panel.hidden).toBe(true);
    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hidden).toBe(false);
  });

  it('shows contact validation errors on empty submit', () => {
    const form = document.querySelector('[data-contact-form]');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(document.querySelector('[data-error-for="name"]').textContent).not.toBe(
      '',
    );
    expect(document.querySelector('[data-error-for="email"]').textContent).not.toBe(
      '',
    );
    expect(
      document.querySelector('[data-error-for="message"]').textContent,
    ).not.toBe('');
  });

  it('includes SEO essentials in the source HTML', () => {
    expect(html).toMatch(/name=["']description["']/);
    expect(html).toMatch(/rel=["']canonical["']/);
    expect(html).toMatch(/application\/ld\+json/);
    expect(html).toMatch(/rel=["']manifest["']/);
  });

  it('marks reveal elements visible when reduced motion is preferred', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.remove('is-visible');
    });
    initReveal(document);
    document.querySelectorAll('.reveal').forEach((el) => {
      expect(el.classList.contains('is-visible')).toBe(true);
    });
  });
});
