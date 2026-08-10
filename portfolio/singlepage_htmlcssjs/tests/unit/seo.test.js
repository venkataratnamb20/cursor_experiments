import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { absoluteUrl, hydrateSeo, normalizeOrigin } from '../../js/seo.js';
import { portfolioContent } from '../../js/content.js';

describe('seo helpers', () => {
  it('normalizes origin without trailing slash', () => {
    expect(normalizeOrigin('https://example.com/')).toBe('https://example.com');
    expect(normalizeOrigin('https://example.com')).toBe('https://example.com');
  });

  it('builds absolute URLs from origin + path', () => {
    expect(absoluteUrl('https://example.com/', '/assets/og.svg')).toBe(
      'https://example.com/assets/og.svg',
    );
  });

  it('exposes site.origin on portfolio content', () => {
    expect(portfolioContent.site.origin).toMatch(/^https?:\/\//);
    expect(portfolioContent.site.ogImagePath).toMatch(/^\//);
  });

  it('hydrates canonical, og:url, og:image, and JSON-LD url', () => {
    const dom = new JSDOM(`<!DOCTYPE html><html><head>
      <link rel="canonical" href="https://old.example/" />
      <meta property="og:url" content="https://old.example/" />
      <meta property="og:image" content="https://old.example/x.png" />
      <script type="application/ld+json">{"@type":"Person","url":"https://old.example/","jobTitle":"X"}</script>
    </head><body></body></html>`);

    hydrateSeo(
      dom.window.document,
      { origin: 'https://portfolio.example', ogImagePath: '/assets/og-default.svg' },
      { name: 'Venkata Ratnam Bhumireddy', title: 'Staff Analog IC Design Engineer' },
      { email: 'venkata.ratnam.in17@gmail.com' },
    );

    expect(
      dom.window.document.querySelector('link[rel="canonical"]').getAttribute('href'),
    ).toBe('https://portfolio.example/');
    expect(
      dom.window.document
        .querySelector('meta[property="og:url"]')
        .getAttribute('content'),
    ).toBe('https://portfolio.example/');
    expect(
      dom.window.document
        .querySelector('meta[property="og:image"]')
        .getAttribute('content'),
    ).toBe('https://portfolio.example/assets/og-default.svg');

    const data = JSON.parse(
      dom.window.document.querySelector('script[type="application/ld+json"]')
        .textContent,
    );
    expect(data.url).toBe('https://portfolio.example/');
    expect(data.jobTitle).toBe('Staff Analog IC Design Engineer');
    expect(data.email).toBe('mailto:venkata.ratnam.in17@gmail.com');
  });
});
