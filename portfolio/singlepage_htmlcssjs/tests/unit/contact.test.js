import { describe, expect, it } from 'vitest';
import { buildMailtoUrl, validateContact } from '../../js/contact.js';

describe('validateContact', () => {
  it('rejects empty name, email, and message', () => {
    const result = validateContact({ name: '', email: '', message: '' });
    expect(result.success).toBe(false);
    expect(result.errors.name).toBeTruthy();
    expect(result.errors.email).toBeTruthy();
    expect(result.errors.message).toBeTruthy();
  });

  it('rejects invalid email format', () => {
    const result = validateContact({
      name: 'Alex',
      email: 'not-an-email',
      message: 'Hello, I would like to connect about a role.',
    });
    expect(result.success).toBe(false);
    expect(result.errors.email).toMatch(/valid email/i);
  });

  it('rejects message shorter than 10 characters', () => {
    const result = validateContact({
      name: 'Alex',
      email: 'alex@example.com',
      message: 'Hi there',
    });
    expect(result.success).toBe(false);
    expect(result.errors.message).toBeTruthy();
  });

  it('accepts valid contact input', () => {
    const result = validateContact({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      message: 'Hello, I would like to discuss a senior architecture role.',
    });
    expect(result.success).toBe(true);
    expect(result.errors).toEqual({});
  });
});

describe('buildMailtoUrl', () => {
  it('builds a mailto URL with subject and body', () => {
    const url = buildMailtoUrl('hire@example.com', {
      name: 'Alex',
      email: 'alex@example.com',
      message: 'Interested in collaborating.',
    });
    expect(url.startsWith('mailto:hire@example.com?')).toBe(true);
    expect(url).toContain('subject=');
    expect(url).toContain('body=');
    expect(decodeURIComponent(url)).toContain('Alex');
    expect(decodeURIComponent(url)).toContain('alex@example.com');
  });
});
