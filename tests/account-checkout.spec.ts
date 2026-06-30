import { test } from '@playwright/test';
import { acceptCookiesIfVisible } from './helpers/cookies';
import { uniqueEmail } from './helpers/test-data';
import { AccountCheckoutPage } from './pages/account-checkout.page';

test.describe('Account subscription checkout', () => {
  let checkout: AccountCheckoutPage;

  test.beforeEach(async ({ page }) => {
    checkout = new AccountCheckoutPage(page);
    await checkout.gotoOrder();
    await acceptCookiesIfVisible(page);
  });

  test('reaches checkout from Sign Up and selects credit card payment method', async ({ page }) => {
    const email = uniqueEmail('account.signup.card');

    await checkout.gotoLogin();
    await acceptCookiesIfVisible(page);

    await checkout.openFromSignUp();
    await checkout.passEmailStep(email);
    await checkout.selectPaymentMethod('card');
  });

  test('reaches checkout from Sign Up and selects cryptocurrency payment method', async ({ page }) => {
    const email = uniqueEmail('account.signup.crypto');

    await checkout.gotoLogin();
    await acceptCookiesIfVisible(page);

    await checkout.openFromSignUp();
    await checkout.passEmailStep(email);
    await checkout.selectPaymentMethod('crypto');
    await checkout.expectCryptoAgeBadgeVisible();
  });

  test('shows required checkout controls and order summary', async () => {
    await checkout.passEmailStep(uniqueEmail('account.summary'));

    await checkout.expectPaymentMethodsVisible();
    await checkout.expectOrderSummaryVisible();
  });

  test('keeps credit card checkout ready after valid email is entered', async ({ page }) => {
    const email = uniqueEmail('account.card');

    await checkout.passEmailStep(email);

    await checkout.selectPaymentMethod('card');
    await checkout.expectLegalLinksVisible();
  });

  test('keeps cryptocurrency checkout ready after valid email is entered', async ({ page }) => {
    const email = uniqueEmail('account.crypto');

    await checkout.passEmailStep(email);

    await checkout.selectPaymentMethod('crypto');
    await checkout.expectCryptoAgeBadgeVisible();
  });

  test('does not lose entered email when payment method is switched', async () => {
    const email = uniqueEmail('account.switch');

    await checkout.passEmailStep(email);
    await checkout.expectEnteredEmail(email);

    await checkout.selectPaymentMethod('crypto');
    await checkout.expectPaymentMethodSelected('crypto');
    await checkout.expectEnteredEmail(email);

    await checkout.selectPaymentMethod('card');
    await checkout.expectPaymentMethodSelected('card');
    await checkout.expectEnteredEmail(email);
  });

  test('creates external Stripe checkout link after Get your subscription is clicked', async () => {
    const email = uniqueEmail('account.final.card');

    await checkout.passEmailStep(email);
    const orderTotal = await checkout.readTotal();
    await checkout.selectPaymentMethod('card');

    await checkout.submitSubscription();
    await checkout.expectStripeCheckout(email, orderTotal);
  });

  test('creates external crypto payment link after Get your subscription is clicked', async () => {
    await checkout.passEmailStep(uniqueEmail('account.final.crypto'));
    const orderTotal = await checkout.readTotal();
    await checkout.selectPaymentMethod('crypto');

    await checkout.submitSubscription();
    await checkout.expectCryptoCheckout(orderTotal);
  });
});
