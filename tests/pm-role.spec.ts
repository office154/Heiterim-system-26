import { test, expect } from '@playwright/test';

test.describe('PM role restrictions', () => {
  test('PM does not see financial data on a project', async ({ page }) => {
    const projectTitle = `טסט PM ${Date.now()}`;

    // Login as admin
    await page.goto('/login');
    await page.getByLabel(/אימייל/i).fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel(/סיסמה/i).fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole('button', { name: /התחברות/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

    // Create a project and assign PM Test as manager
    await page.goto('/projects/new');
    await page.locator('#title').fill(projectTitle);
    await page.getByRole('combobox').filter({ hasText: 'בחר מנהל פרויקט...' }).click();
    await page.getByRole('option', { name: 'PM Test' }).click();
    await page.getByRole('button', { name: 'צור פרויקט' }).click();
    await page.waitForURL(/\/projects\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, { timeout: 15000 });

    const projectUrl = page.url();

    // Logout as admin
    await page.getByRole('button', { name: 'התנתקות' }).click();
    await page.waitForURL((url) => url.pathname.includes('/login'), { timeout: 15000 });

    // Login as PM
    await page.getByLabel(/אימייל/i).fill(process.env.TEST_PM_EMAIL!);
    await page.getByLabel(/סיסמה/i).fill(process.env.TEST_PM_PASSWORD!);
    await page.getByRole('button', { name: /התחברות/i }).click();
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });

    // Go to the project as PM
    await page.goto(projectUrl);
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'שלבים' }).click();
    await expect(page.getByText('בדיקת התכנות')).toBeVisible();

    // Non-financial fields stay visible
    await expect(page.getByText('בוצע')).toBeVisible();
    await expect(page.getByText('תאריך')).toBeVisible();
    await expect(page.getByText('הערה')).toBeVisible();

    // Financial fields must not appear
    await expect(page.getByText('נשלחה חשבונית')).not.toBeVisible();
    await expect(page.getByText('שולם', { exact: true })).not.toBeVisible();
    await expect(page.getByText('מחיר')).not.toBeVisible();
    await expect(page.getByText('תשלום נוסף')).not.toBeVisible();
    await expect(page.getByText('סה״כ חוזה')).not.toBeVisible();
    await expect(page.getByText('סה״כ שולם')).not.toBeVisible();
    await expect(page.getByText('יתרה')).not.toBeVisible();
  });
});
