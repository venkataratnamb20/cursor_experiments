import { describe, expect, it, beforeEach } from 'vitest';
import { initFaq } from '../../js/faq.js';

function mountFaq() {
  document.body.innerHTML = `
    <div class="faq-list" data-faq>
      <div class="faq-item">
        <button type="button" class="faq-trigger" aria-expanded="false" aria-controls="faq-panel-0" id="faq-trigger-0">Q1</button>
        <div class="faq-panel" id="faq-panel-0" hidden>A1</div>
      </div>
      <div class="faq-item">
        <button type="button" class="faq-trigger" aria-expanded="false" aria-controls="faq-panel-1" id="faq-trigger-1">Q2</button>
        <div class="faq-panel" id="faq-panel-1" hidden>A2</div>
      </div>
    </div>
  `;
  return document.querySelector('[data-faq]');
}

describe('initFaq', () => {
  beforeEach(() => {
    mountFaq();
  });

  it('opens a panel when its trigger is clicked', () => {
    const root = document.querySelector('[data-faq]');
    initFaq(root);
    const trigger = document.getElementById('faq-trigger-0');
    const panel = document.getElementById('faq-panel-0');
    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hidden).toBe(false);
  });

  it('closes the previously open panel when another opens', () => {
    const root = document.querySelector('[data-faq]');
    initFaq(root);
    const first = document.getElementById('faq-trigger-0');
    const second = document.getElementById('faq-trigger-1');
    const panel0 = document.getElementById('faq-panel-0');
    const panel1 = document.getElementById('faq-panel-1');

    first.click();
    second.click();

    expect(first.getAttribute('aria-expanded')).toBe('false');
    expect(panel0.hidden).toBe(true);
    expect(second.getAttribute('aria-expanded')).toBe('true');
    expect(panel1.hidden).toBe(false);
  });

  it('toggles the same panel closed on second click', () => {
    const root = document.querySelector('[data-faq]');
    initFaq(root);
    const trigger = document.getElementById('faq-trigger-0');
    const panel = document.getElementById('faq-panel-0');
    trigger.click();
    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(panel.hidden).toBe(true);
  });
});
