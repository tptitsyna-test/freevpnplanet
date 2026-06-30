import { expect, test } from '@playwright/test';
import { acceptCookiesIfVisible } from './helpers/cookies';
import { uniqueEmail } from './helpers/test-data';
import { AccountCheckoutPage } from './pages/account-checkout.page';

test.describe('Marketing navigation to account checkout', () => {
  test('opens login from the marketing site and creates a checkout link from Sign Up', async ({ page }) => {
    const checkout = new AccountCheckoutPage(page);
    const email = uniqueEmail('marketing.signup.card');

    await page.goto('/');
    await expect(page).toHaveURL(/freevpnplanet\.com\/?$/);
    await expect(page).toHaveTitle(/Free VPN Proxy by Planet VPN/i);
    await expect(page.getByRole('link', { name: /log in/i })).toBeVisible();

    await page.getByRole('link', { name: /log in/i }).click();
    await expect(page).toHaveURL(/account\.freevpnplanet\.com\/login\/?$/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/^email$/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();

    await acceptCookiesIfVisible(page);
    await checkout.openFromSignUp();
    await checkout.passEmailStep(email);
    const orderTotal = await checkout.readTotal();

    await checkout.selectPaymentMethod('card');
    await checkout.submitSubscription();
    await checkout.expectStripeCheckout(email, orderTotal);
  });
});
