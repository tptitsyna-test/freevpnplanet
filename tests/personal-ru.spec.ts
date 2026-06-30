import { expect, test } from '@playwright/test';

test.describe('Personal VPN RU checkout availability', () => {
  test('opens the RU purchase site from the task', async ({ page }) => {
    test.fixme( true, 'The task URL https://planetconfig.com/ returned ERR_NAME_NOT_RESOLVED during product review.');

    await page.goto('/');
    await expect(page).toHaveURL(/planetconfig\.com/);
    await expect(page.getByRole('button', { name: /pay|оплат/i })).toBeVisible();
  });
});
