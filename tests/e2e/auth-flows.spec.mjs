import { test, expect } from '@playwright/test';

test.describe('Public auth flows', () => {
  test('login page renders and shows main actions', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'התחברות' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'התחברות' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'שכחת סיסמה?' })).toBeVisible();
  });

  test('login form blocks empty submit with validation message', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: 'התחברות' }).click();

    await expect(page.getByText('יש למלא את כל השדות', { exact: false })).toBeVisible();
  });

  test('forgot-password page enforces valid email format', async ({ page }) => {
    await page.goto('/forgot-password');

    const emailInput = page.getByLabel('דוא״ל');
    await emailInput.fill('invalid-email');
    await page.getByRole('button', { name: 'שלח קישור איפוס' }).click();

    await expect(page.locator('#forgot-email:invalid')).toHaveCount(1);
  });

  test('reset-password page validates mismatched passwords', async ({ page }) => {
    await page.goto('/reset-password/test-token');

    await page.getByLabel('סיסמה חדשה').fill('123456');
    await page.getByLabel('אשר סיסמה').fill('654321');
    await page.getByRole('button', { name: 'שנה סיסמה' }).click();

    await expect(page.getByText('הסיסמאות לא תואמות')).toBeVisible();
  });
});
