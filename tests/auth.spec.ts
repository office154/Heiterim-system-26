import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

test.describe('Authentication', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('button', { name: /התחברות/i })).toBeVisible();
  });

  test('redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });

  test('login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/אימייל/i).fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel(/סיסמה/i).fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: /התחברות/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
    await expect(page).not.toHaveURL('/login');
  });
});
