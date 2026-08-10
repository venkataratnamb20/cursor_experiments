/**
 * Application boot: render content sections and bind interactions.
 */

import { portfolioContent } from './content.js';
import {
  renderEducation,
  renderFaq,
  renderProjects,
  renderResumeHighlights,
} from './render.js';
import { initFaq } from './faq.js';
import { initNav } from './nav.js';
import { initContactForm } from './contact.js';
import { initReveal } from './reveal.js';

/**
 * Fill static profile text in the hero and about sections.
 */
function hydrateProfile() {
  const { profile, about, resume, contact } = portfolioContent;

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el && value) {
      el.textContent = value;
    }
  };

  setText('[data-profile-name]', profile.name);
  setText('[data-profile-title]', profile.title);
  setText('[data-profile-availability]', profile.availability);
  setText('[data-profile-pitch]', profile.pitch);

  const aboutBody = document.querySelector('[data-about-body]');
  if (aboutBody) {
    aboutBody.innerHTML = about.body
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join('');
  }

  const primaryCta = document.querySelector('[data-cta-primary]');
  if (primaryCta) {
    primaryCta.textContent = profile.primaryCta.label;
    primaryCta.setAttribute('href', profile.primaryCta.href);
  }

  const secondaryCta = document.querySelector('[data-cta-secondary]');
  if (secondaryCta) {
    secondaryCta.textContent = profile.secondaryCta.label;
    secondaryCta.setAttribute('href', profile.secondaryCta.href);
  }

  const resumeLink = document.querySelector('[data-resume-link]');
  if (resumeLink) {
    resumeLink.textContent = resume.label;
    resumeLink.setAttribute('href', resume.url);
  }

  const contactEmail = document.querySelector('[data-contact-email]');
  if (contactEmail) {
    contactEmail.textContent = contact.email;
    contactEmail.setAttribute('href', `mailto:${contact.email}`);
  }

  const socialList = document.querySelector('[data-social-links]');
  if (socialList) {
    socialList.innerHTML = contact.socials
      .map(
        (social) =>
          `<li><a class="text-link" href="${social.href}" rel="noopener noreferrer" target="_blank">${social.label}</a></li>`,
      )
      .join('');
  }

  const yearEl = document.querySelector('[data-year]');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
}

/**
 * Render dynamic lists into section containers.
 */
function renderDynamicSections() {
  const educationRoot = document.querySelector('[data-education-list]');
  if (educationRoot) {
    educationRoot.innerHTML = renderEducation(portfolioContent.education);
  }

  const projectsRoot = document.querySelector('[data-projects-list]');
  if (projectsRoot) {
    projectsRoot.innerHTML = renderProjects(portfolioContent.projects);
  }

  const faqRoot = document.querySelector('[data-faq]');
  if (faqRoot) {
    faqRoot.innerHTML = renderFaq(portfolioContent.faq);
  }

  const resumeRoot = document.querySelector('[data-resume-highlights]');
  if (resumeRoot) {
    resumeRoot.innerHTML = renderResumeHighlights(
      portfolioContent.resume.highlights,
    );
  }
}

function boot() {
  hydrateProfile();
  renderDynamicSections();
  initNav(document);
  initFaq(document.querySelector('[data-faq]'));
  initContactForm(
    document.querySelector('[data-contact-form]'),
    portfolioContent.contact.email,
  );
  initReveal(document);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
