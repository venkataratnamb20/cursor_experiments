import { describe, expect, it, beforeEach } from 'vitest';
import { initNav } from '../../js/nav.js';

function mountNav() {
  document.body.innerHTML = `
    <header>
      <button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav" data-nav-toggle>Menu</button>
      <nav id="site-nav" class="site-nav" data-nav hidden>
        <a href="#home">Home</a>
        <a href="#about">About</a>
      </nav>
    </header>
    <main>
      <section id="home"></section>
      <section id="about"></section>
    </main>
  `;
}

describe('initNav', () => {
  beforeEach(() => {
    mountNav();
  });

  it('toggles mobile nav visibility and aria-expanded', () => {
    initNav(document);
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');
    expect(nav.hidden).toBe(true);
    toggle.click();
    expect(nav.hidden).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    toggle.click();
    expect(nav.hidden).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes mobile nav when a nav link is clicked', () => {
    initNav(document);
    const toggle = document.querySelector('[data-nav-toggle]');
    const nav = document.querySelector('[data-nav]');
    toggle.click();
    nav.querySelector('a[href="#about"]').click();
    expect(nav.hidden).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});
