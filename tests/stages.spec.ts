import { test, expect } from '@playwright/test';

test.describe('Stage completion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/אימייל/i).fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel(/סיסמה/i).fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: /התחברות/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  });

  test('mark the first stage as completed', async ({ page }) => {
    const projectTitle = `טסט שלב ${Date.now()}`;

    await page.goto('/projects/new');
    await page.locator('#title').fill(projectTitle);
    await page.getByRole('button', { name: 'צור פרויקט' }).click();
    await page.waitForURL(/\/projects\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { timeout: 15000 });
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'שלבים' }).click();
    await expect(page.getByText('בדיקת התכנות')).toBeVisible();

    const completedRow = page.getByRole('row').filter({ hasText: 'בוצע' });
    const checkbox = completedRow.getByRole('checkbox').first();
    await checkbox.click();
    await expect(checkbox).toBeChecked();

    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'שלבים' }).click();
    const completedRowAfterReload = page.getByRole('row').filter({ hasText: 'בוצע' });
    await expect(completedRowAfterReload.getByRole('checkbox').first()).toBeChecked();
  });
});
