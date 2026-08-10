import { describe, expect, it } from 'vitest';
import { portfolioContent } from '../../js/content.js';
import {
  renderEducation,
  renderExperience,
  renderFaq,
  renderProjects,
  renderResumeHighlights,
} from '../../js/render.js';

describe('portfolioContent shape', () => {
  it('exposes required profile fields for Analog IC brand', () => {
    expect(portfolioContent.profile.name).toBe('Venkata Ratnam Bhumireddy');
    expect(portfolioContent.profile.title).toMatch(/Analog IC/i);
    expect(portfolioContent.profile.availability).toBeTruthy();
    expect(portfolioContent.profile.pitch).toBeTruthy();
  });

  it('includes education, experience, projects, faq, resume, and contact', () => {
    expect(portfolioContent.education.length).toBeGreaterThanOrEqual(3);
    expect(portfolioContent.experience.length).toBeGreaterThan(0);
    expect(portfolioContent.projects.length).toBeGreaterThan(0);
    expect(portfolioContent.faq.length).toBeGreaterThan(0);
    expect(portfolioContent.resume.highlights.length).toBeGreaterThan(0);
    expect(portfolioContent.contact.email).toBe('venkata.ratnam.in17@gmail.com');
  });

  it('maps education to resume institutions', () => {
    const schools = portfolioContent.education.map((e) => e.school).join(' ');
    expect(schools).toMatch(/Dhirubhai Ambani|DA-IICT/i);
    expect(schools).toMatch(/GVP/i);
    expect(schools).toMatch(/Sri Venkateswara|SVU/i);
  });

  it('includes Vishay IC role and a labeled agentic portfolio demo', () => {
    const companies = portfolioContent.experience.map((e) => e.company).join(' ');
    expect(companies).toMatch(/Vishay/i);

    const demo = portfolioContent.experience.find((e) => e.kind === 'demo');
    expect(demo).toBeTruthy();
    expect(demo.label).toBe('Portfolio demo');
    expect(demo.role).toMatch(/Senior ML Engineer/i);
    expect(demo.role).toMatch(/Agentic/i);
  });

  it('uses real GitHub project URLs and hero media paths', () => {
    portfolioContent.projects.forEach((project) => {
      expect(project.githubUrl).toMatch(/^https:\/\/github\.com\/.+\//);
    });
    expect(portfolioContent.hero.videoUrl).toMatch(/\.mp4$/);
    expect(portfolioContent.hero.posterUrl).toMatch(/\.(jpg|jpeg|png|webp)$/i);
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

describe('renderExperience', () => {
  it('renders role, company, period, and portfolio-demo badge', () => {
    const html = renderExperience(portfolioContent.experience);
    portfolioContent.experience.forEach((entry) => {
      expect(html).toContain(entry.role);
      expect(html).toContain(entry.company);
      expect(html).toContain(entry.period);
    });
    expect(html).toContain('Portfolio demo');
    expect(html).toContain('experience-badge');
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

  it('includes optional project images when provided', () => {
    const withImage = portfolioContent.projects.find((p) => p.imageUrl);
    expect(withImage).toBeTruthy();
    const html = renderProjects(portfolioContent.projects);
    expect(html).toContain(withImage.imageUrl);
    expect(html).toContain('<img');
    expect(html).toContain(`alt="${withImage.title}"`);
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
