import { expect, test } from '@playwright/test';

test('renders the reset client shell', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/jarvis client/i);
  await expect(page.locator('h1')).toContainText('Jarvis Client');
  await expect(page.locator('body')).toContainText(
    'This app has been reset to a minimal Angular shell.'
  );
});
