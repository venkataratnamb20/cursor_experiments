import { expect, test } from '@playwright/test';

test.describe('portfolio SPA smoke', () => {
  test('loads hero and primary navigation landmarks', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Venkata Ratnam Bhumireddy',
    );
    await expect(page.locator('#home')).toBeVisible();
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#portfolio')).toBeVisible();
    await expect(page.locator('#faq')).toBeVisible();
  });

  test('renders projects from content data', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const projects = page.locator('[data-projects-list] .project-row');
    await expect(projects).toHaveCount(3);
    await expect(projects.first()).toContainText('Event-driven platform');
  });

  test('faq accordion opens and closes panels', async ({ page }) => {
    await page.goto('/#faq');
    await page.waitForLoadState('networkidle');

    const firstTrigger = page.locator('.faq-trigger').first();
    const firstPanel = page.locator('#faq-panel-0');

    await expect(firstPanel).toBeHidden();
    await firstTrigger.click();
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(firstPanel).toBeVisible();

    await firstTrigger.click();
    await expect(firstTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(firstPanel).toBeHidden();
  });

  test('contact form shows validation errors for empty submit', async ({
    page,
  }) => {
    await page.goto('/#contact');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.locator('[data-error-for="name"]')).not.toBeEmpty();
    await expect(page.locator('[data-error-for="email"]')).not.toBeEmpty();
    await expect(page.locator('[data-error-for="message"]')).not.toBeEmpty();
  });

  test('has SEO essentials in document head', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      /Venkata Ratnam Bhumireddy/,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
      1,
    );
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      'href',
      './manifest.webmanifest',
    );
  });
});
