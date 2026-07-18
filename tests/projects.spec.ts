import { test, expect } from '@playwright/test';

test.describe('Project creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/אימייל/i).fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel(/סיסמה/i).fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: /התחברות/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  });

  test('create new project with required fields only', async ({ page }) => {
    const projectTitle = `טסט פרויקט ${Date.now()}`;

    await page.goto('/projects/new');
    await expect(page).toHaveURL('/projects/new');

    await page.locator('#title').fill(projectTitle);
    await page.getByRole('button', { name: 'צור פרויקט' }).click();

    await page.waitForURL(/\/projects\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { timeout: 15000 });
    await expect(page.getByText(projectTitle)).toBeVisible();
  });
});
