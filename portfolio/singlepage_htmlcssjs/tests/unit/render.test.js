import { describe, expect, it } from 'vitest';
import { portfolioContent } from '../../js/content.js';
import {
  renderEducation,
  renderFaq,
  renderProjects,
  renderResumeHighlights,
} from '../../js/render.js';

describe('portfolioContent shape', () => {
  it('exposes required profile fields', () => {
    expect(portfolioContent.profile.name).toBe('Venkata Ratnam Bhumireddy');
    expect(portfolioContent.profile.title).toBeTruthy();
    expect(portfolioContent.profile.availability).toBeTruthy();
    expect(portfolioContent.profile.pitch).toBeTruthy();
  });

  it('includes education, projects, faq, resume, and contact', () => {
    expect(portfolioContent.education.length).toBeGreaterThan(0);
    expect(portfolioContent.projects.length).toBeGreaterThan(0);
    expect(portfolioContent.faq.length).toBeGreaterThan(0);
    expect(portfolioContent.resume.highlights.length).toBeGreaterThan(0);
    expect(portfolioContent.contact.email).toContain('@');
  });
});

describe('renderEducation', () => {
  it('renders each education entry as a list item with school and degree', () => {
    const html = renderEducation(portfolioContent.education);
    portfolioContent.education.forEach((entry) => {
      expect(html).toContain(entry.school);
      expect(html).toContain(entry.degree);
    });
    expect(html).toContain('<li');
  });
});

describe('renderProjects', () => {
  it('renders project titles, summaries, and tags', () => {
    const html = renderProjects(portfolioContent.projects);
    portfolioContent.projects.forEach((project) => {
      expect(html).toContain(project.title);
      expect(html).toContain(project.summary);
      project.tags.forEach((tag) => {
        expect(html).toContain(tag);
      });
    });
  });
});

describe('renderFaq', () => {
  it('renders FAQ questions with accordion buttons and panels', () => {
    const html = renderFaq(portfolioContent.faq);
    portfolioContent.faq.forEach((item, index) => {
      expect(html).toContain(item.question);
      expect(html).toContain(item.answer);
      expect(html).toContain(`aria-controls="faq-panel-${index}"`);
      expect(html).toContain('aria-expanded="false"');
    });
  });
});

describe('renderResumeHighlights', () => {
  it('renders resume highlight bullets', () => {
    const html = renderResumeHighlights(portfolioContent.resume.highlights);
    portfolioContent.resume.highlights.forEach((item) => {
      expect(html).toContain(item);
    });
  });
});
