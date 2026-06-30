import type { Page } from '@playwright/test';

export async function acceptCookiesIfVisible(page: Page): Promise<void> {
  const acceptButton = page.getByRole('button', { name: /^accept$/i });

  if (await acceptButton.isVisible().catch(() => false)) {
    await acceptButton.click({ timeout: 2_000 }).catch(() => undefined);
  }
}
